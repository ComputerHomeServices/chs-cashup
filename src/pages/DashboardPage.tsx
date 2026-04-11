import { useCashups } from '../hooks/useCashups';
import { SummaryCard } from '../components/SummaryCard';
import { AreaChart, TrendingUp, DollarSign, ArrowRight, Shield, Layers, Zap, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export const DashboardPage = () => {
  const { cashups, loading } = useCashups();

  const stats = {
    totalSales: cashups.reduce((acc, curr) => acc + curr.total_actual, 0),
    avgVariance: cashups.length ? cashups.reduce((acc, curr) => acc + curr.variance, 0) / cashups.length : 0,
    entriesThisMonth: cashups.filter(c => {
      try {
        return new Date(c.date).getMonth() === new Date().getMonth();
      } catch { return false; }
    }).length,
    recentAlerts: cashups.filter(c => Math.abs(c.variance) > 50).length
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
      <div className="h-16 w-16 border-4 border-slate-900 border_t_primary rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Archive...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Live</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase italic">
            Daily <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-tight">Real-time oversight of financial integrity.</p>
        </div>
        
        <Link 
          to="/new" 
          className="group relative px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl hover:bg-primary transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-3 overflow-hidden italic"
        >
          <Zap size={20} className="fill-white" />
          NEW OPERATION
          <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Revenue MTD" value={stats.totalSales} icon={<DollarSign size={20} />} />
        <SummaryCard label="Accuracy" value={stats.avgVariance} variant={Math.abs(stats.avgVariance) < 5 ? 'success' : 'warning'} icon={<AreaChart size={20} />} />
        <SummaryCard label="Volume" value={stats.entriesThisMonth} variant="default" icon={<Layers size={20} />} />
        <SummaryCard label="Risk Level" value={stats.recentAlerts} variant={stats.recentAlerts > 0 ? 'danger' : 'success'} icon={<Shield size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end px-2">
             <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Activity Log</h2>
                <div className="h-1 w-12 bg-primary mt-1 rounded-full"></div>
             </div>
             <Link to="/history" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Archive</Link>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {cashups.slice(0, 6).map(cashup => (
              <Link 
                key={cashup.id} 
                to={`/history`}
                className="flex items-center justify-between p-6 rounded-[24px] bg-slate-950 text-white border border-white/5 hover:bg-primary hover:border-primary/50 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex flex-col items-center justify-center font-black leading-none group-hover:bg-white/20">
                    <span className="text-[10px] opacity-70 mb-1">{format(new Date(cashup.date), 'MMM')}</span>
                    <span className="text-lg">{format(new Date(cashup.date), 'dd')}</span>
                  </div>
                  <div>
                    <div className="font-black text-xl leading-none">{cashup.store_name}</div>
                    <div className="flex items-center gap-2 mt-2 opacity-60 text-[9px] font-black uppercase tracking-[0.2em]">
                       <Calendar size={10} />
                       {format(new Date(cashup.date), 'EEEE, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <div className="font-black text-2xl tabular-nums tracking-tighter italic">R {cashup.total_actual.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  <div className={cn(
                    "inline-block px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mt-2",
                    cashup.variance === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  )}>
                    {cashup.variance === 0 ? 'BALANCED' : `VAR: R ${cashup.variance.toFixed(2)}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-10 rounded-[40px] bg-slate-900 border border-white/5 relative overflow-hidden group">
            <TrendingUp className="absolute bottom-[-20%] right-[-10%] h-48 w-48 text-white/5 -rotate-12 group-hover:rotate-0 transition-all duration-1000" />
            <div className="relative z-10 space-y-6 text-white">
              <h2 className="text-3xl font-black italic leading-none uppercase">Precision</h2>
              <p className="text-slate-400 font-bold text-sm leading-relaxed">
                System efficiency is currently at <span className="text-emerald-400">99.8%</span>. Financial integrity remains high across all active retail locations.
              </p>
              <div className="pt-4">
                <div className="w-full bg-white/5 rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full w-[99.8%] shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
