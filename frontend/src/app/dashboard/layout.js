'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AIFloatingWidget from '@/components/AIFloatingWidget';

export default function DashboardLayout({ children }) {
  const { user, loading, mounted } = useAuth();

  useEffect(() => {
    if (mounted && !loading && !user) {
      window.location.href = '/';
    }
  }, [user, loading, mounted]);

  // Tampilkan loading spinner selama belum ter-mount atau masih loading
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-600 mx-auto mb-5 flex items-center justify-center shadow-xl shadow-emerald-200 animate-pulse-glow">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818 .879 .659c1.171 .879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-green-700 font-bold tracking-wide">Memuat Sistem...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-full blur-3xl opacity-60 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-green-100/30 to-transparent rounded-full blur-3xl opacity-50 transform -translate-x-1/4 translate-y-1/4"></div>
      </div>

      <Navbar />

      {/* Main content */}
      <div className="relative z-10 w-full">
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>

      <AIFloatingWidget />
    </div>
  );
}
