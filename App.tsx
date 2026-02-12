
import React, { useState, useEffect } from 'react';
import { CRMState, Lead, LeadStatus, User, UserRole, ActivityLog, Priority, FollowUp } from './types';
import { db } from './services/sqlService';
import { DashboardIcon, UsersIcon, LeadIcon, BellIcon, LogOutIcon, PlusIcon, HistoryIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import LeadManagement from './components/LeadManagement';
import LeadFormModal from './components/LeadFormModal';
import LeadDetails from './components/LeadDetails';
import LeadFormPublic from './components/LeadFormPublic';
import TeamManagement from './components/TeamManagement';

const Login: React.FC<{ onLogin: (user: User) => void, users: User[] }> = ({ onLogin, users }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto shadow-lg shadow-blue-500/20 mb-4">N</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Nexus CRM</h1>
          <p className="text-slate-500 font-medium text-center">Enterprise Intelligence Suite</p>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">System Authentication</p>
          <div className="grid grid-cols-1 gap-3">
            {users.map(u => (
              <button 
                key={u.id}
                onClick={() => onLogin(u)}
                className="group flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left active:scale-[0.98]"
              >
                <img src={u.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-700">{u.name}</h4>
                  <p className="text-xs text-slate-500 uppercase font-black tracking-tighter">{u.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<CRMState>(db.getState());
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'LEADS' | 'TEAM' | 'LEAD_DETAILS' | 'PUBLIC_FORM' | 'AUDIT'>('DASHBOARD');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

  const refreshState = () => {
    setState(db.getState());
  };

  const logActivity = (action: string, targetId: string, targetType: 'LEAD' | 'USER' | 'TASK') => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: state.user?.id || '1',
      userName: state.user?.name || 'System',
      action,
      targetId,
      targetType,
      timestamp: new Date().toISOString()
    };
    db.insertActivity(newLog);
    refreshState();
  };

  const handleLogin = (user: User) => {
    db.saveSession(user);
    refreshState();
  };

  const handleLogout = () => {
    db.saveSession(null);
    setActiveTab('DASHBOARD');
    setSelectedLeadId(null);
    refreshState();
  };

  const handleAddLead = (data: Partial<Lead>, source = 'Internal') => {
    const newLead: Lead = {
      name: '', email: '', phone: '', company: '', notes: '', source,
      status: LeadStatus.NEW, priority: Priority.MEDIUM,
      assignedTo: data.assignedTo || state.users.find(u => u.role === UserRole.SALES)?.id || '2',
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: state.user?.id || '1'
    } as Lead;
    db.insertLead(newLead);
    logActivity(`created new lead: ${newLead.name}`, newLead.id, 'LEAD');
    setIsModalOpen(false);
  };

  const handleSaveLead = (data: Partial<Lead>) => {
    if (editingLead) {
      const updatedLead = { ...editingLead, ...data, updatedAt: new Date().toISOString() } as Lead;
      db.updateLead(updatedLead);
      logActivity(`updated lead profile: ${data.name}`, editingLead.id, 'LEAD');
      setEditingLead(undefined);
      setIsModalOpen(false);
    } else {
      handleAddLead(data);
    }
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Permanently remove this lead from the system? This action cannot be undone.')) {
        const lead = state.leads.find(l => l.id === id);
        db.deleteLead(id);
        logActivity(`permanently deleted lead: ${lead?.name}`, id, 'LEAD');
        if (selectedLeadId === id) {
          setSelectedLeadId(null);
          setActiveTab('LEADS');
        }
        refreshState();
    }
  };

  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      ...userData as User,
      id: Math.random().toString(36).substr(2, 9)
    };
    db.insertUser(newUser);
    logActivity(`added team member: ${newUser.name}`, newUser.id, 'USER');
  };

  const handleUpdateUser = (u: User) => {
    db.updateUser(u);
    if (state.user?.id === u.id) db.saveSession(u);
    logActivity(`updated user permissions: ${u.name}`, u.id, 'USER');
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Permanently revoke this users access?')) {
      db.deleteUser(id);
      logActivity(`revoked system access for user ID: ${id}`, id, 'USER');
      refreshState();
    }
  };

  const handleDownloadSQL = () => {
    const sql = db.generateSQLDump();
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_crm_dump_${Date.now()}.sql`;
    a.click();
  };

  const currentLead = state.leads.find(l => l.id === selectedLeadId);
  const isAdmin = state.user?.role === UserRole.ADMIN;

  if (!state.user) return <Login onLogin={handleLogin} users={state.users} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col hidden md:flex shrink-0">
        <div className="p-8">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">N</div>
            NEXUS
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavItem active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} icon={<DashboardIcon className="w-5 h-5" />} label="Executive View" />
          <NavItem active={activeTab === 'LEADS'} onClick={() => setActiveTab('LEADS')} icon={<LeadIcon className="w-5 h-5" />} label={isAdmin ? "Operational Pipeline" : "My Portfolio"} />

          {isAdmin && (
            <>
              <div className="px-4 pt-4 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Administration</div>
              <NavItem active={activeTab === 'TEAM'} onClick={() => setActiveTab('TEAM')} icon={<UsersIcon className="w-5 h-5" />} label="Team Control" />
              <NavItem active={activeTab === 'AUDIT'} onClick={() => setActiveTab('AUDIT')} icon={<HistoryIcon className="w-5 h-5" />} label="SQL Audit Trail" />
            </>
          )}

          <div className="pt-4 mt-4 border-t border-slate-800">
             <button 
              onClick={() => { setActiveTab('PUBLIC_FORM'); setSelectedLeadId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'PUBLIC_FORM' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-900/20 text-indigo-400'}`}
            >
              <PlusIcon className="w-5 h-5" />
              <span className="font-bold text-sm">Capture Sim</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-2xl mb-4 border border-white/5">
              <img src={state.user.avatar} className="w-10 h-10 rounded-xl border-2 border-slate-700" alt="" />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{state.user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black">{state.user.role}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-rose-900/20 transition-all text-sm font-bold">
             <LogOutIcon className="w-4 h-4" /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {activeTab === 'DASHBOARD' && 'Business Intelligence'}
              {activeTab === 'LEADS' && 'Sales Pipeline'}
              {activeTab === 'TEAM' && 'Team Governance'}
              {activeTab === 'AUDIT' && 'Relational Audit Log'}
              {activeTab === 'PUBLIC_FORM' && 'Lead Generation Simulator'}
              {activeTab === 'LEAD_DETAILS' && 'Lead Profile Intelligence'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             {isAdmin && activeTab === 'AUDIT' && (
                <button 
                  onClick={handleDownloadSQL}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Export SQL Dump
                </button>
             )}
             <div className="h-10 w-px bg-slate-100 mx-2"></div>
             <div className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-2xl cursor-pointer">
               <BellIcon className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white ring-2 ring-blue-600/10"></span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto pb-20">
            {activeTab === 'DASHBOARD' && <Dashboard state={state} />}
            {activeTab === 'LEADS' && (
              <LeadManagement 
                state={state} 
                onAddLead={() => { setEditingLead(undefined); setIsModalOpen(true); }}
                onEditLead={(l) => { setEditingLead(l); setIsModalOpen(true); }}
                onViewDetails={(l) => { setSelectedLeadId(l.id); setActiveTab('LEAD_DETAILS'); }}
                onUpdateLead={(l) => { db.updateLead(l); refreshState(); }}
                onDeleteLead={handleDeleteLead}
              />
            )}
            {activeTab === 'TEAM' && isAdmin && (
              <TeamManagement 
                state={state}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
            {activeTab === 'AUDIT' && isAdmin && (
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Database Audit</h3>
                </div>
                <div className="p-8 space-y-4">
                  {state.activities.map(log => (
                    <div key={log.id} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all">
                       <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                          <HistoryIcon className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{log.userName} <span className="font-medium text-slate-500">{log.action}</span></p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{new Date(log.timestamp).toLocaleString()}</p>
                       </div>
                       <div className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                          TBL_{log.targetType}S
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'LEAD_DETAILS' && currentLead && (
              <LeadDetails 
                lead={currentLead} state={state} onBack={() => setActiveTab('LEADS')} 
                onEdit={() => { setEditingLead(currentLead); setIsModalOpen(true); }}
                onDeleteLead={handleDeleteLead}
                onAddFollowUp={(notes, date) => { db.insertFollowUp({ id: Math.random().toString(36).substr(2, 9), leadId: currentLead.id, notes, scheduledAt: date, completed: false }); refreshState(); }}
                onToggleFollowUp={(id) => { db.toggleFollowUp(id); refreshState(); }}
              />
            )}
            {activeTab === 'PUBLIC_FORM' && (
              <LeadFormPublic onNewLead={(d) => handleAddLead(d, 'Simulator')} />
            )}
          </div>
        </div>
      </main>

      <LeadFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lead={editingLead} users={state.users} onSubmit={handleSaveLead} />
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}>
    {icon}
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

export default App;
