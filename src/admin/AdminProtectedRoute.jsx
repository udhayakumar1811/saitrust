import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminProtectedRoute({ children }) {
  const { isAdminAuthenticated } = useAdminAuth();
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}
