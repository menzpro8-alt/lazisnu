'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete, ORG_LEVELS } from '@/lib/api';
import Modal, { FormField, Input, Select, Button, DeleteConfirm } from '@/components/Modal';

export default function PenggunaPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'staff', org_id: '', email: '', phone: '' });

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== 'admin') { window.location.href = '/dashboard/'; return; }
    apiGet('organizations').then(r => setOrgs(r.data || [])).catch(() => {});
  }, [user, authLoading]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet('users', { page, per_page: 20, search });
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); } }, [toast]);

  function openAdd() {
    setEditData(null);
    setForm({ username: '', password: '', name: '', role: 'staff', org_id: user?.org_id || '', email: '', phone: '' });
    setModalOpen(true);
  }
  function openEdit(item) {
    setEditData(item);
    setForm({ username: item.username, password: '', name: item.name, role: item.role, org_id: item.org_id, email: item.email || '', phone: item.phone || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.username.trim() || !form.org_id) { alert('Nama, username, dan organisasi wajib diisi'); return; }
    if (!editData && !form.password) { alert('Password wajib diisi untuk user baru'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editData) { await apiPut(`users/${editData.id}`, payload); setToast('User berhasil diperbarui'); }
      else { await apiPost('users', payload); setToast('User berhasil dibuat'); }
      setModalOpen(false); loadItems();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiDelete(`users/${deleteModal.id}`);
      setToast('User berhasil dihapus');
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625 .372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Manajemen Pengguna</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">Kelola akses, role, dan akun staf organisasi</p>
            </div>
          </div>
          <button onClick={openAdd} className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card rounded-3xl p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/90 border border-gray-100 animate-fade-in shadow-sm" style={{animationDelay:'100ms'}}>
        <div className="relative w-full md:max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          <input type="text" placeholder="Cari nama atau username..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder-gray-400" />
        </div>
        <div className="text-sm font-bold text-gray-500 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100 shrink-0 self-end md:self-auto">
          Total: <span className="text-emerald-600">{pagination?.total || 0}</span> Pengguna
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl overflow-hidden animate-fade-in bg-white/90 border border-gray-100 shadow-sm" style={{animationDelay:'200ms'}}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead><tr className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-b border-gray-100">
              <th className="text-left px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs">Profil Pengguna</th>
              <th className="text-left px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs hidden md:table-cell">Unit Organisasi</th>
              <th className="text-center px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs">Role Akses</th>
              <th className="text-center px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs hidden lg:table-cell">Status</th>
              <th className="text-center px-6 py-4 font-bold text-gray-700 tracking-wide uppercase text-xs w-28">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(5)].map((_,i) => <tr key={i}><td colSpan={5} className="px-6 py-5"><div className="skeleton h-6 rounded-lg w-full" /></td></tr>) :
              items.length === 0 ? <tr><td colSpan={5} className="text-center py-16">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625 .372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                </div>
                <p className="text-gray-500 font-bold">Belum ada data pengguna</p>
              </td></tr> :
              items.map(u => (
                <tr key={u.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 text-gray-600 flex items-center justify-center font-black shadow-sm shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">{u.name}</p>
                        <p className="text-[11px] font-semibold text-gray-400 mt-0.5">@{u.username}</p>
                        <span className="inline-block mt-1 text-xs font-semibold text-gray-500 md:hidden">{u.org_name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {u.org_level && <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black mr-2 uppercase">{u.org_level}</span>}
                    <span className="text-sm font-semibold text-gray-600">{u.org_name}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border shadow-sm ${u.role === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-100/50' : 'bg-blue-50 text-blue-700 border-blue-100/50'}`}>{u.role.toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4 text-center hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`}></span>
                      <span className={`text-xs font-bold ${u.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>{u.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(u)} className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100" title="Edit Profil"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                      {u.id !== user?.id ? (
                        <button onClick={() => setDeleteModal({ open: true, id: u.id, name: u.name })} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100" title="Hapus Akun"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342 .052 .682 .107 1.022 .166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                      ) : (
                        <div className="w-8"></div>
                      )}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Data Pengguna' : 'Tambah Akun Baru'}>
        <div className="space-y-5 p-2">
          <FormField label="Nama Lengkap" required><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Sesuai KTP" /></FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Username" required><Input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Untuk login" disabled={!!editData} /></FormField>
            <FormField label={editData ? 'Ubah Password (opsional)' : 'Password'} required={!editData}><Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editData ? 'Kosongkan jika tidak diubah' : 'Min. 6 karakter'} /></FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Hak Akses (Role)" required><Select value={form.role} onChange={e => setForm({...form, role: e.target.value})}><option value="staff">Staff Operasional</option><option value="admin">Administrator</option></Select></FormField>
            <FormField label="Unit Organisasi" required>
              <Select value={form.org_id} onChange={e => setForm({...form, org_id: e.target.value})}>
                <option value="">Pilih instansi</option>
                {orgs.map(o => <option key={o.id} value={o.id}>[{o.level}] {o.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Alamat Email"><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@contoh.com" /></FormField>
            <FormField label="Nomor WhatsApp"><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="08xxxxxxxxxx" /></FormField>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end"><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Akun'}</Button></div>
        </div>
      </Modal>
      <DeleteConfirm isOpen={deleteModal.open} onClose={() => setDeleteModal({open:false,id:null,name:''})} onConfirm={handleDelete} itemName={deleteModal.name} loading={deleting} />
    </div>
  );
}
