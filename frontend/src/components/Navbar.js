'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ORG_LEVELS } from '@/lib/api';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
  {
    label: 'Donatur',
    href: '/dashboard/donatur',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625 .372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    label: 'Penerima Manfaat',
    href: '/dashboard/penerima-manfaat',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
  },
  {
    label: 'Pemasukan',
    href: '/dashboard/pemasukan',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727 .198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621 .504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414 .336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125 .504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
  {
    label: 'Pengeluaran',
    href: '/dashboard/pengeluaran',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414 .336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867 .668 2.15 1.586m-5.8 0c-.376 .023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125 .504-1.125 1.125v11.25c0 .621 .504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
  {
    label: 'Laporan',
    href: '/dashboard/laporan',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125 .504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621 .504-1.125 1.125-1.125h2.25c.621 0 1.125 .504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621 .504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
];

const adminMenuItems = [
  {
    label: 'Kelola Pengguna',
    href: '/dashboard/pengguna',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625 .372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    label: 'Organisasi',
    href: '/dashboard/organisasi',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621 .504-1.125 1.125-1.125h2.25c.621 0 1.125 .504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Disable body scroll when sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileMenuOpen]);

  const orgLevel = user?.org_level ? ORG_LEVELS[user.org_level] : null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo area */}
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <img 
                  src="/logo-lazisnu.jpg" 
                  alt="LAZISNU" 
                  className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">LAZISNU</h1>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{user?.org_name || 'Sistem Keuangan'}</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200
                      ${isActive 
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50' 
                        : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'
                      }`}
                  >
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {item.label}
                  </Link>
                );
              })}
              
              {user?.role === 'admin' && (
                <div className="relative group px-2">
                  <button className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    adminMenuItems.some(item => pathname?.startsWith(item.href)) 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50' 
                    : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'
                  }`}>
                    Admin
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top -translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                    <div className="py-2">
                      {adminMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* Right side area */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Profile */}
              <div className="hidden sm:flex items-center gap-3 border-l border-gray-100 pl-5">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${user?.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{user?.role}</span>
                  </div>
                </div>
                <button onClick={logout} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-gray-100 hover:border-red-100 group" title="Keluar">
                  <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sidebar */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-screen w-64 bg-white z-50 shadow-2xl animate-slide-left flex flex-col lg:hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                  <img 
                    src="/logo-lazisnu.jpg" 
                    alt="LAZISNU" 
                    className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {/* User Profile */}
                <div className="mb-6 flex items-center gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{user?.name}</p>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5 capitalize">{user?.role}</p>
                  </div>
                </div>

                {/* Main Menu */}
                <div className="mb-6">
                  <p className="px-2 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Menu Utama</p>
                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                            ${isActive 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                            }`}
                        >
                          <span className={isActive ? 'text-emerald-600' : 'text-gray-400'}>{item.icon}</span>
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Admin Menu */}
                {user?.role === 'admin' && (
                  <div className="mb-6">
                    <p className="px-2 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrasi</p>
                    <div className="space-y-1">
                      {adminMenuItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                              ${isActive 
                                ? 'bg-amber-50 text-amber-700' 
                                : 'text-gray-600 hover:text-amber-600 hover:bg-gray-50'
                              }`}
                          >
                            <span className={isActive ? 'text-amber-600' : 'text-gray-400'}>{item.icon}</span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  Keluar
                </button>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
