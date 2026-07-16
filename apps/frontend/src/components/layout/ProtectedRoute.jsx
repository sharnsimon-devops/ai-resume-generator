import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main>
        <p>Loading…</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
