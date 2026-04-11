import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, User, Lock, Mail, CheckCircle2, AlertCircle, Loader2, Sparkles, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'user',
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
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
              Registration complete for <span className="text-slate-900">{email}</span>. 
              You can now log in immediately.
            </p>
          </div>
          <Link
            to="/login"
            className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-xl"
          >
            Go to Login
          </Link>
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
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Registration Portal</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Auditor Onboarding</h1>
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
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-slate-950"
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
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-slate-950"
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
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-slate-950"
                placeholder="auditor@chs-retail.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-2">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-slate-950"
                placeholder="••••••••"
              />
            </div>
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
            {loading ? 'PROCESSING...' : 'COMPLETE REGISTRATION'}
          </button>
        </form>
      </div>
      
      <p className="text-center text-slate-500 font-bold text-sm">
        Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
      </p>
    </div>
  );
};
