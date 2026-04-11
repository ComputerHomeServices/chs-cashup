import { Minus, Plus, Banknote, Coins } from 'lucide-react';
import { cn } from '../lib/utils';

interface DenominationInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  multiplier: number;
  type?: 'note' | 'coin';
}

export const DenominationInput = ({ label, value, onChange, multiplier, type = 'note' }: DenominationInputProps) => {
  const total = (value * multiplier).toLocaleString(undefined, { minimumFractionDigits: 2 });
  const isZero = value === 0;

  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-all animate-in fade-in duration-300",
      !isZero && "border-primary/50 bg-primary/[0.01] ring-1 ring-primary/10"
    )}>
      {/* Label Section - LEFT */}
      <div className="flex items-center gap-3 min-w-[80px]">
        <div className={cn(
          "p-2 rounded-lg transition-colors",
          isZero ? "bg-slate-100 text-slate-400" : "bg-primary text-white shadow-sm"
        )}>
          {type === 'note' ? <Banknote size={18} /> : <Coins size={18} />}
        </div>
        <span className="text-xl font-black text-slate-900 tracking-tighter">{label}</span>
      </div>

      {/* Control Section - STACKED IN MIDDLE */}
      <div className="flex flex-col items-center gap-1 mx-4">
        <button
          onClick={(e) => { e.preventDefault(); onChange(value + 1); }}
          className="h-8 w-16 flex items-center justify-center rounded-t-lg bg-slate-900 text-white hover:bg-emerald-600 transition-colors active:scale-95"
          type="button"
        >
          <Plus size={16} strokeWidth={3} />
        </button>
        
        <input
          type="number"
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-16 bg-slate-50 border-x border-slate-200 py-1 text-center text-lg font-black outline-none text-slate-900"
          placeholder="0"
        />
        
        <button
          onClick={(e) => { e.preventDefault(); onChange(Math.max(0, value - 1)); }}
          className="h-8 w-16 flex items-center justify-center rounded-b-lg bg-slate-900 text-white hover:bg-rose-600 transition-colors active:scale-95"
          type="button"
        >
          <Minus size={16} strokeWidth={3} />
        </button>
      </div>

      {/* Result Section - RIGHT */}
      <div className="text-right min-w-[100px]">
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Row Total</div>
        <div className={cn(
          "text-lg font-black tabular-nums transition-colors",
          isZero ? "text-slate-300" : "text-primary"
        )}>
          R {total}
        </div>
      </div>
    </div>
  );
};
