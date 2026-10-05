import { Rating } from '@mui/material';
import { Building2, Plus, Search, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { ApiEndpoints } from '../../api/endpoints';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import SortableHeader from '../../components/SortableHeader';
import { EMPTY, GOLD, PAGE_SIZE, maxRatings, ratingsSize } from '../../utils/constants';
import { extractApiError } from '../../utils/validators';
import StoreForm from './StoreForm';

export default function StoresList() {
  const [stores, setStores] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get(ApiEndpoints.adminStores, {
        params: {
          page,
          limit: PAGE_SIZE,
          sortBy,
          order,
          ...Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v)
          ),
        },
      });
      setStores(data.data || []);
      setTotal(data.meta?.total ?? 0);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, order, filters]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const onSort = (field) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setOrder('asc');
    }
  };
  
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Stores</h1>
          <p className="muted">Manage all registered stores</p>
        </div>
        <Button icon={Plus} onClick={() => setCreating(true)}>
          Add Store
        </Button>
      </div>

      <div className="filters">
        <Input
          placeholder="Filter by name"
          icon={Search}
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <Input
          placeholder="Filter by email"
          icon={Search}
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <Input
          placeholder="Filter by address"
          icon={Search}
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader
                  label="Name"
                  field="name"
                  sortBy={sortBy}
                  order={order}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Email"
                  field="email"
                  sortBy={sortBy}
                  order={order}
                  onSort={onSort}
                />
                <th>Address</th>
                <SortableHeader
                  label="Rating"
                  field="rating"
                  sortBy={sortBy}
                  order={order}
                  onSort={onSort}
                />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="table-loading">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                stores.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>{s.email}</td>
                    <td className="truncate">{s.address}</td>
                    <td>
                      <Rating
                        value={s.ratings}
                        max={5}
                        precision={1}
                        readOnly={true}
                        onChange={() => {}}
                        icon={<Star size={ratingsSize} fill={GOLD} color={GOLD} />}
                        emptyIcon={<Star size={maxRatings} color={EMPTY} />}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && stores.length === 0 && (
            <EmptyState
              icon={Building2}
              title="No stores found"
              description="Add your first store to get started."
            />
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Store' : 'Add Store'}
      >
        <StoreForm
          initial={editing}
          onSuccess={() => {
            setCreating(false);
            setEditing(null);
            fetchStores();
          }}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}