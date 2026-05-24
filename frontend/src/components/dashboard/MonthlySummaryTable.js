'use client';
import { formatRupiah } from '@/lib/api';

export default function MonthlySummaryTable({ data }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 h-full animate-fade-in flex flex-col border border-gray-100 shadow-sm" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-gray-800 flex items-center gap-4">
          <span className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>
          </span>
          Ringkasan Bulanan
        </h3>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        {(!data || data.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center min-h-[250px]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125 .504-1.125 1.125v17.25c0 .621 .504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
            </div>
            <p className="text-gray-400 font-bold">Data belum tersedia</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-5 px-3 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Periode</th>
                <th className="text-right py-5 px-3 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Pemasukan</th>
                <th className="text-right py-5 px-3 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Pengeluaran</th>
                <th className="text-right py-5 px-3 font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...data].reverse().map((item, i) => {
                const balance = item.income - item.expense;
                return (
                  <tr key={i} className="hover:bg-gray-50/80 transition-all group">
                    <td className="py-5 px-3 font-black text-gray-700">{item.month}</td>
                    <td className="py-5 px-3 text-right font-bold text-emerald-600">+{formatRupiah(item.income)}</td>
                    <td className="py-5 px-3 text-right font-bold text-red-500">-{formatRupiah(item.expense)}</td>
                    <td className="py-5 px-3 text-right">
                      <span className={`inline-block px-3 py-1 rounded-lg font-black text-xs ${balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        {balance >= 0 ? '' : '-'}{formatRupiah(Math.abs(balance))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
