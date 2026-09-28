import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Gate for customer-only pages (e.g. Apply Now, the customer dashboard).
 * Sends anonymous visitors to /login with a `next` param so they land back
 * here after a successful login; keeps staff accounts out of the customer
 * area per the brief ("do not give staff access to the customer dashboard").
 */
export default function ProtectedRoute({ children, role = 'customer' }) {
  const { isAuthenticated, role: currentRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (role && currentRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
