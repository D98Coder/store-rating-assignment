import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_BY_ROLE } from '../utils/constants';

export default function RoleRoute({ allow, children }) {
  const { role } = useAuth();
  
  if (!allow.includes(role)) {
    return <Navigate to={HOME_BY_ROLE[role] || '/login'} replace />;
  }
  return children;
}