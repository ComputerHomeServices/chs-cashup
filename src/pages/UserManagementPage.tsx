import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Edit2, Check, X, Loader2, Key, UserPlus } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  email: string;
}

export const UserManagementPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  
  // States for New User Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });

  const [newPassword, setNewPassword] = useState('');
  const [resettingId, setResettingId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('first_name');
      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) { alert(err.message); }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { 
          action: 'create-user',
          ...newUser
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      alert("New Auditor Successfully Onboarded!");
      setShowAddModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
      fetchProfiles();
    } catch (err: any) {
      alert("Registration Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setSaving(true);
      const { error } = await supabase.from('profiles').update({
        first_name: editValues.first_name,
        last_name: editValues.last_name,
        role: editValues.role
      }).eq('id', id);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...editValues } : p));
      setEditingId(null);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleForcePasswordReset = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    try {
      setSaving(true);
      const { error } = await supabase.functions.invoke('admin-reset-password', {
        body: { action: 'reset-password', userId, newPassword },
      });
      if (error) throw error;
      alert("Password updated successfully!");
      setNewPassword('');
      setResettingId(null);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const filteredProfiles = profiles.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-20 px-4">
      <div className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tight">Personnel Center</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Admin Administration Override</p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 flex-1 max-w-xl">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 outline-none focus:bg-white/10 transition-all font-bold text-sm"
                placeholder="Search auditors..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={() => setShowAddModal(true)}
             className="whitespace-nowrap bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/20"
           >
             <UserPlus size={18} /> Add New Auditor
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProfiles.map(profile => (
          <div key={profile.id} className="bg-white p-6 rounded-[32px] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-shadow bg-gradient-to-r from-white to-slate-50/50">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 bg-slate-100 rounded-3xl flex items-center justify-center font-black text-2xl text-slate-300 border border-slate-200 shadow-sm uppercase">
                 {profile.first_name?.[0] || profile.email?.[0] || 'A'}
              </div>
              <div>
                 <h3 className="font-black text-slate-900 text-xl leading-tight italic uppercase">{profile.first_name} {profile.last_name}</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">{profile.email}</p>
                 <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-md text-[9px] font-black uppercase tracking-[0.2em] mt-3 shadow-lg">{profile.role}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               {resettingId === profile.id ? (
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
                     <input 
                       type="text" placeholder="New Password" 
                       className="bg-white px-4 py-2 rounded-xl text-xs font-bold outline-none border border-slate-200"
                       value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                     />
                     <button onClick={() => handleForcePasswordReset(profile.id)} disabled={saving} className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all">
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
                     </button>
                     <button onClick={() => setResettingId(null)} className="p-3 text-slate-400 hover:text-slate-600"><X size={18} /></button>
                  </div>
               ) : (
                  <>
                    <button onClick={() => setResettingId(profile.id)} className="px-6 py-3 bg-amber-500/10 text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500 hover:text-white transition-all">
                       <Key size={16} /> Reset
                    </button>
                    <button onClick={() => { setEditingId(profile.id); setEditValues(profile); }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all">
                       <Edit2 size={16} /> Edit Profile
                    </button>
                  </>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
         <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-lg space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><UserPlus size={100} /></div>
               <div className="relative">
                  <h2 className="text-3xl font-black italic uppercase italic tracking-tighter">Onboard Auditor</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Direct system enrollment</p>
               </div>
               
               <form onSubmit={handleAddUser} className="space-y-5 relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</label>
                       <input required className="modal-input" placeholder="e.g. John" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</label>
                       <input required className="modal-input" placeholder="e.g. Doe" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Official Email</label>
                     <input required type="email" className="modal-input" placeholder="auditor@chs.com" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assigned Password</label>
                     <input required type="text" className="modal-input" placeholder="Min 6 characters" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Security Role</label>
                     <select className="modal-input appearance-none" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}>
                        <option value="user">User (Standard Auditor)</option>
                        <option value="admin">Admin (Executive Level)</option>
                     </select>
                  </div>
                  <div className="flex gap-3 pt-6">
                     <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-105 transition-all">
                        {saving ? <Loader2 className="animate-spin inline mr-2" /> : <Check className="inline mr-2" />}
                        Onboard Now
                     </button>
                     <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-5 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all font-black uppercase text-xs">Cancel</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Edit User Modal */}
      {editingId && (
         <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md space-y-8 animate-in zoom-in-95 duration-200">
               <h2 className="text-2xl font-black italic uppercase italic">Update Auditor</h2>
               <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</label><input className="modal-input" value={editValues.first_name} onChange={(e) => setEditValues({...editValues, first_name: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</label><input className="modal-input" value={editValues.last_name} onChange={(e) => setEditValues({...editValues, last_name: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Role</label>
                    <select className="modal-input appearance-none" value={editValues.role} onChange={(e) => setEditValues({...editValues, role: e.target.value as any})}>
                       <option value="user">User</option>
                       <option value="admin">Admin</option>
                    </select>
                  </div>
               </div>
               <div className="flex gap-2 pt-4">
                  <button onClick={() => handleSaveEdit(editingId)} disabled={saving} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl">Update Identity</button>
                  <button onClick={() => setEditingId(null)} className="px-8 py-5 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all"><X size={20} /></button>
               </div>
            </div>
         </div>
      )}

      <style>{`
         .modal-input { width: 100%; bg: #f8fafc; border: 2px solid #f1f5f9; border-radius: 16px; padding: 1rem 1.25rem; font-weight: 700; font-size: 0.875rem; color: #0f172a; outline: none; transition: all 0.2s; }
         .modal-input:focus { border-color: #3b82f6; background: white; shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
      `}</style>
    </div>
  );
};
