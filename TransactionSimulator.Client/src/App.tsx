import { useAuth } from './context/AuthContext';
import MainPage from './pages/MainPage/MainPage';
import AuthPage from './pages/AuthPage/AuthPage';

export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainPage /> : <AuthPage />;
}
