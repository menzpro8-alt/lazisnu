'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, formatRupiah, formatMonth } from '@/lib/api';
import StatCard from '@/components/dashboard/StatCard';
import MonthlySummaryTable from '@/components/dashboard/MonthlySummaryTable';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await apiGet('dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-48 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-[2rem]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-[400px] rounded-[2.5rem]" />
          <div className="skeleton h-[400px] rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Header Banner - Premium Gradient Style */}
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 animate-fade-in group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-600 to-green-500 group-hover:scale-105 transition-transform duration-1000"></div>
        
        {/* Abstract shapes for "Cool" factor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-[80px] -ml-24 -mb-24"></div>
        
        <div className="relative z-10 p-10 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-5 text-center md:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Sistem Aktif & Terpantau
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-xl">
              Assalamu&apos;alaikum,<br />
              <span className="text-emerald-100">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-emerald-50 text-sm md:text-lg max-w-xl font-medium opacity-90 drop-shadow-md leading-relaxed">
              Selamat datang kembali. Mari pantau amanah donasi dan laporan keuangan <span className="font-black underline decoration-emerald-400 underline-offset-4">{user?.org_name}</span> hari ini.
            </p>
          </div>
          
          <div className="shrink-0 bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2rem] flex flex-col items-center shadow-2xl transform hover:rotate-2 transition-all duration-500">
            <div className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.3em] mb-3 opacity-80">Periode Berjalan</div>
            <div className="text-2xl md:text-3xl font-black bg-white text-emerald-600 px-8 py-3 rounded-2xl shadow-xl">
              {formatMonth(data?.current_month)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-7">
        <StatCard
          title="Total Pemasukan"
          value={formatRupiah(data?.month_income || 0)}
          subtitle={`Tahun ini: ${formatRupiah(data?.year_income || 0)}`}
          color="text-emerald-600"
          delay={0}
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727 .198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621 .504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414 .336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125 .504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>}
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatRupiah(data?.month_expense || 0)}
          subtitle={`Tahun ini: ${formatRupiah(data?.year_expense || 0)}`}
          color="text-red-500"
          delay={100}
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 0.75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-0.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-0.08m-5.801 0c-0.065 0.21-0.1 0.433-0.1 0.664 0 0.414 0.336 0.75 0.75 0.75h4.5a0.75 0.75 0 0 0 0.75-0.75 2.25 2.25 0 0 0-0.1-0.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867 0.668 2.15 1.586m-5.8 0c-0.376 0.023-0.75 0.05-1.124 0.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-0.621 0-1.125 0.504-1.125v11.25c0 0.621 0.504 1.125 1.125 1.125h9.75c0.621 0 1.125-0.504 1.125-1.125V9.375c0-0.621-0.504-1.125-1.125-1.125H8.25ZM6.75 12h0.008v0.008H6.75V12Zm0 3h0.008v0.008H6.75V15Zm0 3h0.008v0.008H6.75V18Z" /></svg>}
        />
        <StatCard
          title="Saldo Efektif"
          value={formatRupiah(data?.month_balance || 0)}
          subtitle={`Total akumulasi: ${formatRupiah(data?.year_balance || 0)}`}
          color="text-blue-500"
          delay={200}
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882 .265-4.185.75M12 20.25c1.472 0 2.882 .265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122 .499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031 .352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122 .499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031 .352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /></svg>}
        />
        <StatCard
          title="Muzakki & Mustahik"
          value={`${data?.total_donors || 0} / ${data?.total_beneficiaries || 0}`}
          subtitle={data?.child_orgs_count > 0 ? `${data.child_orgs_count} Unit Cabang` : 'Lembaga Aktif'}
          color="text-amber-500"
          delay={300}
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625 .372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
        />
      </div>

      {/* Chart & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MonthlySummaryTable data={data?.chart} />
        <RecentTransactions transactions={data?.recent_transactions} />
      </div>
    </div>
  );
}
