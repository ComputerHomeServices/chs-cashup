import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface InvoiceListProps {
  label: string;
  invoices: number[];
  onChange: (invoices: number[]) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ label, invoices, onChange }) => {
  const addInvoice = () => {
    onChange([...invoices, 0]);
  };

  const removeInvoice = (index: number) => {
    onChange(invoices.filter((_, i) => i !== index));
  };

  const updateInvoice = (index: number, value: number) => {
    const newInvoices = [...invoices];
    newInvoices[index] = value;
    onChange(newInvoices);
  };

  const total = invoices.reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label} Invoices</label>
        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Total: R {total.toFixed(2)}
        </span>
      </div>
      
      <div className="space-y-2">
        {invoices.map((amount, index) => (
          <div key={index} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
            <div className="flex-1 flex items-stretch bg-white border border-slate-200 rounded-lg overflow-hidden focus-within:border-primary transition-all">
              <div className="bg-slate-50 px-3 flex items-center justify-center font-black text-slate-300 italic text-xs border-r">R</div>
              <input 
                type="number" 
                step="0.01" 
                value={amount || ''} 
                onChange={(e) => updateInvoice(index, parseFloat(e.target.value) || 0)} 
                className="flex-1 px-3 py-1.5 bg-transparent text-sm font-bold outline-none" 
                placeholder="0.00"
                autoFocus={amount === 0}
              />
            </div>
            <button 
              onClick={() => removeInvoice(index)}
              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button 
        type="button"
        onClick={addInvoice}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-widest"
      >
        <Plus size={14} /> Add {label} Line
      </button>
    </div>
  );
};
