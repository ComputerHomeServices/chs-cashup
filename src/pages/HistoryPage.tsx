import { useState } from 'react';
import { useCashups } from '../hooks/useCashups';
import { format } from 'date-fns';
import { Search, Printer, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Cashup } from '../types';

export const HistoryPage = () => {
  const { cashups, loading } = useCashups();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCashup, setSelectedCashup] = useState<Cashup | null>(null);

  const filteredCashups = cashups.filter(c => 
    c.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.date.includes(searchTerm) ||
    (c.auditor_name && c.auditor_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const generatePDF = (c: Cashup) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text('CHS CASHUP AUDIT', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Reference ID: ${c.id.substring(0, 8)}`, 14, 30);
      doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 196, 30, { align: 'right' });

      autoTable(doc, {
        startY: 35,
        head: [['Field', 'Value']],
        body: [
          ['Store Location', c.store_name],
          ['Audit Date', format(new Date(c.date), 'EEEE, dd MMMM yyyy')],
          ['Auditor Name', c.auditor_name || 'Not Captured'],
          ['Audit Status', c.status.toUpperCase()]
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 }
      });

      const denomRows = [
        ['R 200 Notes', c.notes_200, `R ${(c.notes_200 * 200).toFixed(2)}`],
        ['R 100 Notes', c.notes_100, `R ${(c.notes_100 * 100).toFixed(2)}`],
        ['R 50 Notes', c.notes_50, `R ${(c.notes_50 * 50).toFixed(2)}`],
        ['R 20 Notes', c.notes_20, `R ${(c.notes_20 * 20).toFixed(2)}`],
        ['R 10 Notes', c.notes_10, `R ${(c.notes_10 * 10).toFixed(2)}`],
        ['R 5 Coins', c.coins_5, `R ${(c.coins_5 * 5).toFixed(2)}`],
        ['R 2 Coins', c.coins_2, `R ${(c.coins_2 * 2).toFixed(2)}`],
        ['R 1 Coins', c.coins_1, `R ${(c.coins_1 * 1).toFixed(2)}`],
        ['50c Coins', c.coins_050, `R ${(c.coins_050 * 0.5).toFixed(2)}`],
        ['20c Coins', c.coins_020, `R ${(c.coins_020 * 0.2).toFixed(2)}`],
        ['10c Coins', c.coins_010, `R ${(c.coins_010 * 0.1).toFixed(2)}`],
      ];

      doc.setFontSize(14);
      doc.text('Cash Inventory Breakdown', 14, (doc as any).lastAutoTable.finalY + 10);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 15,
        head: [['Denomination', 'Quantity', 'Amount']],
        body: denomRows,
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50] },
        styles: { fontSize: 9 }
      });

      const totalRows = [
        ['Total Cash', `R ${c.cash_total.toFixed(2)}`],
        ['Total Cards', `R ${c.card_total.toFixed(2)}`],
        ['Total EFT', `R ${c.eft_total.toFixed(2)}`],
        ['GRAND TOTAL', `R ${c.total_actual.toFixed(2)}`]
      ];

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        body: totalRows,
        theme: 'plain',
        styles: { fontSize: 12, fontStyle: 'bold', halign: 'right' },
        columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 40 } }
      });

      if (c.notes) {
        doc.setFontSize(10);
        doc.text('Auditor Notes:', 14, (doc as any).lastAutoTable.finalY + 10);
        doc.text(c.notes, 14, (doc as any).lastAutoTable.finalY + 15, { maxWidth: 180 });
      }

      doc.save(`Audit_${c.store_name}_${c.date}.pdf`);
    } catch (err) {
      console.error('PDF History Error:', err);
      alert('PDF generation failed.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight italic uppercase">Audit Archive</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Review and Reprint Historical Session Documents</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audits..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border_b border-slate-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Store Location</th>
                <th className="px-6 py-4">Auditor</th>
                <th className="px-6 py-4">Actual Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCashups.map((c) => (
                <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                    {format(new Date(c.date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900">{c.store_name}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 italic">
                    {c.auditor_name || 'System'}
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-slate-900">
                    R {c.total_actual.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      c.status === 'processed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => setSelectedCashup(c)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-black text-slate-600 uppercase transition-all"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => generatePDF(c)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white hover:bg-primary-dark rounded-lg text-[10px] font-black uppercase shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                      <Printer size={14} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCashup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Audit Summary</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedCashup.store_name}</p>
              </div>
              <button 
                onClick={() => setSelectedCashup(null)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-slate-400 uppercase text-[10px]">Information</div>
                  <DetailRow label="Auditor" value={selectedCashup.auditor_name || 'N/A'} />
                  <DetailRow label="Date" value={format(new Date(selectedCashup.date), 'dd MMM yyyy')} />
                </div>
                <div className="space-y-3 font-black text-slate-900">
                  <div className="flex justify-between font-bold text-slate-400 uppercase text-[10px]">Financials</div>
                  <DetailRow label="Grand Total" value={`R ${selectedCashup.total_actual.toLocaleString()}`} />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button 
                  onClick={() => generatePDF(selectedCashup)}
                  className="flex-1 flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                >
                  <Printer size={20} /> PRINT OFFICIAL REPORT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="font-bold text-slate-400 text-xs">{label}</span>
    <span className="font-black text-slate-900">{value}</span>
  </div>
);
