import { ChevronRight, Star, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ApiEndpoints } from '../../api/endpoints';
import StarRating from '../../components/StarRating';
import { extractApiError } from '../../utils/validators';

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axiosClient.get(ApiEndpoints.stores, {
          params: { page: 1, limit: 6, sortBy: 'rating', order: 'desc' },
        });
        if (alive) setStores(data.data || []);
      } catch (err) {
        if (alive) setError(extractApiError(err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back 👋</h1>
          <p className="muted">Discover top-rated stores near you</p>
        </div>
        <Link to="/user/stores" className="btn btn-primary btn-md">
          Browse All Stores
        </Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      <h2 className="section-title">Top Rated Stores</h2>

      {loading ? (
        <div className="card">Loading…</div>
      ) : (
        <div className="store-grid">
          {stores.map((s) => (
            <Link
              to={`/user/stores/${s.id}`}
              key={s.id}
              className="store-card"
            >
              <div className="store-card-head">
                <div className="store-avatar">
                  <Store size={20} />
                </div>
                <div>
                  <h3>{s.name}</h3>
                  <p className="muted small">{s.address}</p>
                </div>
              </div>
              <div className="store-card-body">
                <div className="rating-line">
                  <Star size={14} fill="currentColor" />
                  <strong>
                    {s.averageRating != null
                      ? Number(s.averageRating).toFixed(2)
                      : '0.00'}
                  </strong>
                  <span className="muted">
                    ({s.totalRatings ?? 0} reviews)
                  </span>
                </div>
                {s.myRating ? (
                  <StarRating value={s.myRating} readOnly size={16} />
                ) : null}
              </div>
              <ChevronRight size={16} className="store-chevron" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}