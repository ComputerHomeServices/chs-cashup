import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LogOut, History, PlusSquare, LayoutDashboard, User, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import logo from '../assets/logo.png';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-dark/5 rounded-full blur-[120px]"></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-7xl glass-card rounded-3xl h-16 flex items-center justify-between px-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <img src={logo} alt="CHS Logo" className="h-10 w-auto" />
            <span className="text-xl font-black tracking-tight hidden sm:inline">
              CHS <span className="text-primary italic">Cashup</span>
            </span>
          </div>
          
          {user && (
            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/" active={location.pathname === '/'} icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <NavLink to="/new" active={location.pathname === '/new'} icon={<PlusSquare size={18} />} label="New Entry" />
              <NavLink to="/history" active={location.pathname === '/history'} icon={<History size={18} />} label="History" />
              {(user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin') && (
                <>
                  <NavLink to="/register" active={location.pathname === '/register'} icon={<PlusSquare size={18} />} label="Add User" />
                  <NavLink to="/users" active={location.pathname === '/users'} icon={<User size={18} />} label="Manage Users" />
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 border_l border-white/10 pl-4 ml-2">
                <div className="hidden md:flex items-center gap-3 bg-white/5 pl-2 pr-4 py-1.5 rounded-2xl border border-white/5 group">
                  <div className="p-1.5 rounded-full bg-primary/20 text-primary">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300 group"
                  title="Logout"
                >
                  <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all hover:scale-105"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="relative z-10 border_t border-white/5 py-8 mt-12">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium opacity-50">
          <div className="flex items-center gap-2">
            <span className="font-bold">CHS Cashup &copy; 2026</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
            <a href="#" className="hover:text-primary transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-2xl transition-all duration-300 relative group",
      active 
        ? "text-primary bg-primary/10" 
        : "opacity-60 hover:opacity-100 hover:bg-white/5"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);
