'use client';

import { formatRupiah } from '@/lib/api';

export default function ExpenseReport({ expenses, totalAmount, title = 'Laporan Pengeluaran' }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <p className="text-gray-400 text-center font-medium">Tidak ada data pengeluaran</p>
      </div>
    );
  }

  const largestExpense = expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max);
  const socialAidTotal = expenses.filter(e => e.type === 'sosial').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Total Summary */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-100">
        <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">Total Pengeluaran</p>
        <div className="flex items-baseline gap-3">
          <h2 className="text-4xl font-black text-red-700">{formatRupiah(totalAmount)}</h2>
          <p className="text-sm text-red-600 font-semibold">({expenses.length} transaksi)</p>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-2xl font-black text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 font-medium">Detail dan analisis pengeluaran Anda</p>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-50">
          {expenses.map((expense, idx) => (
            <div key={idx} className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors group">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-base leading-snug group-hover:text-red-600 transition-colors">
                    {expense.description}
                  </h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {expense.date || 'Tanggal tidak tersedia'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-black text-red-600 text-lg">{formatRupiah(expense.amount)}</p>
                  {expense.category && (
                    <span className="inline-block mt-2 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                      {expense.category}
                    </span>
                  )}
                </div>
              </div>
              {expense.notes && (
                <p className="text-sm text-gray-600 italic mt-3 pl-0">Catatan: {expense.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Largest Expense */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-100">
          <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3">Pengeluaran Terbesar</p>
          <div>
            <p className="font-bold text-gray-800 text-sm mb-2">{largestExpense.description}</p>
            <p className="text-2xl font-black text-orange-700">{formatRupiah(largestExpense.amount)}</p>
            <p className="text-xs text-orange-600 font-semibold mt-2">
              {((largestExpense.amount / totalAmount) * 100).toFixed(1)}% dari total
            </p>
          </div>
        </div>

        {/* Social Aid Total */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">Bantuan Sosial</p>
          <div>
            <p className="font-bold text-gray-800 text-sm mb-2">Total Pengeluaran Sosial</p>
            <p className="text-2xl font-black text-emerald-700">{formatRupiah(socialAidTotal)}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-2">
              {((socialAidTotal / totalAmount) * 100).toFixed(1)}% dari total
            </p>
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Analisis Ringkas</p>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-600 mt-0.5">•</span>
            <span className="text-gray-700">
              Pengeluaran terbesar adalah <strong>{largestExpense.description}</strong> sebesar <strong>{formatRupiah(largestExpense.amount)}</strong>. Ini menunjukkan fokus pada prioritas utama organisasi.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-600 mt-0.5">•</span>
            <span className="text-gray-700">
              Total pengeluaran untuk bantuan sosial mencapai <strong>{formatRupiah(socialAidTotal)}</strong> atau sebesar <strong>{((socialAidTotal / totalAmount) * 100).toFixed(1)}%</strong> dari total pengeluaran keseluruhan.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-600 mt-0.5">•</span>
            <span className="text-gray-700">
              Total pengeluaran saat ini adalah <strong>{formatRupiah(totalAmount)}</strong> yang terdiri dari <strong>{expenses.length} transaksi</strong>.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
