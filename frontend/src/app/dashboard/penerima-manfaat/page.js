'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, formatRupiah } from '@/lib/api';
import Modal, { FormField, Input, Select, Textarea, Button, DeleteConfirm } from '@/components/Modal';

const CATEGORIES = ['Fakir', 'Miskin', 'Yatim', 'Piatu', 'Janda', 'Lansia', 'Disabilitas', 'Lainnya'];

export default function PenerimaManfaatPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', nik: '', category: '', notes: '' });

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15, search };
      if (filterCat) params.category = filterCat;
      const res = await apiGet('beneficiaries', params);
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, filterCat]);

  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); } }, [toast]);

  function openAdd() {
    setEditData(null);
    setForm({ name: '', phone: '', address: '', nik: '', category: '', notes: '' });
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditData(item);
    setForm({ name: item.name, phone: item.phone || '', address: item.address || '', nik: item.nik || '', category: item.category || '', notes: item.notes || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editData) { await apiPut(`beneficiaries/${editData.id}`, form); setToast('Data berhasil diperbarui'); }
      else { await apiPost('beneficiaries', form); setToast('Data berhasil ditambahkan'); }
      setModalOpen(false); loadItems();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`beneficiaries/${deleteModal.id}`);
      setToast('Data berhasil dihapus');
      setDeleteModal({ open: false, id: null, name: '' }); loadItems();
    } catch (err) { alert(err.message); } finally { setDeleting(false); }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-900/20 animate-slide-left text-sm font-bold flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg shadow-emerald-900/5 animate-fade-in bg-white border border-gray-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/50 to-green-50/50 rounded-bl-full opacity-50"></div>
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Penerima Manfaat (Mustahiq)</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">Kelola dan pantau data penerima manfaat program LAZISNU</p>
            </div>
          </div>
          <button onClick={openAdd} className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Tambah Penerima
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card rounded-3xl p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/90 border border-gray-100 animate-fade-in shadow-sm" style={{animationDelay:'100ms'}}>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:max-w-2xl">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input type="text" placeholder="Cari nama, NIK, telp..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder-gray-400" />
          </div>
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} className="w-full sm:w-48 px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none shrink-0">
            <option value="">Semua Asnaf/Kategori</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="text-sm font-bold text-gray-500 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100 shrink-0 self-end md:self-auto">
          Total: <span className="text-emerald-600">{pagination?.total || 0}</span> Penerima
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl overflow-hidden animate-fade-in bg-white/90 border border-gray-100 shadow-sm" style={{animationDelay:'200ms'}}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead><tr className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-b border-gray-100">
              <th className="text-left px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs">Identitas Penerima</th>
              <th className="text-left px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs hidden md:table-cell">Kategori (Asnaf)</th>
              <th className="text-left px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs hidden lg:table-cell">Alamat & Kontak</th>
              <th className="text-right px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs">Total Diterima</th>
              <th className="text-center px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs w-28">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(5)].map((_,i) => <tr key={i}><td colSpan={5} className="px-6 py-5"><div className="skeleton h-6 rounded-lg w-full" /></td></tr>) :
              items.length === 0 ? <tr><td colSpan={5} className="text-center py-16">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625 .372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                </div>
                <p className="text-gray-500 font-bold">Belum ada data penerima manfaat</p>
                <p className="text-gray-400 text-sm mt-1">Tambahkan data mustahiq untuk disalurkan dana ZIS.</p>
              </td></tr> :
              items.map(d => (
                <tr key={d.id} className="hover:bg-amber-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-sm shrink-0">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">{d.name}</p>
                        {d.nik && <p className="text-[11px] font-semibold text-gray-400 mt-0.5">NIK: {d.nik}</p>}
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 md:hidden">{d.category || 'Belum dikategorikan'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100/80 text-gray-600 border border-gray-200">{d.category || 'Tanpa Kategori'}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm font-medium text-gray-500 truncate max-w-[200px]" title={d.address}>{d.address || '-'}</p>
                    {d.phone && <p className="text-[11px] font-semibold text-gray-400 mt-1 flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902 .055-1.173 .417l-.97 1.293c-2.896-1.596-5.273-3.974-6.869-6.869l1.293-.97c.363-.271 .527-.734 .417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>{d.phone}</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-black text-sm border border-amber-100/50 shadow-sm">{formatRupiah(d.total_received || 0)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(d)} className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                      <button onClick={() => setDeleteModal({ open: true, id: d.id, name: d.name })} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342 .052 .682 .107 1.022 .166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
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
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm">Sebelumnya</button>
              <button onClick={() => setPage(p => Math.min(pagination.total_pages, p+1))} disabled={page >= pagination.total_pages} className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm">Selanjutnya</button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Data Penerima Manfaat' : 'Tambah Penerima Manfaat Baru'}>
        <div className="space-y-5 p-2">
          <FormField label="Nama Lengkap (Mustahiq)" required><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Bpk. Fulan" /></FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Kategori Asnaf"><Select value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option value="">Pilih kategori (Asnaf)</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</Select></FormField>
            <FormField label="NIK (KTP)"><Input value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} placeholder="16 Digit NIK" /></FormField>
          </div>
          <FormField label="Nomor Telepon / WA"><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="08xxxxxxxxxx" /></FormField>
          <FormField label="Alamat Lengkap"><Textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Jalan, RT/RW, Desa..." rows={3} /></FormField>
          <FormField label="Catatan Kondisi"><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Catatan kondisi mustahiq..." rows={2} /></FormField>
          <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end"><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Data'}</Button></div>
        </div>
      </Modal>
      <DeleteConfirm isOpen={deleteModal.open} onClose={() => setDeleteModal({open:false,id:null,name:''})} onConfirm={handleDelete} itemName={deleteModal.name} loading={deleting} />
    </div>
  );
}
