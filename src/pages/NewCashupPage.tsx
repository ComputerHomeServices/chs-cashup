import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCashups } from '../hooks/useCashups';
import { DenominationInput } from '../components/DenominationInput';
import { SummaryCard } from '../components/SummaryCard';
import { Sparkles, Printer, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export const NewCashupPage = () => {
  const { user } = useAuth();
  const { cashups, createCashup } = useCashups();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState('CHS Main');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cardTotal, setCardTotal] = useState(0);
  const [eftTotal, setEftTotal] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [openingCash, setOpeningCash] = useState(0);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [payoutReason, setPayoutReason] = useState('');
  const [totalExpected, setTotalExpected] = useState(0);

  // Fetch last cashup to get opening balance
  useMemo(() => {
    const lastCashup = cashups[0];
    if (lastCashup) {
      setOpeningCash(lastCashup.cash_total);
    }
  }, [cashups]);

  const [denominations, setDenominations] = useState({
    notes_200: 0,
    notes_100: 0,
    notes_50: 0,
    notes_20: 0,
    notes_10: 0,
    coins_5: 0,
    coins_2: 0,
    coins_1: 0,
    coins_050: 0,
    coins_020: 0,
    coins_010: 0,
  });

  const cashTotal = useMemo(() => {
    return (
      denominations.notes_200 * 200 +
      denominations.notes_100 * 100 +
      denominations.notes_50 * 50 +
      denominations.notes_20 * 20 +
      denominations.notes_10 * 10 +
      denominations.coins_5 * 5 +
      denominations.coins_2 * 2 +
      denominations.coins_1 * 1 +
      denominations.coins_050 * 0.5 +
      denominations.coins_020 * 0.2 +
      denominations.coins_010 * 0.1
    );
  }, [denominations]);

  const totalActual = cashTotal + cardTotal + eftTotal + payoutAmount;
  const cashDailyIntake = cashTotal + payoutAmount - openingCash;
  const variance = cashDailyIntake - totalExpected;

  const generatePDF = (id: string) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text('CHS CASHUP AUDIT', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Reference ID: ${id.substring(0, 8)}`, 14, 30);
      doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 196, 30, { align: 'right' });

      autoTable(doc, {
        startY: 35,
        head: [['Field', 'Value']],
        body: [
          ['Store Location', storeName],
          ['Audit Date', format(new Date(date), 'EEEE, dd MMMM yyyy')],
          ['Auditor Name', `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || user?.email || 'Unknown'],
          ['Status', 'PROCESSED']
        ],
        theme: 'plain',
        styles: { fontSize: 10 }
      });

      const rows = [
        ['R 200 Notes', denominations.notes_200, `R ${(denominations.notes_200 * 200).toFixed(2)}`],
        ['R 100 Notes', denominations.notes_100, `R ${(denominations.notes_100 * 100).toFixed(2)}`],
        ['R 50 Notes', denominations.notes_50, `R ${(denominations.notes_50 * 50).toFixed(2)}`],
        ['R 20 Notes', denominations.notes_20, `R ${(denominations.notes_20 * 20).toFixed(2)}`],
        ['R 10 Notes', denominations.notes_10, `R ${(denominations.notes_10 * 10).toFixed(2)}`],
        ['R 5 Coins', denominations.coins_5, `R ${(denominations.coins_5 * 5).toFixed(2)}`],
        ['R 2 Coins', denominations.coins_2, `R ${(denominations.coins_2 * 2).toFixed(2)}`],
        ['R 1 Coins', denominations.coins_1, `R ${(denominations.coins_1 * 1).toFixed(2)}`],
        ['50c Coins', denominations.coins_050, `R ${(denominations.coins_050 * 0.5).toFixed(2)}`],
        ['20c Coins', denominations.coins_020, `R ${(denominations.coins_020 * 0.2).toFixed(2)}`],
        ['10c Coins', denominations.coins_010, `R ${(denominations.coins_010 * 0.1).toFixed(2)}`],
        ['Opening Cash', '', `R ${openingCash.toFixed(2)}`],
        ['Payout Amount', payoutReason || 'Payout', `R ${payoutAmount.toFixed(2)}`],
        ['Total Assets', '', `R ${totalActual.toFixed(2)}`],
        ['Expected Cash Sales', '', `R ${totalExpected.toFixed(2)}`],
        ['Cash Variance', '', `R ${variance.toFixed(2)}`]
      ];

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Denomination/Category', 'Detail', 'Amount']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] }
      });

      doc.save(`Audit_${storeName}_${date}.pdf`);
    } catch (err) { alert('Print failed: ' + err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const result = await createCashup({
        user_id: user.id,
        auditor_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email!,
        store_name: storeName,
        date,
        shift: 'Regular',
        ...denominations,
        cash_total: cashTotal,
        card_total: cardTotal,
        eft_total: eftTotal,
        opening_cash: openingCash,
        payout_amount: payoutAmount,
        payout_reason: payoutReason,
        total_expected: totalExpected,
        total_actual: totalActual,
        variance: variance,
        notes,
        status: 'processed'
      });
      if (result) { setLastSavedId(result.id); setShowSuccess(true); }
    } catch (err: any) { alert(err.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-32 px-4 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
           <div className="bg-primary p-3 rounded-xl"><Sparkles className="h-6 w-6" /></div>
           <h1 className="text-2xl font-black italic uppercase italic">Final Statement</h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black uppercase text-slate-500">Asset Total</div>
              <div className="text-2xl font-black tracking-tighter">R {totalActual.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
           </div>
           <button form="cashup-form" type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-dark px-10 py-3 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-primary/20">
              {isSubmitting ? 'SAVING...' : 'CONFIRM & SAVE'}
           </button>
        </div>
      </div>

      <form id="cashup-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
           <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-200">
              <div className="space-y-1 ml-2">
                 <label className="text-[9px] font-black uppercase text-slate-400">Location</label>
                 <input className="clean-input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div className="space-y-1 ml-2">
                 <label className="text-[9px] font-black uppercase text-slate-400">Date</label>
                 <input type="date" className="clean-input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
           </section>

           <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <DenominationInput label="R 200" value={denominations.notes_200} multiplier={200} type="note" onChange={(v) => setDenominations(p => ({...p, notes_200: v}))} />
                 <DenominationInput label="R 100" value={denominations.notes_100} multiplier={100} type="note" onChange={(v) => setDenominations(p => ({...p, notes_100: v}))} />
                 <DenominationInput label="R 50" value={denominations.notes_50} multiplier={50} type="note" onChange={(v) => setDenominations(p => ({...p, notes_50: v}))} />
                 <DenominationInput label="R 20" value={denominations.notes_20} multiplier={20} type="note" onChange={(v) => setDenominations(p => ({...p, notes_20: v}))} />
                 <DenominationInput label="R 10" value={denominations.notes_10} multiplier={10} type="note" onChange={(v) => setDenominations(p => ({...p, notes_10: v}))} />
                 <DenominationInput label="R 5" value={denominations.coins_5} multiplier={5} type="coin" onChange={(v) => setDenominations(p => ({...p, coins_5: v}))} />
                 <DenominationInput label="R 2" value={denominations.coins_2} multiplier={2} type="coin" onChange={(v) => setDenominations(p => ({...p, coins_2: v}))} />
                 <DenominationInput label="R 1" value={denominations.coins_1} multiplier={1} type="coin" onChange={(v) => setDenominations(p => ({...p, coins_1: v}))} />
                 <DenominationInput label="50c" value={denominations.coins_050} multiplier={0.5} type="coin" onChange={(v) => setDenominations(p => ({...p, coins_050: v}))} />
                 <DenominationInput label="20c" value={denominations.coins_020} multiplier={0.2} type="coin" onChange={(v) => setDenominations(p => ({...p, coins_020: v}))} />
                 <DenominationInput label="10c" value={denominations.coins_010} multiplier={0.1} type="coin" onChange={(v) => setDenominations(p => ({...p, coins_010: v}))} />
              </div>
           </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
              <h2 className="text-sm font-black uppercase text-slate-400 border_b pb-4">Settlements</h2>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Opening Cash</label>
                    <div className="flex items-stretch bg-slate-50 border-2 border-slate-100 rounded-xl overflow-hidden opacity-60">
                       <div className="bg-slate-100 px-4 flex items-center justify-center font-black text-slate-400 italic">R</div>
                       <input readOnly value={openingCash.toFixed(2)} className="flex-1 px-4 py-3 bg-transparent text-xl font-black outline-none" />
                    </div>
                 </div>
                 <SettlementInput label="Card Total" value={cardTotal} onChange={setCardTotal} />
                 <SettlementInput label="EFT Total" value={eftTotal} onChange={setEftTotal} />
                 <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Payout Reason</label>
                       <input 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                         value={payoutReason} onChange={(e) => setPayoutReason(e.target.value)}
                         placeholder="e.g. Bread"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Payout Amount</label>
                       <input 
                         type="number" step="0.01"
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                         value={payoutAmount || ''} onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                         placeholder="0.00"
                       />
                    </div>
                 </div>
                 <SettlementInput label="Expected Cash Sales" value={totalExpected} onChange={setTotalExpected} />
              </div>
              <div className="pt-6 border_t border-slate-100 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Discrepancy Notes</label>
                    <textarea 
                      value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold resize-none outline-none focus:border-primary"
                      rows={3} placeholder="Optional notes..."
                    />
                 </div>
                 <SummaryCard label="Actual Asset Total" value={totalActual} variant="default" icon={<Sparkles size={16} />} />
                 <div className={cn(
                    "p-4 rounded-xl flex justify-between items-center font-black uppercase italic text-sm",
                    variance === 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                 )}>
                    <span>Cash Variance</span>
                    <span>R {variance.toFixed(2)}</span>
                 </div>
              </div>
            </section>
        </div>
      </form>

      {showSuccess && (
         <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center space-y-8 max-w-md animate-in zoom-in-95 duration-300">
               <div className="h-20 w-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={40} /></div>
               <h2 className="text-3xl font-black italic uppercase">Stored!</h2>
               <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => generatePDF(lastSavedId!)} className="bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-primary transition-all shadow-xl"><Printer size={18} className="inline mr-2" /> Download Receipt</button>
                  <button onClick={() => navigate('/history')} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 hover:text-slate-600 transition-colors">Go To Archive</button>
               </div>
            </div>
         </div>
      )}

      <style>{`
        .clean-input { width: 100%; height: 50px; background: #fafafa; border: 2px solid #f1f5f9; border-radius: 12px; padding: 0 1rem; font-weight: 900; font-size: 1.1rem; color: #0f172a; outline: none; }
        .clean-input:focus { border-color: #3b82f6; background: white; }
      `}</style>
    </div>
  );
};

const SettlementInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
   <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="flex items-stretch bg-slate-50 border-2 border-slate-100 rounded-xl overflow-hidden focus-within:border-primary transition-all">
         <div className="bg-slate-100 px-4 flex items-center justify-center font-black text-slate-400 italic">R</div>
         <input type="number" step="0.01" value={value || ''} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="flex-1 px-4 py-3 bg-transparent text-xl font-black outline-none" placeholder="0.00" />
      </div>
   </div>
);
