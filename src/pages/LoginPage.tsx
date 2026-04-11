import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Loader2, Globe, Cpu } from 'lucide-react';
import loginBg from '../assets/login-bg.png';
import logo from '../assets/logo.png';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex font-sans transition-colors duration-500">
      {/* Left Section: Content & Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-12 lg:p-24 relative z-10 bg-black/20 backdrop-blur-3xl">
        <div className="space-y-12">
          {/* Brand Header */}
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <img src={logo} alt="CHS Logo" className="h-12 w-auto" />
            <span className="text-2xl font-black tracking-tighter">
              CHS <span className="text-primary italic">Cashup</span>
            </span>
          </div>

          {/* Intro Text */}
          <div className="space-y-4 animate-in fade-in slide-in-from-left-6 duration-700">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
              Secure Financial <br /> 
              <span className="text-primary italic">Intelligence Portal</span>
            </h1>
            <p className="text-slate-500 text-lg font-bold max-w-md">
              Access the enterprise-grade dashboard for CHS store management and operational audit control.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-8 max-w-md animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Authentication ID</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-16 pr-6 py-6 bg-white/[0.02] border border-white/10 rounded-[28px] text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-500 text-lg font-bold"
                    placeholder="corporate@chs.co.za"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full pl-16 pr-6 py-6 bg-white/[0.02] border border-white/10 rounded-[28px] text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-500 text-lg font-bold"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-5 rounded-3xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-sm font-bold flex items-center gap-3 animate-in shake duration-500">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden py-6 px-8 rounded-[30px] bg-primary text-white font-black text-xl shadow-2xl hover:bg-primary-dark transition-all duration-500 active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={28} /> : (
                  <>
                    <span>Initialize Session</span>
                    <LogIn size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
                  </>
                )}
              </div>
            </button>
            <p className="text-center text-slate-500 font-bold text-sm">
              Don't have an account? <Link to="/register" className="text-primary hover:underline">Create Account</Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-8 text-slate-600 text-xs font-black uppercase tracking-[0.1em] animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-primary" />
            <span>Encrypted Node: RSA-4096</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={14} />
            <span>System v4.2.0</span>
          </div>
        </div>
      </div>

      {/* Right Section: Visual Experience */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img 
          src={loginBg} 
          alt="Abstract Visualization" 
          className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[10s] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-transparent to-transparent"></div>
        
        <div className="absolute bottom-24 left-24 right-24 space-y-6">
          <div className="inline-block px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl text-white text-xs font-black uppercase tracking-widest">
            Institutional Growth Module
          </div>
          <h2 className="text-6xl font-black text-white leading-tight tracking-tighter">
            Architecting the <br /> 
            <span className="text-primary italic">Financial Future.</span>
          </h2>
          <div className="grid grid-cols-3 gap-8 pt-8 border_t border-white/10">
            <Stat label="Uptime" value="99.99%" />
            <Stat label="Encryption" value="AES-256" />
            <Stat label="Audits" value="Active" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</div>
    <div className="text-xl font-black italic">{value}</div>
  </div>
);
