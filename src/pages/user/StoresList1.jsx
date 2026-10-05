import { Search, Store } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { ApiEndpoints } from '../../api/endpoints';
import EmptyState from '../../components/EmptyState';
import Input from '../../components/Input';
import Pagination from '../../components/Pagination';
import SortableHeader from '../../components/SortableHeader';
import StarRating from '../../components/StarRating';
import { PAGE_SIZE } from '../../utils/constants';
import { extractApiError } from '../../utils/validators';

export default function StoresList() {
  const [stores, setStores] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get(ApiEndpoints.userStores, {
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
          <h1>Browse Stores</h1>
          <p className="muted">Search and rate your favourite stores</p>
        </div>
      </div>

      <div className="filters">
        <Input
          placeholder="Search by store name"
          icon={Search}
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <Input
          placeholder="Search by address"
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
                  label="Store Name"
                  field="name"
                  sortBy={sortBy}
                  order={order}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Address"
                  field="address"
                  sortBy={sortBy}
                  order={order}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Overall Rating"
                  field="rating"
                  sortBy={sortBy}
                  order={order}
                  onSort={onSort}
                />
                <th>Your Rating</th>
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
                    <td className="truncate">{s.address}</td>
                    <td>
                      <span className="rating-inline">
                        {s.averageRating != null
                          ? Number(s.averageRating).toFixed(2)
                          : '0.00'}
                        <span className="muted">
                          ({s.totalRatings ?? 0})
                        </span>
                      </span>
                    </td>
                    <td>
                      {s.myRating ? (
                        <StarRating value={s.myRating} readOnly size={16} />
                      ) : (
                        <span className="muted small">Not rated yet</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && stores.length === 0 && (
            <EmptyState
              icon={Store}
              title="No stores found"
              description="Try a different search term."
            />
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}