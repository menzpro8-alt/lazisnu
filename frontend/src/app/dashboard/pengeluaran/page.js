'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, formatRupiah, formatDateShort } from '@/lib/api';
import Modal, { FormField, Input, Select, Textarea, Button, DeleteConfirm } from '@/components/Modal';
import ExpenseReport from '@/components/ExpenseReport';

export default function PengeluaranPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ category_id: '', beneficiary_id: '', amount: '', date: '', description: '', receipt_number: '' });

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15, search };
      if (filterCat) params.category_id = filterCat;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await apiGet('expenses', params);
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, filterCat, dateFrom, dateTo]);

  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => {
    apiGet('expense-categories').then(r => setCategories(r.data || [])).catch(() => {});
    apiGet('beneficiaries', { per_page: 100 }).then(r => setBeneficiaries(r.data || [])).catch(() => {});
  }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); } }, [toast]);

  function openAdd() {
    setEditData(null);
    setForm({ category_id: '', beneficiary_id: '', amount: '', date: new Date().toISOString().split('T')[0], description: '', receipt_number: '' });
    setModalOpen(true);
  }
  function openEdit(item) {
    setEditData(item);
    setForm({ category_id: item.category_id, beneficiary_id: item.beneficiary_id || '', amount: item.amount, date: item.date, description: item.description || '', receipt_number: item.receipt_number || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.category_id || !form.amount || !form.date) { alert('Kategori, jumlah, dan tanggal wajib diisi'); return; }
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), beneficiary_id: form.beneficiary_id || null };
      if (editData) { await apiPut(`expenses/${editData.id}`, payload); setToast('Pengeluaran berhasil diperbarui'); }
      else { await apiPost('expenses', payload); setToast('Pengeluaran berhasil ditambahkan'); }
      setModalOpen(false); loadItems();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`expenses/${deleteModal.id}`);
      setToast('Pengeluaran berhasil dihapus');
      setDeleteModal({ open: false, id: null, name: '' }); loadItems();
    } catch (err) { alert(err.message); } finally { setDeleting(false); }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-red-900/20 animate-slide-left text-sm font-bold flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg shadow-red-900/5 animate-fade-in bg-white border border-gray-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100/50 to-rose-50/50 rounded-bl-full opacity-50"></div>
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 border border-red-100 flex items-center justify-center text-red-600 shadow-sm shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414 .336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867 .668 2.15 1.586m-5.8 0c-.376 .023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125 .504-1.125 1.125v11.25c0 .621 .504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Catat Pengeluaran</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">Kelola penyaluran dana dan beban operasional</p>
            </div>
          </div>
          <button onClick={openAdd} className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:shadow-lg hover:shadow-red-200 hover:-translate-y-0.5 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Tambah Pengeluaran
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-3xl p-4 md:p-5 animate-fade-in bg-white/90 border border-gray-100 shadow-sm" style={{animationDelay:'100ms'}}>
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input type="text" placeholder="Cari transaksi..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder-gray-400" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} className="w-full sm:w-48 px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all appearance-none">
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="w-full sm:w-40 px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all" />
              <span className="text-gray-400 font-bold">—</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="w-full sm:w-40 px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Expense Report Summary */}
      {items.length > 0 && !loading && (
        <div className="animate-fade-in" style={{animationDelay:'150ms'}}>
          <ExpenseReport 
            expenses={items.map(item => ({
              description: item.description || item.category_name,
              date: formatDateShort(item.date),
              amount: item.amount,
              category: item.category_name,
              notes: item.receipt_number ? `Kwitansi: ${item.receipt_number}` : ''
            }))}
            totalAmount={items.reduce((sum, item) => sum + item.amount, 0)}
            title="Ringkasan Pengeluaran"
          />
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-3xl overflow-hidden animate-fade-in bg-white/90 border border-gray-100 shadow-sm" style={{animationDelay:'200ms'}}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead><tr className="bg-gradient-to-r from-red-50/50 to-rose-50/50 border-b border-gray-100">
              <th className="text-left px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs">Informasi Transaksi</th>
              <th className="text-left px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs hidden md:table-cell">Penerima Manfaat</th>
              <th className="text-left px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs hidden lg:table-cell">Keterangan</th>
              <th className="text-right px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs">Jumlah Disalurkan</th>
              <th className="text-center px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs w-28">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(5)].map((_,i) => <tr key={i}><td colSpan={5} className="px-6 py-5"><div className="skeleton h-6 rounded-lg w-full" /></td></tr>) :
              items.length === 0 ? <tr><td colSpan={5} className="text-center py-16">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125 .504-1.125 1.125v17.25c0 .621 .504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                </div>
                <p className="text-gray-500 font-bold">Belum ada data transaksi</p>
                <p className="text-gray-400 text-sm mt-1">Ganti filter atau catat pengeluaran baru.</p>
              </td></tr> :
              items.map(d => (
                <tr key={d.id} className="hover:bg-red-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800 mb-1">{formatDateShort(d.date)}</p>
                    <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-100/50 text-red-700 border border-red-100">{d.category_name}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {d.beneficiary_name ? (
                      <p className="font-bold text-gray-700 group-hover:text-red-700 transition-colors">{d.beneficiary_name}</p>
                    ) : (
                      <p className="text-gray-400 font-medium italic">Tidak Diketahui / Operasional</p>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm font-medium text-gray-500 truncate max-w-[200px]" title={d.description}>{d.description || '-'}</p>
                    {d.receipt_number && <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Kwitansi: {d.receipt_number}</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-black text-sm border border-red-100/50 shadow-sm">{formatRupiah(d.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(d)} className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                      <button onClick={() => setDeleteModal({ open: true, id: d.id, name: d.category_name })} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342 .052 .682 .107 1.022 .166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination?.total_pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 gap-4">
            <p className="text-sm font-semibold text-gray-500">Menampilkan Halaman {pagination.page} dari {pagination.total_pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page<=1} className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm">Sebelumnya</button>
              <button onClick={() => setPage(p => Math.min(pagination.total_pages,p+1))} disabled={page>=pagination.total_pages} className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm">Selanjutnya</button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Data Pengeluaran' : 'Form Penyaluran Dana'}>
        <div className="space-y-5 p-2">
          <FormField label="Kategori Penyaluran" required><Select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}><option value="">Pilih kategori beban/penyaluran</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Jumlah Disalurkan (Rp)" required><Input type="number" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="Contoh: 500000" /></FormField>
            <FormField label="Tanggal Penyaluran" required><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></FormField>
          </div>
          <FormField label="Penerima Manfaat (Mustahiq)"><Select value={form.beneficiary_id} onChange={e => setForm({...form, beneficiary_id: e.target.value})}><option value="">-- Tidak Diketahui / Operasional --</option>{beneficiaries.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></FormField>
          <FormField label="Nomor Kwitansi / Bukti"><Input value={form.receipt_number} onChange={e => setForm({...form, receipt_number: e.target.value})} placeholder="Opsional" /></FormField>
          <FormField label="Keterangan Tambahan"><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Catatan transaksi..." rows={2} /></FormField>
          <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end"><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Memproses...' : 'Simpan Transaksi'}</Button></div>
        </div>
      </Modal>
      <DeleteConfirm isOpen={deleteModal.open} onClose={() => setDeleteModal({open:false,id:null,name:''})} onConfirm={handleDelete} itemName={deleteModal.name} loading={deleting} />
    </div>
  );
}
