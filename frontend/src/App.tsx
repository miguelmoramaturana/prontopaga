import { useCallback, useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Notification, type Notice } from './components/Notification';
import { ScoreQuery } from './components/ScoreQuery';

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [notice, setNotice] = useState<Notice | null>(null);

  const notify = useCallback((kind: Notice['kind'], message: string) => {
    setNotice({ kind, message });
  }, []);

  return (
    <div className="app">
      <Notification notice={notice} onDismiss={() => setNotice(null)} />

      {isAuthenticated && (
        <header className="topbar">
          <span>
            <strong>{user?.username}</strong>
            <span className="badge">{user?.role}</span>
          </span>
          <button type="button" className="link" onClick={logout}>
            Cerrar sesión
          </button>
        </header>
      )}

      <main>
        {isAuthenticated ? (
          <ScoreQuery onNotify={notify} />
        ) : (
          <LoginForm onError={(message) => notify('error', message)} />
        )}
      </main>
    </div>
  );
}
