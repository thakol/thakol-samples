"use client";

import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying next-auth session...</p>
      </div>
    );
  }

  const name = session?.user?.name || session?.user?.email || "Next.js Developer";
  const email = session?.user?.email || "No email claim";

  return (
    <>
      <div className="grid-overlay"></div>
      <div className="blur-blob"></div>

      <header>
        <h1>Thakol Integration</h1>
        <p>Next.js App Router & Next-Auth (Auth.js) Quickstart</p>
      </header>

      <main style={{ width: '100%', maxWidth: '800px' }}>
        {session ? (
          <div className="card">
            <div className="token-header" style={{ marginBottom: '24px' }}>
              <div className="badge">Next.js Authenticated</div>
              <button 
                onClick={() => signOut()} 
                className="btn btn-secondary" 
                style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Sign Out
              </button>
            </div>

            <div className="profile-grid">
              <div className="profile-avatar">{name.charAt(0).toUpperCase()}</div>
              <div className="profile-info">
                <h3>{name}</h3>
                <p>{email}</p>
                <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Session State: <span style={{ color: 'var(--text-secondary)' }}>Active</span>
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <a 
                href="/protected" 
                className="btn btn-secondary" 
                style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Go to Server-Protected Route
              </a>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

            <div className="token-container">
              <div className="token-header">
                <span className="token-title">Decoded Session Details</span>
              </div>
              <pre><code>{JSON.stringify(session.user, null, 2)}</code></pre>
            </div>

            {(session as any).accessToken && (
              <div className="token-container">
                <div className="token-header">
                  <span className="token-title">Raw Access Token (JWT)</span>
                </div>
                <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                  <code style={{ color: 'var(--text-secondary)' }}>{(session as any).accessToken}</code>
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <h2 className="card-title">Next.js OIDC Quickstart</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              This application uses NextAuth.js configured with Thakol's OIDC Keycloak Provider.
            </p>
            <button 
              onClick={() => signIn('keycloak')} 
              className="btn btn-primary"
            >
              Sign In with Thakol
            </button>
          </div>
        )}
      </main>
    </>
  );
}
