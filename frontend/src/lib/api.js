const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function apiFetch(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lazisnu_token') : null;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}/${endpoint}`, config);
  const data = await res.json();

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lazisnu_token');
      localStorage.removeItem('lazisnu_user');
      window.location.href = '/';
    }
    throw new Error(data.message || 'Unauthorized');
  }

  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan');
  }

  return data;
}

export function apiGet(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${endpoint}?${query}` : endpoint;
  return apiFetch(url);
}

export function apiPost(endpoint, body) {
  return apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut(endpoint, body) {
  return apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiDelete(endpoint) {
  return apiFetch(endpoint, { method: 'DELETE' });
}

export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatMonth(monthStr) {
  if (!monthStr) return '-';
  const [year, month] = monthStr.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export const ORG_LEVELS = {
  PP: { label: 'PP LAZISNU', sublabel: 'Pusat - Nasional', order: 1 },
  PW: { label: 'PW LAZISNU', sublabel: 'Wilayah - Provinsi', order: 2 },
  PC: { label: 'PC LAZISNU', sublabel: 'Cabang - Kota/Kabupaten', order: 3 },
  MWC: { label: 'MWC LAZISNU', sublabel: 'Kecamatan', order: 4 },
  PR: { label: 'PR LAZISNU', sublabel: 'Ranting - Desa', order: 5 },
};

export function getChildLevel(currentLevel) {
  const order = { PP: 'PW', PW: 'PC', PC: 'MWC', MWC: 'PR' };
  return order[currentLevel] || null;
}
