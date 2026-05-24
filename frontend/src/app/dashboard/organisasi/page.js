'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete, ORG_LEVELS, getChildLevel } from '@/lib/api';
import Modal, { FormField, Input, Select, Textarea, Button, DeleteConfirm } from '@/components/Modal';

const OrgNodeComponent = ({ org, depth = 0, onEdit, onCreateUser, onDelete, usersMap }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = org.children && org.children.length > 0;
  const userCount = usersMap?.[org.id] || 0;
  const colors = {
    PP: 'from-green-500 to-green-600 shadow-green-200 text-white',
    PW: 'from-emerald-400 to-emerald-500 shadow-emerald-200 text-white',
    PC: 'from-teal-400 to-teal-500 shadow-teal-200 text-white',
    MWC: 'from-cyan-400 to-cyan-500 shadow-cyan-200 text-white',
    PR: 'from-sky-400 to-sky-500 shadow-sky-200 text-white',
  };
  const lineColors = {
    PP: 'border-green-300',
    PW: 'border-emerald-300',
    PC: 'border-teal-300',
    MWC: 'border-cyan-300',
    PR: 'border-sky-300',
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${depth * 50}ms` }}>
      <div className="flex items-start gap-4 mb-3 relative group" style={{ paddingLeft: `${depth * 32}px` }}>
        {depth > 0 && (
          <div className={`absolute top-0 left-0 h-10 border-l-2 border-b-2 rounded-bl-xl ${lineColors[org.level] || 'border-gray-200'}`} style={{ left: `${(depth - 1) * 32 + 16}px`, width: '16px' }} />
        )}
        
        <div className="flex-1 glass-card rounded-2xl p-4 bg-white/90 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-4 group-hover:-translate-y-0.5">
          {hasChildren ? (
            <button onClick={() => setExpanded(!expanded)} className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-sm ${expanded ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-600'}`}>
              <svg className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
            </button>
          ) : <div className="w-8 shrink-0" />}
          
          <div className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center font-black shadow-md ${colors[org.level] || 'from-gray-400 to-gray-500 shadow-gray-200'}`}>
            {org.level}
          </div>
          
          <div className="flex-1 min-w-0 py-1">
            <h4 className="font-black text-gray-800 text-base truncate group-hover:text-emerald-700 transition-colors">{org.name}</h4>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {userCount > 0 && (
                <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1.5c-2.5 0-4 1.5-4 3.5v1a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-1c0-2-1.5-3.5-4-3.5z" /></svg>
                  {userCount} {userCount === 1 ? 'pengguna' : 'pengguna'}
                </p>
              )}
              {userCount === 0 && (
                <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Belum ada akun</p>
              )}
              {org.address && <p className="text-xs font-semibold text-gray-500 truncate flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>{org.address}</p>}
              {org.phone && <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902 .055-1.173 .417l-.97 1.293c-2.896-1.596-5.273-3.974-6.869-6.869l1.293-.97c.363-.271 .527-.734 .417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>{org.phone}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {userCount === 0 && (
              <button onClick={() => onCreateUser(org)} className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-all shadow-sm border border-transparent hover:border-blue-200" title="Buat Akun">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A6.375 6.375 0 0 1 3 19.235Z" /></svg>
              </button>
            )}
            <button onClick={() => onEdit(org)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm border border-transparent hover:border-emerald-100" title="Edit Organisasi">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
            </button>
            <button onClick={() => onDelete(org)} className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-all shadow-sm border border-transparent hover:border-red-200" title="Hapus Organisasi">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342 .052 .682 .107 1.022 .166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059 .68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18 .037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </button>
          </div>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute top-0 bottom-6 border-l-2 border-gray-200/50 z-0" style={{ left: `${depth * 32 + 16}px` }} />
          <div className="relative z-10">
            {org.children.map(child => <OrgNode key={child.id} org={child} depth={depth + 1} onEdit={onEdit} onCreateUser={onCreateUser} onDelete={onDelete} usersMap={usersMap} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const OrgNode = memo(({ org, depth = 0, onEdit, onCreateUser, onDelete, usersMap }) => <OrgNodeComponent org={org} depth={depth} onEdit={onEdit} onCreateUser={onCreateUser} onDelete={onDelete} usersMap={usersMap} />);

export default function OrganisasiPage() {
  const { user, loading: authLoading } = useAuth();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', level: '', parent_id: '', address: '', phone: '', email: '' });
  
  // User creation modal (terpisah)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedOrgForUser, setSelectedOrgForUser] = useState(null);
  const [userSaving, setUserSaving] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', name: '', role: 'admin', email: '', phone: '' });
  
  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteOrgData, setDeleteOrgData] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Users count per org
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== 'admin') { window.location.href = '/dashboard/'; return; }
    loadOrgs();
  }, [user, authLoading]);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); } }, [toast]);

  // Disable body scroll when modals are open
  useEffect(() => {
    if (modalOpen || userModalOpen || deleteModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [modalOpen, userModalOpen, deleteModalOpen]);

  async function loadOrgs() {
    setLoading(true);
    try {
      const [orgsRes, usersRes] = await Promise.all([
        apiGet('organizations'),
        apiGet('users', { per_page: 1000 })
      ]);
      setOrgs(orgsRes.data || []);
      
      // Build users map: org_id -> count
      const map = {};
      (usersRes.data || []).forEach(u => {
        map[u.org_id] = (map[u.org_id] || 0) + 1;
      });
      setUsersMap(map);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openAdd() {
    const childLevel = getChildLevel(user?.org_level);
    setEditData(null);
    setForm({ name: '', level: childLevel || '', parent_id: user?.org_id || '', address: '', phone: '', email: '' });
    setModalOpen(true);
  }

  function openEdit(org) {
    setEditData(org);
    setForm({ name: org.name, level: org.level, parent_id: org.parent_id || '', address: org.address || '', phone: org.phone || '', email: org.email || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editData) { 
        await apiPut(`organizations/${editData.id}`, form); 
        setToast('Organisasi berhasil diperbarui'); 
        setModalOpen(false); 
        loadOrgs();
      } else { 
        const res = await apiPost('organizations', form); 
        setToast('Organisasi berhasil dibuat');
        setModalOpen(false);
        loadOrgs();
      }
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  }

  function openCreateUserModal(org) {
    setSelectedOrgForUser(org);
    setUserForm({ username: '', password: '', name: '', role: 'admin', email: '', phone: '' });
    setUserModalOpen(true);
  }

  function openDeleteModal(org) {
    setDeleteOrgData(org);
    setDeleteModalOpen(true);
  }

  async function handleAddUser() {
    if (!userForm.name.trim() || !userForm.username.trim() || !userForm.password) { 
      alert('Nama, username, dan password wajib diisi'); 
      return; 
    }
    setUserSaving(true);
    try {
      await apiPost('users', { ...userForm, org_id: selectedOrgForUser.id });
      setToast('Akun berhasil dibuat');
      setUserModalOpen(false);
      setUserForm({ username: '', password: '', name: '', role: 'admin', email: '', phone: '' });
      setSelectedOrgForUser(null);
      loadOrgs();
    } catch (err) { alert(err.message); } finally { setUserSaving(false); }
  }

  async function handleDelete() {
    if (!deleteOrgData) return;
    setDeleting(true);
    try {
      await apiDelete(`organizations/${deleteOrgData.id}`);
      setToast('Organisasi berhasil dihapus');
      setDeleteModalOpen(false);
      setDeleteOrgData(null);
      loadOrgs();
    } catch (err) { alert(err.message); } finally { setDeleting(false); }
  }

  // Build tree
  const buildTree = useCallback((items, parentId = null) => {
    return items
      .filter(o => (parentId === null ? !o.parent_id : String(o.parent_id) === String(parentId)))
      .map(o => ({ ...o, children: buildTree(items, o.id) }));
  }, []);

  const tree = useMemo(() => buildTree(orgs), [orgs, buildTree]);

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
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621 .504-1.125 1.125-1.125h2.25c.621 0 1.125 .504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" /></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">Struktur Organisasi</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">Kelola hierarki organisasi LAZISNU</p>
            </div>
          </div>
          {getChildLevel(user?.org_level) && (
            <button onClick={openAdd} className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Tambah Unit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="glass-card rounded-3xl p-6 lg:p-10 animate-fade-in bg-white/90 border border-gray-100 shadow-sm" style={{animationDelay:'100ms'}}>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-2 rounded-full bg-emerald-500"></div>
          <h2 className="text-xl font-bold text-gray-800">Pohon Organisasi</h2>
        </div>
        
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
        ) : tree.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621 .504-1.125 1.125-1.125h3.75c.621 0 1.125 .504 1.125 1.125V21" /></svg>
            </div>
            <p className="text-gray-500 font-bold">Tidak ada data organisasi</p>
          </div>
        ) : (
          <div className="pt-2">
            {tree.map(org => <OrgNode key={org.id} org={org} onEdit={openEdit} onCreateUser={openCreateUserModal} onDelete={openDeleteModal} usersMap={usersMap} />)}
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Data Organisasi' : 'Tambah Unit Baru'}>
        <div className="space-y-5 p-2">
          <FormField label="Nama Organisasi" required><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: PW LAZISNU Jawa Timur" /></FormField>
          {!editData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Tingkat (Level)" required>
                <Select value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                  <option value="">Pilih level</option>
                  {Object.entries(ORG_LEVELS).map(([key, val]) => <option key={key} value={key}>{key} - {val.sublabel}</option>)}
                </Select>
              </FormField>
              <FormField label="Induk Organisasi" required>
                <Select value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})}>
                  <option value="">Pilih induk</option>
                  {orgs
                    .filter(o => {
                      if (!form.level) return true;
                      const parentMap = { PW: 'PP', PC: 'PW', MWC: 'PC', PR: 'MWC' };
                      return o.level === parentMap[form.level];
                    })
                    .map(o => <option key={o.id} value={o.id}>[{o.level}] {o.name}</option>)}
                </Select>
              </FormField>
            </div>
          )}
          <FormField label="Alamat Kantor"><Textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Alamat lengkap kantor sekretariat" rows={3} /></FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Nomor Telepon"><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="08xxxxxxxxxx" /></FormField>
            <FormField label="Email"><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@contoh.com" /></FormField>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Data'}</Button>
          </div>
        </div>
      </Modal>

      {/* User Creation Modal */}
      <Modal isOpen={userModalOpen} onClose={() => { setUserModalOpen(false); setSelectedOrgForUser(null); }} title="Buat Akun Pengguna">
        <div className="space-y-5 p-2">
          <p className="text-sm text-gray-600">Buat akun pengguna untuk organisasi <span className="font-bold">{selectedOrgForUser?.name}</span></p>
          <FormField label="Nama Lengkap" required><Input value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} placeholder="Nama pengguna" /></FormField>
          <FormField label="Username" required><Input value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} placeholder="Username untuk login" /></FormField>
          <FormField label="Password" required><Input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="Minimal 6 karakter" /></FormField>
          <FormField label="Role"><Select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}><option value="admin">Admin Organisasi</option><option value="staff">Staff</option></Select></FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Email"><Input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="email@contoh.com" /></FormField>
            <FormField label="Telepon"><Input value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} placeholder="08xxxxxxxxxx" /></FormField>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
            <Button variant="secondary" onClick={() => { setUserModalOpen(false); setSelectedOrgForUser(null); }}>Batal</Button>
            <Button onClick={handleAddUser} disabled={userSaving}>{userSaving ? 'Membuat...' : 'Buat Akun'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <DeleteConfirm 
        isOpen={deleteModalOpen} 
        onClose={() => { setDeleteModalOpen(false); setDeleteOrgData(null); }} 
        onConfirm={handleDelete} 
        itemName={deleteOrgData?.name}
        loading={deleting}
      />
    </div>
  );
}

