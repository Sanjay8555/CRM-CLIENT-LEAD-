import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("crm.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    citizen_name TEXT,
    citizen_contact TEXT,
    category TEXT,
    description TEXT,
    urgency TEXT,
    status TEXT,
    latitude REAL,
    longitude REAL,
    department_name TEXT,
    officer_name TEXT,
    resolution_feedback TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS officers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    department_id INTEGER,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  );
`);

// Migration: Add resolution_feedback if missing
try {
  db.prepare("ALTER TABLE complaints ADD COLUMN resolution_feedback TEXT").run();
} catch (e) {
  // Column already exists or table doesn't exist yet
}

// Seed Departments and Officers if empty
const deptCount = db.prepare("SELECT COUNT(*) as count FROM departments").get().count;
if (deptCount === 0) {
  const depts = ["Roads & Bridges", "Water Supply", "Sanitation", "Electricity", "Public Safety", "Health"];
  const tamilNames = [
    ["Arun Pandian", "Senthil Kumar"],
    ["Meenakshi Sundaram", "Rajeshwari"],
    ["Karthikeyan", "Thamarai Selvan"],
    ["Anbarasan", "Vijayalakshmi"],
    ["Muthuvel Karunanidhi", "Priya Dharshini"],
    ["Selvam", "Kavitha"]
  ];
  const insertDept = db.prepare("INSERT INTO departments (name) VALUES (?)");
  const insertOfficer = db.prepare("INSERT INTO officers (name, department_id) VALUES (?, ?)");
  
  depts.forEach((name, index) => {
    const result = insertDept.run(name);
    const deptId = result.lastInsertRowid;
    const names = tamilNames[index] || ["Officer 1", "Officer 2"];
    names.forEach(officerName => {
      insertOfficer.run(officerName, deptId);
    });
  });
}

// Migration: Update generic officer names to Tamil names if they exist
const existingOfficers = db.prepare("SELECT * FROM officers WHERE name LIKE 'Officer %'").all();
if (existingOfficers.length > 0) {
  const tamilNamesList = [
    "Arun Pandian", "Senthil Kumar", "Meenakshi Sundaram", "Rajeshwari", 
    "Karthikeyan", "Thamarai Selvan", "Anbarasan", "Vijayalakshmi",
    "Muthuvel", "Priya Dharshini", "Selvam", "Kavitha"
  ];
  const updateStmt = db.prepare("UPDATE officers SET name = ? WHERE id = ?");
  existingOfficers.forEach((off, idx) => {
    updateStmt.run(tamilNamesList[idx % tamilNamesList.length], off.id);
  });
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/departments", (req, res) => {
    const depts = db.prepare("SELECT * FROM departments").all();
    res.json(depts);
  });

  app.get("/api/officers", (req, res) => {
    const officers = db.prepare(`
      SELECT o.*, d.name as department_name 
      FROM officers o 
      JOIN departments d ON o.department_id = d.id
    `).all();
    res.json(officers);
  });

  app.get("/api/complaints", (req, res) => {
    const complaints = db.prepare("SELECT * FROM complaints ORDER BY created_at DESC").all();
    res.json(complaints);
  });

  app.get("/api/complaints/:id", (req, res) => {
    const complaint = db.prepare("SELECT * FROM complaints WHERE id = ?").get(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Not found" });
    res.json(complaint);
  });

  app.patch("/api/complaints/:id", (req, res) => {
    const { status, department_name, officer_name, resolution_feedback } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE complaints 
      SET status = COALESCE(?, status), 
          department_name = COALESCE(?, department_name), 
          officer_name = COALESCE(?, officer_name),
          resolution_feedback = COALESCE(?, resolution_feedback),
          updated_at = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(status, department_name, officer_name, resolution_feedback, now, req.params.id);
    
    if (result.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.post("/api/complaints", async (req, res) => {
    const { citizen_name, citizen_contact, description, latitude, longitude } = req.body;
    const id = `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    let category = "General";
    let urgency = "Medium";

    // AI Classification
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `
        Classify the following municipal complaint into a category and urgency level.
        Categories: Road, Water, Sanitation, Electricity, Public Safety, Others.
        Urgency: Critical, High, Medium, Low.
        
        Complaint: "${description}"
        
        Return ONLY a JSON object like: {"category": "Road", "urgency": "High"}
      `;
      
      const aiResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const result = JSON.parse(aiResponse.text || "{}");
      category = result.category || "General";
      urgency = result.urgency || "Medium";
    } catch (err) {
      console.error("AI Classification failed:", err);
    }

    const stmt = db.prepare(`
      INSERT INTO complaints (id, citizen_name, citizen_contact, category, description, urgency, status, latitude, longitude, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, citizen_name, citizen_contact, category, description, urgency, "Registered", latitude, longitude, now, now);

    res.json({ success: true, complaintId: id });
  });

  app.get("/api/stats", (req, res) => {
    const total = db.prepare("SELECT COUNT(*) as count FROM complaints").get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'").get().count;
    const pending = total - resolved;

    const byCategory = db.prepare("SELECT category, COUNT(*) as count FROM complaints GROUP BY category").all();
    const byStatus = db.prepare("SELECT status, COUNT(*) as count FROM complaints GROUP BY status").all();

    res.json({
      total,
      resolved,
      pending,
      byCategory,
      byStatus
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
