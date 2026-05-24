'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export function useCrud(resource, options = {}) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(options.initialFilters || {});
  const [toast, setToast] = useState('');

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer = useRef(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        page, 
        per_page: options.perPage || 15, 
        search: debouncedSearch,
        ...filters 
      };
      const res = await apiGet(resource, params);
      setItems(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error(`CRUD Error (${resource}):`, err);
    } finally {
      setLoading(false);
    }
  }, [resource, page, debouncedSearch, filters, options.perPage]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const createItem = async (data) => {
    const res = await apiPost(resource, data);
    showToast(`${options.label || 'Data'} berhasil ditambahkan`);
    loadItems();
    return res;
  };

  const updateItem = async (id, data) => {
    const res = await apiPut(`${resource}/${id}`, data);
    showToast(`${options.label || 'Data'} berhasil diperbarui`);
    loadItems();
    return res;
  };

  const deleteItem = async (id) => {
    const res = await apiDelete(`${resource}/${id}`);
    showToast(`${options.label || 'Data'} berhasil dihapus`);
    loadItems();
    return res;
  };

  return {
    items, pagination, loading, page, setPage,
    search, setSearch, filters, setFilters,
    toast, showToast,
    loadItems, createItem, updateItem, deleteItem
  };
}
