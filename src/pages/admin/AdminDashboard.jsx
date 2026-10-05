import { Building2, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from "../../api/axiosClient";
import { ApiEndpoints } from '../../api/endpoints';
import { pageRoutes } from '../../utils/constants';
import { extractApiError } from '../../utils/validators';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axiosClient.get(ApiEndpoints.adminDashboard);
        if (alive) setStats(data?.data || data);
      } catch (err) {
        if (alive) setError(extractApiError(err));
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
          <h1>Admin Dashboard</h1>
          <p className="muted">Overview of users, stores, and ratings across the platform</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="stat-grid">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers}
          tone="blue"
          link={pageRoutes.adminDashboard}
        />
        <StatCard
          icon={Building2}
          label="Total Stores"
          value={stats?.totalStores}
          tone="purple"
          link={pageRoutes.adminStore}
        />
        <StatCard
          icon={Star}
          label="Total Ratings"
          value={stats?.totalRatings}
          tone="amber"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, link }) {

  function Wrapper({ children}) {
    return link ? <Link to={link} className='no-underline'>{children}</Link> : children;
  }

  return (
    <Wrapper>
      <div className={`stat-card tone-${tone}`}>
        <div className="stat-icon">
          <Icon size={22} />
        </div>
        <div>
          <p className="stat-label">{label}</p>
          <h3 className="stat-value">{value ?? '—'}</h3>
        </div>
      </div>
    </Wrapper>
  );
}