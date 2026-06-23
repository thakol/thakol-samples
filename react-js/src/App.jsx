import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Shield, Layout, Key, LogOut } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  
  const name = user.profile.name || user.profile.preferred_username || "React Developer";
  const email = user.profile.email || "No email claim";
  const expiresDate = user.expires_at ? new Date(user.expires_at * 1000).toLocaleString() : "Active Session";

  return (
    <div className="card">
      <div className="token-header" style={{ marginBottom: '24px' }}>
        <div className="badge">React Authenticated</div>
        <button onClick={logout} className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}>
          <LogOut size={14} style={{ marginRight: '6px' }} />
          Sign Out
        </button>
      </div>

      <div className="profile-grid">
        <div className="profile-avatar">{name.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h3>{name}</h3>
          <p>{email}</p>
          <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Session Expiry: <span style={{ color: 'var(--text-secondary)' }}>{expiresDate}</span>
          </p>
        </div>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

      <div className="token-container">
        <div className="token-header">
          <span className="token-title">Decoded Profile Claims (ID Token)</span>
        </div>
        <pre><code>{JSON.stringify(user.profile, null, 2)}</code></pre>
      </div>

      <div className="token-container">
        <div className="token-header">
          <span className="token-title">Raw Access Token (JWT)</span>
        </div>
        <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
          <code style={{ color: 'var(--text-secondary)' }}>{user.access_token}</code>
        </pre>
      </div>
    </div>
  );
}

function SetupForm() {
  const { authority, clientId, updateConfig, login } = useAuth();
  const [formAuthority, setFormAuthority] = useState(authority);
  const [formClientId, setFormClientId] = useState(clientId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formAuthority.trim() || !formClientId.trim()) {
      alert("Both Authority URL and Client ID are required!");
      return;
    }
    const newMgr = updateConfig(formAuthority.trim(), formClientId.trim());
    login(newMgr);
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <Key size={20} style={{ color: 'var(--primary-blue)' }} />
        Configure OIDC & Login
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Paste your realm details from your Thakol Dashboard to login and verify configurations.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="authority">Authority / Realm URL</label>
          <input
            className="form-control"
            type="url"
            id="authority"
            value={formAuthority}
            onChange={(e) => setFormAuthority(e.target.value)}
            placeholder="https://auth.thakol.io/realms/YOUR_REALM"
            required
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
            E.g. <code>https://auth.thakol.io/realms/demo</code> or <code>http://localhost:8080/realms/demo</code>
          </span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="clientId">Client ID</label>
          <input
            className="form-control"
            type="text"
            id="clientId"
            value={formClientId}
            onChange={(e) => setFormClientId(e.target.value)}
            placeholder="default-client"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
          <Shield size={16} />
          Sign In with Thakol
        </button>
      </form>
    </div>
  );
}

function MainView() {
  const { isAuthenticated, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading user credentials and profiles...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="alert alert-info" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          {error}
        </div>
      )}
      {isAuthenticated ? <Dashboard /> : <SetupForm />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="grid-overlay"></div>
      <div className="blur-blob"></div>

      <header>
        <h1>Thakol Integration</h1>
        <p>React 18 & Vite SPA OAuth2/OIDC Quickstart</p>
      </header>

      <main>
        <MainView />
      </main>
    </AuthProvider>
  );
}
