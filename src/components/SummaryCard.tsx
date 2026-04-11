import { cn } from '../lib/utils';

interface SummaryCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const SummaryCard = ({ label, value, icon, variant = 'default' }: SummaryCardProps) => {
  const variants = {
    default: 'glass-card text-main border-glass',
    success: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500',
    warning: 'bg-amber-500/5 border-amber-500/20 text-amber-500',
    danger: 'bg-rose-500/5 border-rose-500/20 text-rose-500',
  };

  const iconVariants = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500',
    danger: 'bg-rose-500/10 text-rose-500',
  };

  return (
    <div className={cn(
      "p-6 rounded-[32px] border shadow-xl transition-all duration-300 group",
      variants[variant]
    )}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{label}</span>
        {icon && (
          <div className={cn("p-2 rounded-xl transition-transform group-hover:rotate-12", iconVariants[variant])}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-black opacity-30 italic">R</span>
        <div className="text-3xl font-black tracking-tighter tabular-nums leading-none">
          {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};
