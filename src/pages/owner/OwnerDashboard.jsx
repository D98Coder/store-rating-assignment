import { Star, Store } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { ApiEndpoints } from '../../api/endpoints';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StarRating from '../../components/StarRating';
import { PAGE_SIZE } from '../../utils/constants';
import { extractApiError } from '../../utils/validators';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get(ApiEndpoints.ownerDashboard, {
        params: {
          page,
          limit: PAGE_SIZE,
        },
      });
      setData(data);
      setTotal(data.stores?.[0].meta?.total ?? 0);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="card">Loading dashboard…</div>;
  if (error) return <div className="alert error">{error}</div>;

  const stores = data?.stores || [];
  const avgRating = stores[0].averageRating ?? 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Owner Dashboard</h1>
          <p className="muted">Track your stores' performance</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={Store} label="My Stores" value={stores.length} tone="blue" />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={Number(avgRating).toFixed(2)}
          tone="amber"
        />
      </div>

      <h2 className="section-title">Your Stores</h2>

      {stores.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No stores yet"
          description="You don't have any stores registered yet."
        />
      ) : (
        <div className="store-list">
          {stores.map((s) => (
            <div className="store-row card" key={s.id}>
              <div className="store-row-main">
                <div className="store-avatar">
                  <Store size={20} />
                </div>
                <div>
                  <h3>{s.name}</h3>
                  <p className="muted small">{s.address}</p>
                </div>
              </div>
              <div className="store-row-rating">
                <div className="rating-line">
                  <Star size={16} fill="currentColor" />
                  <strong>
                    {s.averageRating != null
                      ? Number(s.averageRating).toFixed(2)
                      : '0.00'}
                  </strong>
                  <span className="muted">
                    ({s.totalRatings ?? 0} ratings)
                  </span>
                </div>
                <StarRating value={s.averageRating || 0} readOnly size={16} />
              </div>
              {s.raters?.length > 0 && (
                <div className="raters">
                  <p className="muted small">Recent ratings:</p>
                  {s.raters.map((r) => (
                    <div className="rater-row" key={r.userId}>
                      <span>{r?.name || 'Anonymous'}</span>
                      <span className="rating-inline">
                        <Star size={18} fill="currentColor" />
                        {r.rating}
                      </span>
                    </div>
                  ))}

                  <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
}