import { ArrowLeft, Mail, MapPin, Star, Store, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ApiEndpoints } from '../../api/endpoints';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import { extractApiError } from '../../utils/validators';

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myRating, setMyRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchStore = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get(`${ApiEndpoints.stores}/${id}`);
      const payload = data?.data || data;
      setStore(payload);
      setMyRating(payload.myRating || 0);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const submitRating = async (value) => {
    if (!value || value < 1 || value > 5) return;
    setSubmitting(true);
    try {
      await axiosClient.post(`${ApiEndpoints.stores}/${id}/ratings`, { rating: value });
      setMyRating(value);
      fetchStore();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const updateRating = async (value) => {
    if (!value || value < 1 || value > 5) return;
    setSubmitting(true);
    try {
      await axiosClient.put(`${ApiEndpoints.stores}/${id}/ratings`, { rating: value });
      setMyRating(value);
      fetchStore();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRating = async () => {
    try {
      await axiosClient.delete(`${ApiEndpoints.stores}/${id}/ratings`);
      setMyRating(0);
      setConfirmDelete(false);
      fetchStore();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  if (loading) return <div className="card">Loading store…</div>;
  if (error) return <div className="alert error">{error}</div>;
  if (!store) return null;

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="store-hero">
        <div className="store-hero-info">
          <div className="store-avatar large">
            <Store size={28} />
          </div>
          <div>
            <h1>{store.name}</h1>
            <p className="muted">
              <MapPin size={14} /> {store.address}
            </p>
            <p className="muted">
              <Mail size={14} /> {store.email}
            </p>
          </div>
        </div>

        <div className="store-hero-stats">
          <div className="big-rating">
            <Star size={26} fill="currentColor" />
            <strong>
              {store.averageRating != null
                ? Number(store.averageRating).toFixed(2)
                : '0.00'}
            </strong>
            <span className="muted">
              ({store.totalRatings ?? 0} ratings)
            </span>
          </div>
        </div>
      </div>

      <div className="card rate-card">
        <h2>{myRating ? 'Your Rating' : 'Rate this store'}</h2>
        <p className="muted">
          {myRating
            ? 'Update or remove your rating below.'
            : 'Select a rating from 1 to 5 stars.'}
        </p>

        <div className="rate-row">
          <StarRating
            value={myRating}
            onChange={myRating ? updateRating : submitRating}
            size={32}
          />
          {myRating > 0 && (
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={() => setConfirmDelete(true)}
            >
              Remove
            </Button>
          )}
        </div>

        {submitting && <p className="muted small">Saving…</p>}
      </div>

      <div className="card">
        <h2>All Ratings</h2>
        {(!store.ratings || store.ratings.length === 0) && (
          <EmptyState
            icon={Star}
            title="No ratings yet"
            description="Be the first to rate this store."
          />
        )}
        {store.ratings?.map((r) => (
          <div className="rating-row" key={r.id}>
            <div className="avatar sm">
              {r.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <strong>{r.user?.name || 'Anonymous'}</strong>
              <div className="muted small">
                {r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString()
                  : ''}
              </div>
            </div>
            <div className="rating-row-value">
              <StarRating value={r.rating} readOnly size={14} />
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Remove rating"
        size="sm"
      >
        <p>Are you sure you want to remove your rating?</p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteRating}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}