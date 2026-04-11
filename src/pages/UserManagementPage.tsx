import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Edit2, Check, X, Loader2, Key, ShieldAlert } from 'lucide-react';

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

  const handleSave = async (id: string) => {
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
      const { error: invokeError } = await supabase.functions.invoke('admin-reset-password', {
        body: { action: 'reset-password', userId, newPassword },
      });

      if (invokeError) {
          if (invokeError.message?.includes('404')) {
            throw new Error("Function URL not found. Ensure it is DEPLOYED.");
          }
          throw new Error(invokeError.message || "Failed to reset password.");
      }

      alert("Password updated successfully!");
      setNewPassword('');
      setResettingId(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-20 px-4">
      <div className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tight">Personnel Center</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Admin Administration Override</p>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 outline-none focus:bg-white/10 transition-all font-bold text-sm"
            placeholder="Search auditors..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProfiles.map(profile => (
          <div key={profile.id} className="bg-white p-6 rounded-[32px] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400">
                 {profile.first_name?.[0] || 'U'}
              </div>
              <div>
                 <h3 className="font-black text-slate-900 text-lg leading-tight">{profile.first_name} {profile.last_name}</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">{profile.email}</p>
                 <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[8px] font-black uppercase tracking-widest mt-2">{profile.role}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               {resettingId === profile.id ? (
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                     <input 
                       type="text" placeholder="New Password" 
                       className="bg-white px-4 py-2 rounded-xl text-xs font-bold outline-none border border-slate-100"
                       value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                     />
                     <button onClick={() => handleForcePasswordReset(profile.id)} disabled={saving} className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-dark transition-all">
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                     </button>
                     <button onClick={() => setResettingId(null)} className="p-2.5 text-slate-400 hover:text-slate-600"><X size={16} /></button>
                  </div>
               ) : (
                  <>
                    <button onClick={() => setResettingId(profile.id)} className="px-5 py-2.5 bg-amber-500/10 text-amber-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500 hover:text-white transition-all">
                       <Key size={14} /> Reset Pass
                    </button>
                    <button onClick={() => { setEditingId(profile.id); setEditValues(profile); }} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all">
                       <Edit2 size={14} /> Edit
                    </button>
                  </>
               )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-8 rounded-[40px] space-y-4">
         <div className="flex items-center gap-3 text-amber-600 font-black italic uppercase text-sm">
            <ShieldAlert size={20} /> Advanced Security Notice
         </div>
         <p className="text-sm font-bold text-amber-800 leading-relaxed">
            Admin roles and password resets are managed via service-level Edge Functions.
         </p>
      </div>

      {editingId && (
         <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md space-y-6">
               <h2 className="text-2xl font-black italic uppercase">Edit Auditor</h2>
               <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</label><input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none" value={editValues.first_name} onChange={(e) => setEditValues({...editValues, first_name: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</label><input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none" value={editValues.last_name} onChange={(e) => setEditValues({...editValues, last_name: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Role</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm outline-none" value={editValues.role} onChange={(e) => setEditValues({...editValues, role: e.target.value as any})}>
                       <option value="user">User</option>
                       <option value="admin">Admin</option>
                    </select>
                  </div>
               </div>
               <div className="flex gap-2 pt-4">
                  <button onClick={() => handleSave(editingId)} disabled={saving} className="flex-1 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs">Save Changes</button>
                  <button onClick={() => setEditingId(null)} className="px-6 py-4 bg-slate-100 text-slate-400 rounded-xl"><X size={20} /></button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
