import { Rating } from '@mui/material';
import { Plus, Search, Star, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { ApiEndpoints } from '../../api/endpoints';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import SortableHeader from '../../components/SortableHeader';
import { DBRoles, PAGE_SIZE, ROLE_LABELS } from '../../utils/constants';
import { extractApiError } from '../../utils/validators';
import UserForm from './UserForm';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get(ApiEndpoints.adminUsers, {
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
      setUsers(data.data || []);
      setTotal(data.meta?.total ?? 0);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, order, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onSort = (field) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axiosClient.delete(`/admin/users/${confirmDelete.id}`);
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'address', label: 'Address' },
      { key: 'role', label: 'Role' },
    ],
    []
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="muted">Manage all users on the platform</p>
        </div>
        <Button icon={Plus} onClick={() => setCreating(true)}>
          Add User
        </Button>
      </div>

      <div className="filters">
        <Input
          placeholder="Filter by name"
          icon={Search}
          value={filters.name}
          onChange={(e) =>
            setFilters({ ...filters, name: e.target.value })
          }
        />
        <Input
          placeholder="Filter by email"
          icon={Search}
          value={filters.email}
          onChange={(e) =>
            setFilters({ ...filters, email: e.target.value })
          }
        />
        <Input
          placeholder="Filter by address"
          icon={Search}
          value={filters.address}
          onChange={(e) =>
            setFilters({ ...filters, address: e.target.value })
          }
        />
        <select
          className="form-input"
          value={filters.role}
          onChange={(e) =>
            setFilters({ ...filters, role: e.target.value })
          }
        >
          <option value="">All Roles</option>
          {Object.values(DBRoles).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
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
                <SortableHeader
                  label="Address"
                  field="address"
                  sortBy={sortBy}
                  order={order}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Role"
                  field="role"
                  sortBy={sortBy}
                  order={order}
                  onSort={onSort}
                />
                <th>Ratings</th>
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
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td className="truncate">{u.address}</td>
                    <td>
                      <span className={`badge role-${u.role?.toLowerCase()}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td>
                      <Rating
                        value={u.ratings}
                        max={5}
                        readOnly={true}
                        precision={1}
                        onChange={() => {}}
                        icon={<Star size={ratingsSize} fill={GOLD} color={GOLD} />}
                        emptyIcon={<Star size={maxRatings} color={EMPTY} />}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && users.length === 0 && (
            <EmptyState
              icon={User}
              title="No users found"
              description="Try adjusting your filters or add a new user."
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
        title={editing ? 'Edit User' : 'Add User'}
      >
        <UserForm
          initial={editing}
          onSuccess={() => {
            setCreating(false);
            setEditing(null);
            fetchUsers();
          }}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Confirm delete"
        size="sm"
      >
        <p>
          Are you sure you want to delete <strong>{confirmDelete?.name}</strong>?
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <Button
            variant="ghost"
            onClick={() => setConfirmDelete(null)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}