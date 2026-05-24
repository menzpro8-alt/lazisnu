'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, formatRupiah } from '@/lib/api';

export default function LaporanPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('income');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDateFrom(new Date().getFullYear() + '-01-01');
    setDateTo(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => { if (dateFrom && dateTo) loadReport(); }, [tab, dateFrom, dateTo]);

  async function loadReport() {
    setLoading(true);
    try {
      const endpoint = tab === 'beneficiaries' ? 'reports/beneficiaries' : `reports/${tab}`;
      const params = tab === 'beneficiaries' ? {} : { date_from: dateFrom, date_to: dateTo };
      const res = await apiGet(endpoint, params);
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const tabs = [
    { key: 'income', label: 'Laporan Pemasukan', color: 'green', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727 .198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621 .504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414 .336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125 .504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg> },
    { key: 'expense', label: 'Laporan Pengeluaran', color: 'red', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414 .336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867 .668 2.15 1.586m-5.8 0c-.376 .023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125 .504-1.125 1.125v11.25c0 .621 .504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg> },
    { key: 'beneficiaries', label: 'Penerima Manfaat', color: 'amber', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg> },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg shadow-emerald-900/5 animate-fade-in bg-white border border-gray-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/50 to-green-50/50 rounded-bl-full opacity-50"></div>
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125 .504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621 .504-1.125 1.125-1.125h2.25c.621 0 1.125 .504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621 .504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Laporan Keuangan</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Laporan komprehensif {user?.org_name} {user?.role === 'admin' && ' & jaringan di bawahnya'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{animationDelay:'100ms'}}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex-1 ${
              tab === t.key
                ? t.color === 'green' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200 scale-[1.02]' 
                : t.color === 'red' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-200 scale-[1.02]' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 scale-[1.02]'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300'
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Date filter */}
      {tab !== 'beneficiaries' && (
        <div className="glass-card rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/90 border border-gray-100 animate-fade-in shadow-sm" style={{animationDelay:'150ms'}}>
          <div className="flex items-center gap-2 text-gray-700 font-bold bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
            Periode Laporan
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-gray-700" />
            <span className="text-gray-400 font-black">—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-gray-700" />
          </div>
        </div>
      )}

      {/* Report content */}
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-24 rounded-3xl" />)}</div>
      ) : tab === 'beneficiaries' ? (
        <BeneficiaryReport data={data} />
      ) : (
        <FinancialReport data={data} type={tab} />
      )}
    </div>
  );
}

function FinancialReport({ data, type }) {
  if (!data) return null;
  const isIncome = type === 'income';

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Grand Total */}
      <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white animate-fade-in shadow-xl`} style={{animationDelay:'200ms'}}>
        <div className={`absolute inset-0 ${isIncome ? 'bg-gradient-to-r from-emerald-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-400'}`}></div>
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+Cjxwb2x5Z29uIGZpbGw9IiNmZmYiIHBvaW50cz0iNDAsMCA4MCw0MCA0MCw4MCAwLDQwIiAvPgo8L3N2Zz4=')] bg-[length:40px_40px] mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold opacity-80 uppercase tracking-widest bg-white/20 px-3 py-1 rounded-lg inline-block mb-3 border border-white/20 shadow-sm backdrop-blur-sm">Total {isIncome ? 'Pemasukan' : 'Pengeluaran'}</p>
            <p className="text-4xl sm:text-5xl font-black drop-shadow-md">{formatRupiah(data.grand_total || 0)}</p>
            <p className="text-sm font-medium opacity-90 mt-2 bg-black/10 px-3 py-1.5 rounded-lg inline-block border border-white/10 backdrop-blur-sm">Periode: {data.period?.from} — {data.period?.to}</p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
            {isIncome ? (
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            ) : (
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* By Category */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 animate-fade-in bg-white/90 border border-gray-100 shadow-sm" style={{animationDelay:'250ms'}}>
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>
            </span>
            Rincian Kategori
          </h3>
          {(!data.by_category || data.by_category.length === 0) ? (
            <p className="text-sm font-medium text-gray-400 text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">Tidak ada data pada periode ini</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead><tr className="border-b-2 border-gray-100">
                  <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Kategori</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Organisasi</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Jml Tx</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Total</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.by_category.map((row, i) => (
                    <tr key={i} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="py-3.5 px-4 font-bold text-gray-800">{row.category}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-500">{row.org_name}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-bold">{row.count}</span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-black ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>{formatRupiah(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Monthly Trend Table */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 animate-fade-in bg-white/90 border border-gray-100 shadow-sm" style={{animationDelay:'300ms'}}>
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${isIncome ? 'bg-emerald-500' : 'bg-red-500'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>
            </span>
            Rekap Bulanan
          </h3>
          {(!data.monthly || data.monthly.length === 0) ? (
            <p className="text-sm font-medium text-gray-400 text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">Tidak ada data bulan ini</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead><tr className="border-b-2 border-gray-100">
                  <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Bulan</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Total {isIncome ? 'Pemasukan' : 'Pengeluaran'}</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.monthly.map((row, i) => (
                    <tr key={i} className={`hover:bg-gray-50 transition-colors group`}>
                      <td className="py-3.5 px-4 font-bold text-gray-800 uppercase text-xs">{row.month}</td>
                      <td className={`py-3.5 px-4 text-right font-black ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>{formatRupiah(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BeneficiaryReport({ data }) {
  if (!data || data.length === 0) return (
    <div className="glass-card rounded-3xl p-12 text-center animate-fade-in bg-white/90 border border-gray-100 shadow-sm">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 0 0 2.625 .372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
      </div>
      <p className="text-gray-500 font-bold">Tidak ada data penerima manfaat</p>
    </div>
  );

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 animate-fade-in bg-white/90 border border-gray-100 shadow-sm" style={{animationDelay:'200ms'}}>
      <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
        </span>
        Laporan Penyaluran Bantuan
      </h3>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-gray-100 bg-gray-50/50">
            <th className="text-left py-4 px-5 font-bold text-gray-600 uppercase tracking-wider text-xs rounded-tl-xl">Kategori Program</th>
            <th className="text-left py-4 px-5 font-bold text-gray-600 uppercase tracking-wider text-xs">Organisasi Penyalur</th>
            <th className="text-center py-4 px-5 font-bold text-gray-600 uppercase tracking-wider text-xs">Jumlah Penerima</th>
            <th className="text-right py-4 px-5 font-bold text-gray-600 uppercase tracking-wider text-xs rounded-tr-xl">Total Disalurkan</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-amber-50/30 transition-colors group">
                <td className="py-4 px-5 font-black text-gray-800">{row.category || 'Tanpa Kategori'}</td>
                <td className="py-4 px-5 text-sm font-semibold text-gray-500">{row.org_name}</td>
                <td className="py-4 px-5 text-center">
                  <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm">{row.total_beneficiaries} Jiwa</span>
                </td>
                <td className="py-4 px-5 text-right font-black text-lg text-amber-600 tracking-tight">{formatRupiah(row.total_distributed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
