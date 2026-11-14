import { BrowserRouter } from 'react-router';
import { AuthProvider } from './context/AuthContext/AuthContext';
import { ToastProvider } from './context/ToastContext/ToastContext';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
