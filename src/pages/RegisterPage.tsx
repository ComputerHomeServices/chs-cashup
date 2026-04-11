import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, User, Lock, Mail, CheckCircle2, AlertCircle, Loader2, Sparkles, Shield } from 'lucide-react';

export const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // We use the Edge Function to create the user with AUTO-CONFIRMATION
      const { data, error: functionError } = await supabase.functions.invoke('admin-reset-password', {
        body: { 
          action: 'create-user',
          email,
          password,
          firstName,
          lastName,
          role
        },
      });

      if (functionError) throw new Error(functionError.message || "Failed to call registration function.");
      if (data?.error) throw new Error(data.error);

      setSuccess(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl text-center space-y-8 border border-slate-100">
          <div className="h-24 w-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black italic uppercase tracking-tight">Access Granted</h2>
            <p className="text-slate-500 font-bold leading-relaxed">
              Account for <span className="text-slate-900">{email}</span> has been created and **PRE-CONFIRMED**.
            </p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-xl"
          >
            Register Another Auditor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <UserPlus size={120} />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
             <Shield className="text-primary h-4 w-4" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Administration</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Onboard Auditor</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Credentials will be instant & verified</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-200">
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-2">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                  placeholder="John"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-2">Official Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                placeholder="auditor@chs-retail.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-2">Initial Keycode</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-2">Security Authorization</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:border-primary transition-all appearance-none"
            >
              <option value="user">USER (Audit Level)</option>
              <option value="admin">ADMIN (Executive Level)</option>
            </select>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
              <AlertCircle size={20} />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {loading ? 'DEPLOYING ASSETS...' : 'REGISTER & VERIFY INSTANTLY'}
          </button>
        </form>
      </div>

      <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-200 flex items-center gap-6">
         <div className="bg-white p-4 rounded-2xl shadow-sm text-primary">
            <Shield size={32} />
         </div>
         <div className="space-y-1">
            <h3 className="text-lg font-black italic uppercase italic">Instant Verification Protocol</h3>
            <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-lg">
               Users created here are automatically confirmed by the system. No email verification is required. 
               Auditors can log in with their credentials immediately after you click register.
            </p>
         </div>
      </div>
    </div>
  );
};
