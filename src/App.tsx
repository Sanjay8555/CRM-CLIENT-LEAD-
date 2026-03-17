import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  MapPin, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  Filter,
  BarChart3,
  Bell,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Globe,
  LogOut,
  UserCheck,
  ClipboardList,
  ArrowLeft,
  User,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Complaint, Stats, Department, Officer } from './types';
import * as XLSX from 'xlsx';

// --- Components ---

const ComplaintModal = ({ 
  complaint, 
  departments, 
  officers, 
  onClose, 
  onUpdate,
  isOfficerMode = false
}: { 
  complaint: Complaint; 
  departments: Department[]; 
  officers: Officer[]; 
  onClose: () => void; 
  onUpdate: (id: string, data: any) => void; 
  isOfficerMode?: boolean;
}) => {
  const [status, setStatus] = useState(complaint.status);
  const [dept, setDept] = useState(complaint.department_name || '');
  const [officer, setOfficer] = useState(complaint.officer_name || '');
  const [feedback, setFeedback] = useState(complaint.resolution_feedback || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOfficers = officers.filter(o => o.department_name === dept);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          department_name: dept,
          officer_name: officer,
          resolution_feedback: feedback
        })
      });
      if (res.ok) {
        onUpdate(complaint.id, { status, department_name: dept, officer_name: officer, resolution_feedback: feedback });
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">{isOfficerMode ? 'Update Task' : 'Manage Case'}</h3>
            <p className="text-zinc-500 text-xs font-mono mt-1">{complaint.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Update Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-all"
            >
              <option value="Registered">Registered</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Approval">Awaiting Approval</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          {!isOfficerMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Assign Department</label>
                <select 
                  value={dept}
                  onChange={(e) => {
                    setDept(e.target.value);
                    setOfficer(''); // Reset officer when dept changes
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Assign Officer</label>
                <select 
                  value={officer}
                  disabled={!dept}
                  onChange={(e) => setOfficer(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                >
                  <option value="">Select Officer</option>
                  {filteredOfficers.map(o => (
                    <option key={o.id} value={o.name}>{o.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Complaint Summary</h4>
            <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">{complaint.description}</p>
          </div>

          {status === 'Resolved' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Resolution Feedback</label>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Enter resolution details or citizen feedback..."
              />
            </div>
          )}
        </div>

        <div className="p-8 bg-zinc-950/50 border-t border-zinc-800 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold text-zinc-400 hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isUpdating}
            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUpdating ? <Clock className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            {isUpdating ? 'Saving...' : 'Update Case'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ role, user, activeTab, setActiveTab, onLogout, onStaffLogin }: any) => {
  const isAdmin = role === 'admin';
  const isOfficer = role === 'officer';
  const isCitizen = role === 'citizen';
  const isDark = isAdmin || isOfficer;
  
  return (
    <nav className={`border-b sticky top-0 z-50 transition-colors duration-500 backdrop-blur-md ${isDark ? 'bg-zinc-950/80 border-zinc-800 text-white' : 'bg-white/80 border-zinc-200 text-zinc-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold transition-transform hover:rotate-6 ${isDark ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-indigo-600 shadow-lg shadow-indigo-600/10'}`}>
                <ShieldCheck size={20} />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>PS-CRM</span>
                <span className={`text-[10px] font-medium uppercase tracking-widest opacity-50 ${isDark ? 'text-zinc-400' : 'text-zinc-50'}`}>
                  {isAdmin ? 'Command Center' : isOfficer ? 'Officer Portal' : 'Citizen Portal'}
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {(isAdmin ? ['dashboard', 'complaints', 'analytics'] : isOfficer ? ['my-tasks', 'history'] : ['report', 'track', 'faq']).map((tab) => (
                <motion.button 
                  key={tab}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? (isDark ? 'text-indigo-400' : 'text-indigo-700') 
                      : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-900')
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-lg -z-10 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user && !isCitizen && (
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user.name}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">{role}</span>
              </div>
            )}
            
            {isCitizen ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStaffLogin}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center gap-2"
              >
                <ShieldCheck size={14} />
                Staff Login
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLogout}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 ${
                  isDark 
                    ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-700' 
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                <LogOut size={14} />
                Logout
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const RoleSelector = ({ onSelect }: { onSelect: (role: 'citizen' | 'admin' | 'officer', user?: any) => void }) => {
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'admin' | 'officer' | null>(null);
  const [password, setPassword] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedRole === 'admin') {
      if (password === 'admin123') {
        onSelect('admin', { name: 'Super Admin' });
      } else {
        setError('Invalid admin password');
      }
    } else if (selectedRole === 'officer') {
      if (password === 'officer123' && officerName.trim()) {
        onSelect('officer', { name: officerName });
      } else {
        setError('Please enter name and correct password');
      }
    } else if (selectedRole === 'citizen') {
      if (citizenName.trim()) {
        onSelect('citizen', { name: citizenName });
      } else {
        setError('Please enter your name');
      }
    }
  };

  if (selectedRole) {
    const isDark = selectedRole === 'admin' || selectedRole === 'officer';
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md p-8 rounded-[2.5rem] border shadow-2xl ${isDark ? 'bg-zinc-900 border-zinc-800 shadow-indigo-500/10' : 'bg-white border-zinc-100 shadow-zinc-200/50'}`}
        >
          <button 
            onClick={() => { setSelectedRole(null); setPassword(''); setError(''); }}
            className="mb-8 text-zinc-500 hover:text-indigo-500 flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <ArrowLeft size={16} /> Back to Roles
          </button>

          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              {selectedRole === 'admin' ? <ShieldCheck size={32} /> : selectedRole === 'officer' ? <UserCheck size={32} /> : <User size={32} />}
            </div>
            <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login
            </h2>
            <p className="text-zinc-500 text-sm mt-2">Secure access to the {selectedRole} portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {(selectedRole === 'citizen' || selectedRole === 'officer') && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text"
                  required
                  value={selectedRole === 'citizen' ? citizenName : officerName}
                  onChange={(e) => selectedRole === 'citizen' ? setCitizenName(e.target.value) : setOfficerName(e.target.value)}
                  className={`w-full rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDark ? 'bg-zinc-950 border-zinc-800 text-white border' : 'bg-zinc-50 border-zinc-200 text-zinc-900 border'}`}
                  placeholder="Enter your name"
                />
              </div>
            )}

            {(selectedRole === 'admin' || selectedRole === 'officer') && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDark ? 'bg-zinc-950 border-zinc-800 text-white border' : 'bg-zinc-50 border-zinc-200 text-zinc-900 border'}`}
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              Sign In <ChevronRight size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-indigo-600/20">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight mb-4">Smart Public Service CRM</h1>
        <p className="text-zinc-500 text-lg max-w-xl mx-auto">A centralized, AI-driven digital command center for modern governance and citizen engagement.</p>
      </motion.div>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -8, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)" }}
          onClick={() => setSelectedRole('citizen')}
          className="bg-zinc-50 p-10 rounded-[2.5rem] border border-zinc-100 cursor-pointer group transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="w-14 h-14 bg-white shadow-sm text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
            <Smartphone size={28} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-3 tracking-tight">Citizen Portal</h2>
          <p className="text-zinc-500 mb-8 leading-relaxed text-sm">Report issues, track progress, and engage with your city.</p>
          <div className="flex items-center text-indigo-600 font-bold gap-2">
            Enter Portal <ChevronRight size={20} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)" }}
          onClick={() => setSelectedRole('officer')}
          className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 cursor-pointer group transition-all relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="w-14 h-14 bg-zinc-800 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
            <UserCheck size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Officer Portal</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed text-sm">Access assigned tasks, update status, and communicate resolutions.</p>
          <div className="flex items-center text-indigo-400 font-bold gap-2">
            Officer Login <ChevronRight size={20} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -8, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          onClick={() => setSelectedRole('admin')}
          className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 cursor-pointer group transition-all relative overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          <div className="w-14 h-14 bg-zinc-800 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
            <LayoutDashboard size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Command Center</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed text-sm">Manage city operations, analyze trends, and oversee departments.</p>
          <div className="flex items-center text-indigo-400 font-bold gap-2">
            Admin Access <ChevronRight size={20} />
          </div>
        </motion.div>
      </div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-zinc-400 text-[10px] font-bold tracking-widest uppercase"
      >
        Powered by AI Studio & Gemini
      </motion.p>
    </div>
  );
};

const CitizenPortal = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const view = activeTab === 'track' ? 'track' : activeTab === 'faq' ? 'faq' : 'submit';
  
  const [formData, setFormData] = useState({
    citizen_name: '',
    citizen_contact: '',
    description: '',
    latitude: 12.9716,
    longitude: 77.5946,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [trackId, setTrackId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);
  const [isTrackLoading, setIsTrackLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedId(data.complaintId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTrackLoading(true);
    setTrackedComplaint(null);
    try {
      const res = await fetch(`/api/complaints/${trackId}`);
      if (!res.ok) {
        throw new Error('Complaint not found');
      }
      const data = await res.json();
      setTrackedComplaint(data);
    } catch (err) {
      console.error(err);
      alert("Tracking ID not found. Please check and try again.");
    } finally {
      setIsTrackLoading(false);
    }
  };

  if (submittedId) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[2rem] shadow-2xl border border-emerald-100 text-center"
      >
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 mb-3">Submission Successful</h2>
        <p className="text-zinc-500 mb-8 leading-relaxed">Your tracking ID is <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{submittedId}</span>. Please save this for future reference.</p>
        <button 
          onClick={() => setSubmittedId(null)}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
        >
          Submit Another Request
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-zinc-900 tracking-tight mb-6 leading-[1.1]">
              {view === 'submit' ? 'Report a Public Issue' : 'Track Your Request'}
            </h1>
            <p className="text-xl text-zinc-500 mb-12 leading-relaxed">
              {view === 'submit' 
                ? 'Help us improve your city. Submit grievances directly to the municipal corporation for AI-powered routing and resolution.'
                : 'Monitor the real-time status of your reported issues and see resolution progress from assigned departments.'}
            </p>
            
            <div className="space-y-8 mb-12">
              {[
                { icon: Smartphone, title: 'Multi-Channel Intake', desc: 'Register via Web, Mobile App, WhatsApp, or IVR.' },
                { icon: ShieldCheck, title: 'Real-time Tracking', desc: 'Monitor resolution progress with live status updates.' },
                { icon: Globe, title: 'Multilingual Support', desc: 'Submit complaints in your preferred regional language.' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex gap-5"
                >
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-100/50">
                    <item.icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg mb-1">{item.title}</h3>
                    <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-fit">
              <button 
                onClick={() => setActiveTab('report')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === 'submit' ? 'bg-white shadow-md text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                New Complaint
              </button>
              <button 
                onClick={() => setActiveTab('track')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === 'track' ? 'bg-white shadow-md text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                Track Status
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 bg-white p-10 rounded-[2.5rem] shadow-xl border border-zinc-100"
        >
          {view === 'submit' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    placeholder="John Doe"
                    value={formData.citizen_name}
                    onChange={e => setFormData({...formData, citizen_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 ml-1">Contact Number</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    placeholder="+91 98765 43210"
                    value={formData.citizen_contact}
                    onChange={e => setFormData({...formData, citizen_contact: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 ml-1">Complaint Description</label>
                <textarea 
                  required
                  rows={5}
                  className="w-full px-5 py-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="Please provide specific details about the issue, location, and any relevant context..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="p-5 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 flex items-center justify-between group cursor-pointer hover:bg-zinc-100 transition-all">
                <div className="flex items-center gap-3 text-zinc-500">
                  <MapPin size={20} className="group-hover:text-indigo-600 transition-colors" />
                  <span className="text-sm font-bold">Auto-detecting Location...</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">GPS Enabled</div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? <Clock className="animate-spin" size={20} /> : <Plus size={20} />}
                {isSubmitting ? 'Processing Request...' : 'Submit Official Complaint'}
              </motion.button>
            </form>
          ) : view === 'track' ? (
            <div className="space-y-8">
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 ml-1">Tracking ID</label>
                  <div className="flex gap-3">
                    <input 
                      required
                      type="text" 
                      className="flex-1 px-5 py-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-lg"
                      placeholder="TKT-XXXXXX"
                      value={trackId}
                      onChange={e => setTrackId(e.target.value.toUpperCase())}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isTrackLoading}
                      className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                    >
                      {isTrackLoading ? <Clock className="animate-spin" size={24} /> : <Search size={24} />}
                    </motion.button>
                  </div>
                </div>
              </form>

              {trackedComplaint && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                      trackedComplaint.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {trackedComplaint.urgency} Priority
                    </span>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-3">Resolution Status</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-indigo-600 animate-ping" />
                      <span className="text-2xl font-bold text-zinc-900">{trackedComplaint.status}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Department</p>
                        <p className="font-bold text-zinc-900">{trackedComplaint.department_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Registered</p>
                        <p className="font-bold text-zinc-900">{new Date(trackedComplaint.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-zinc-900">Frequently Asked Questions</h3>
              <div className="space-y-6">
                {[
                  { q: "How long does it take to resolve a complaint?", a: "Resolution time varies by category. Critical issues are typically addressed within 24-48 hours, while general maintenance may take 5-7 business days." },
                  { q: "Can I upload photos with my complaint?", a: "Yes, our mobile app and WhatsApp integration support photo uploads. The web portal will soon be updated with this feature." },
                  { q: "How is my complaint assigned to a department?", a: "Our AI engine analyzes your description and automatically routes the ticket to the most relevant municipal department for faster action." },
                  { q: "What should I do if my issue isn't resolved?", a: "You can use the 'Support' button in the footer to contact our escalation team if your ticket remains open beyond the SLA period." }
                ].map((faq, i) => (
                  <div key={i} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <h4 className="font-bold text-zinc-900 mb-2 flex gap-3">
                      <span className="text-indigo-600">Q.</span> {faq.q}
                    </h4>
                    <p className="text-zinc-600 text-sm leading-relaxed pl-7">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const OfficerDashboard = ({ user, activeTab }: { user: any, activeTab: string }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      // Filter complaints assigned to this officer
      const myTasks = data.filter((c: Complaint) => c.officer_name === user.name);
      setComplaints(myTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user.name]);

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      fetchTasks();
      setEditingComplaint(null);
    } catch (err) {
      console.error(err);
    }
  };

  const renderTasks = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">My Tasks</h1>
          <p className="text-zinc-500">Manage and resolve your assigned complaints</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pending Tasks</p>
            <p className="text-2xl font-bold text-white">{complaints.filter(c => c.status !== 'Resolved').length}</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="text-right">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Resolved</p>
            <p className="text-2xl font-bold text-indigo-400">{complaints.filter(c => c.status === 'Resolved').length}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Clock className="animate-spin text-indigo-500" size={48} />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-20 text-center">
          <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-600 mx-auto mb-6">
            <ClipboardList size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No tasks assigned</h2>
          <p className="text-zinc-500">You don't have any complaints assigned to you at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {complaints.map((complaint) => (
            <motion.div 
              key={complaint.id}
              whileHover={{ y: -4 }}
              onClick={() => setEditingComplaint(complaint)}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 cursor-pointer hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    complaint.urgency === 'Critical' ? 'bg-red-500/10 text-red-500' :
                    complaint.urgency === 'High' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {complaint.urgency}
                  </div>
                  <span className="text-zinc-600 text-xs font-mono">{complaint.id}</span>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  complaint.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                  complaint.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {complaint.status}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{complaint.category}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">{complaint.description}</p>
              <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <Clock size={14} />
                  <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                  View Details <ChevronRight size={16} />
                </div>
              </div>
              
              {complaint.status !== 'Resolved' && (
                <div className="mt-6 pt-6 border-t border-zinc-800/50 flex justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingComplaint({ ...complaint, status: 'Resolved' });
                    }}
                    className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Complete Task
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {editingComplaint && (
        <ComplaintModal 
          complaint={editingComplaint}
          departments={[]}
          officers={[]}
          onClose={() => setEditingComplaint(null)}
          onUpdate={handleUpdate}
          isOfficerMode={true}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      {activeTab === 'my-tasks' && renderTasks()}
      {activeTab === 'history' && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Resolution History</h1>
              <p className="text-zinc-500">Review your successfully resolved citizen grievances</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <div>
                <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Total Resolved</p>
                <p className="text-2xl font-bold text-emerald-500">{complaints.filter(c => c.status === 'Resolved').length}</p>
              </div>
            </div>
          </div>

          {complaints.filter(c => c.status === 'Resolved').length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-20 text-center">
              <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-600 mx-auto mb-6">
                <History size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No history yet</h2>
              <p className="text-zinc-500">Once you resolve tasks, they will appear here for your records.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {complaints.filter(c => c.status === 'Resolved').map(c => (
                <motion.div 
                  key={c.id} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-6">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={24} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-zinc-600 text-xs font-mono bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{c.id}</span>
                    <span className="text-zinc-500 text-xs font-medium">{new Date(c.updated_at || c.created_at).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">{c.category}</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Original Complaint</p>
                      <p className="text-zinc-400 text-sm italic">"{c.description}"</p>
                    </div>
                    
                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mb-2">Resolution Feedback</p>
                      <p className="text-emerald-500/90 text-sm font-medium">{c.resolution_feedback || 'Resolved with standard procedure.'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const AdminDashboard = ({ activeTab }: { activeTab: string }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, complaintsRes, deptsRes, officersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/complaints'),
        fetch('/api/departments'),
        fetch('/api/officers')
      ]);
      const statsData = await statsRes.json();
      const complaintsData = await complaintsRes.json();
      const deptsData = await deptsRes.json();
      const officersData = await officersRes.json();
      setStats(statsData);
      setComplaints(complaintsData);
      setDepartments(deptsData);
      setOfficers(officersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateComplaint = (id: string, updatedData: any) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...updatedData, updated_at: new Date().toISOString() } : c));
    // Refresh stats too
    fetch('/api/stats').then(res => res.json()).then(setStats);
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-500 gap-4">
      <Clock className="animate-spin text-indigo-500" size={32} />
      <p className="font-medium tracking-widest uppercase text-xs">Initializing Command Center...</p>
    </div>
  );

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citizen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleGenerateReport = () => {
    if (complaints.length === 0) {
      alert("No data available to generate report.");
      return;
    }

    // Prepare data for Excel
    const reportData = complaints.map(c => ({
      'Case ID': c.id,
      'Citizen Name': c.citizen_name,
      'Contact': c.citizen_contact,
      'Category': c.category,
      'Description': c.description,
      'Urgency': c.urgency,
      'Status': c.status,
      'Department': c.department_name || 'Unassigned',
      'Officer': c.officer_name || 'Unassigned',
      'Latitude': c.latitude,
      'Longitude': c.longitude,
      'Created At': new Date(c.created_at).toLocaleString(),
      'Updated At': new Date(c.updated_at).toLocaleString()
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaints Report");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `PS-CRM_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderDashboard = () => (
    <>
      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Inbound', value: stats?.total, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+12%' },
          { label: 'Resolved Cases', value: stats?.resolved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+8%' },
          { label: 'Active Pending', value: stats?.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '-3%' },
          { label: 'SLA Compliance', value: '94.2%', icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-400/10', trend: '+0.4%' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, backgroundColor: "rgba(24, 24, 27, 0.8)" }}
            className="bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-800/50 backdrop-blur-sm transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${stat.trend.startsWith('+') ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</h3>
            <p className="text-4xl font-bold text-white tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-7 bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-white">Departmental Distribution</h3>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Requests</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.byCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid #27272a', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  cursor={{ fill: '#18181b', radius: 8 }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-10">Resolution Efficiency</h3>
          <div className="h-[350px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="count"
                  nameKey="status"
                  stroke="none"
                >
                  {stats?.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid #27272a' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">{stats?.total}</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Cases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm overflow-hidden">
        <div className="p-8 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Recent Activity</h3>
            <p className="text-zinc-500 text-sm">Real-time stream of incoming citizen reports.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Quick search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-700 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Case ID</th>
                <th className="px-8 py-5">Citizen</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Priority</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredComplaints.slice(0, 5).map((c, idx) => (
                <motion.tr 
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(39, 39, 42, 0.3)" }}
                  className="transition-colors cursor-pointer group"
                >
                  <td className="px-8 py-6" onClick={() => setEditingComplaint(c)}>
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-400/5 px-2 py-1 rounded-md border border-indigo-400/10">{c.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-zinc-200">{c.citizen_name}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 bg-zinc-800/50 text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-zinc-700/50">{c.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                      c.urgency === 'Critical' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                      c.urgency === 'High' ? 'bg-orange-400/10 text-orange-400 border-orange-400/20' :
                      'bg-blue-400/10 text-blue-400 border-blue-400/20'
                    }`}>
                      {c.urgency}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${
                        c.status === 'Resolved' ? 'bg-emerald-500 shadow-emerald-500/50' :
                        c.status === 'In Progress' ? 'bg-blue-500 shadow-blue-500/50' :
                        'bg-zinc-600'
                      }`} />
                      <span className="text-sm font-bold text-zinc-300">{c.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-zinc-500">
                    {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderComplaints = () => (
    <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm overflow-hidden">
      <div className="p-8 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Complaint Management</h3>
          <p className="text-zinc-500 text-sm">Review, assign, and update city-wide grievances.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, Citizen, or Category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-700 transition-all"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/50 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              <th className="px-8 py-5">Case ID</th>
              <th className="px-8 py-5">Citizen Information</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5">Priority</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Assigned Officer</th>
              <th className="px-8 py-5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredComplaints.map((c, idx) => (
              <motion.tr 
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                whileHover={{ backgroundColor: "rgba(39, 39, 42, 0.3)" }}
                className="transition-colors cursor-pointer group"
              >
                <td className="px-8 py-6" onClick={() => setEditingComplaint(c)}>
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-400/5 px-2 py-1 rounded-md border border-indigo-400/10">{c.id}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-bold text-zinc-200 mb-0.5">{c.citizen_name}</div>
                  <div className="text-xs text-zinc-500 font-medium">{c.citizen_contact}</div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1.5 bg-zinc-800/50 text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-zinc-700/50">{c.category}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                    c.urgency === 'Critical' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                    c.urgency === 'High' ? 'bg-orange-400/10 text-orange-400 border-orange-400/20' :
                    'bg-blue-400/10 text-blue-400 border-blue-400/20'
                  }`}>
                    {c.urgency}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${
                      c.status === 'Resolved' ? 'bg-emerald-500 shadow-emerald-500/50' :
                      c.status === 'In Progress' ? 'bg-blue-500 shadow-blue-500/50' :
                      'bg-zinc-600'
                    }`} />
                    <span className="text-sm font-bold text-zinc-300">{c.status}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                      {c.officer_name ? c.officer_name.charAt(0) : '?'}
                    </div>
                    <span className="text-sm font-medium text-zinc-400">{c.officer_name || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-xs font-bold text-zinc-500">{new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                  <div className="text-[10px] font-medium text-zinc-600">{new Date(c.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-10">Departmental Performance</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.byCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 600}} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid #27272a' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-10">Resolution Trends</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Mon', count: 40 },
                { name: 'Tue', count: 30 },
                { name: 'Wed', count: 60 },
                { name: 'Thu', count: 45 },
                { name: 'Fri', count: 70 },
                { name: 'Sat', count: 20 },
                { name: 'Sun', count: 15 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid #27272a' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#09090b' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-sm text-center">
        <BarChart3 className="mx-auto text-indigo-500 mb-4" size={48} />
        <h3 className="text-2xl font-bold text-white mb-2">Advanced Predictive Analytics</h3>
        <p className="text-zinc-500 max-w-2xl mx-auto">Our AI engine is currently processing historical data to predict upcoming resource requirements and identify potential bottleneck areas in municipal service delivery.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">System Live</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-1">
            {activeTab === 'dashboard' ? 'Operational Overview' : 
             activeTab === 'complaints' ? 'Complaint Management' : 'Advanced Analytics'}
          </h1>
          <p className="text-zinc-500 font-medium">
            {activeTab === 'dashboard' ? 'Monitoring city-wide service requests and department performance.' :
             activeTab === 'complaints' ? 'Detailed view of all citizen grievances and their resolution status.' :
             'Deep dive into municipal data trends and AI-driven performance metrics.'}
          </p>
        </div>
        <div className="flex gap-3 relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-2.5 border rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              showFilters || statusFilter !== 'All' || categoryFilter !== 'All'
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Filter size={18} /> {statusFilter !== 'All' || categoryFilter !== 'All' ? 'Filtered' : 'Filter View'}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Category</label>
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Categories</option>
                      {Array.from(new Set(complaints.map(c => c.category))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      setStatusFilter('All');
                      setCategoryFilter('All');
                      setShowFilters(false);
                    }}
                    className="w-full py-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleGenerateReport}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all"
          >
            <BarChart3 size={18} /> Generate Report
          </button>
        </div>
      </div>

      {editingComplaint && (
        <ComplaintModal 
          complaint={editingComplaint}
          departments={departments}
          officers={officers}
          onClose={() => setEditingComplaint(null)}
          onUpdate={handleUpdateComplaint}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'complaints' && renderComplaints()}
          {activeTab === 'analytics' && renderAnalytics()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [role, setRole] = useState<'citizen' | 'admin' | 'officer'>('citizen');
  const [user, setUser] = useState<any>({ name: 'Guest Citizen' });
  const [activeTab, setActiveTab] = useState<string>('report');
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    if (role === 'citizen') setActiveTab('report');
    if (role === 'admin') setActiveTab('dashboard');
    if (role === 'officer') setActiveTab('my-tasks');
  }, [role]);

  if (showRoleSelector) {
    return <RoleSelector onSelect={(r, u) => { setRole(r); setUser(u || { name: 'Guest' }); setShowRoleSelector(false); }} />;
  }

  const isAdmin = role === 'admin';
  const isOfficer = role === 'officer';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isAdmin || isOfficer ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      <Navbar 
        role={role}
        user={user}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => { setRole('citizen'); setUser({ name: 'Guest Citizen' }); setActiveTab('report'); }}
        onStaffLogin={() => setShowRoleSelector(true)}
      />
      
      <main>
        <AnimatePresence mode="wait">
          {role === 'citizen' ? (
            <motion.div
              key="citizen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CitizenPortal activeTab={activeTab} setActiveTab={setActiveTab} />
            </motion.div>
          ) : role === 'officer' ? (
            <motion.div
              key="officer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <OfficerDashboard user={user} activeTab={activeTab} />
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AdminDashboard activeTab={activeTab} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={`border-t py-12 mt-12 transition-colors ${isAdmin || isOfficer ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-8">
            <div className={`flex items-center gap-2 transition-colors cursor-pointer ${isAdmin || isOfficer ? 'text-zinc-500 hover:text-indigo-400' : 'text-zinc-400 hover:text-indigo-600'}`}>
              <Globe size={20} />
              <span className="text-sm font-medium">English</span>
            </div>
            <div className={`flex items-center gap-2 transition-colors cursor-pointer ${isAdmin || isOfficer ? 'text-zinc-500 hover:text-indigo-400' : 'text-zinc-400 hover:text-indigo-600'}`}>
              <MessageSquare size={20} />
              <span className="text-sm font-medium">Support</span>
            </div>
            {role === 'citizen' && (
              <div 
                onClick={() => setShowRoleSelector(true)}
                className="flex items-center gap-2 text-zinc-400 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <ShieldCheck size={20} />
                <span className="text-sm font-medium">Staff Login</span>
              </div>
            )}
          </div>
          <p className={`text-sm ${isAdmin || isOfficer ? 'text-zinc-600' : 'text-zinc-400'}`}>© 2026 Smart Public Service CRM. AI-Powered Governance.</p>
        </div>
      </footer>
    </div>
  );
}
