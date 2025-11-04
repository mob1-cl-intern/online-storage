import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { MainApp } from './components/MainApp';
import './App.css';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">読み込み中...</div>
      </div>
    );
  }

  return user ? <MainApp /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
