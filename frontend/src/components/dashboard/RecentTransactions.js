'use client';
import { formatRupiah } from '@/lib/api';

export default function RecentTransactions({ transactions }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 h-full animate-fade-in flex flex-col border border-gray-100 shadow-sm" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-gray-800 flex items-center gap-4">
          <span className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          </span>
          Aktivitas Terakhir
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 custom-scrollbar">
        {(!transactions || transactions.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center min-h-[250px]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125 .504-1.125 1.125v17.25c0 .621 .504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
            </div>
            <p className="text-gray-400 font-bold">Belum ada transaksi</p>
          </div>
        ) : (
          transactions.map((tx, i) => (
            <div key={i} className="group flex items-center gap-5 p-4 rounded-3xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-110 ${
                tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
              }`}>
                {tx.type === 'income' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-gray-800 truncate group-hover:text-emerald-700 transition-colors">{tx.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400 font-bold">{tx.date || '-'}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-base font-black tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                </p>
                <span className={`text-[10px] font-black uppercase tracking-widest ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-300'}`}>
                  {tx.type === 'income' ? 'Masuk' : 'Keluar'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
