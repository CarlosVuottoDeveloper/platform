import { Navigate, Outlet, Route, Routes } from 'react-router';
import { Spinner } from '@industry/web';
import { AppLayout } from './components/AppLayout/AppLayout';
import { useAuth } from './context/AuthContext/AuthContext';
import { UserDataProvider } from './context/UserDataContext/UserDataContext';
import { Accounts } from './screens/Accounts/Accounts';
import { Budgets } from './screens/Budgets/Budgets';
import { Dashboard } from './screens/Dashboard/Dashboard';
import { Goals } from './screens/Goals/Goals';
import { Login } from './screens/Login/Login';
import { More } from './screens/More/More';
import { Reports } from './screens/Reports/Reports';
import { Settings } from './screens/Settings/Settings';
import { Transactions } from './screens/Transactions/Transactions';

function SessionLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Spinner />
    </div>
  );
}

function RequireSignedIn() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <UserDataProvider>
      <Outlet />
    </UserDataProvider>
  );
}

function RequireSignedOut() {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export function AppRoutes() {
  const { loading } = useAuth();

  if (loading) return <SessionLoading />;

  return (
    <Routes>
      <Route element={<RequireSignedOut />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<RequireSignedIn />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transacoes" element={<Transactions />} />
          <Route path="/contas" element={<Accounts />} />
          <Route path="/orcamentos" element={<Budgets />} />
          <Route path="/metas" element={<Goals />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/mais" element={<More />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
