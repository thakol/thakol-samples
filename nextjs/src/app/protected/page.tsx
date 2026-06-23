import React from 'react';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/");
  }

  return (
    <>
      <div className="grid-overlay"></div>
      <div className="blur-blob"></div>

      <header>
        <h1>Server-Protected Route</h1>
        <p>Next.js Server Component Session Gating</p>
      </header>

      <main style={{ width: '100%', maxWidth: '800px' }}>
        <div className="card">
          <div className="badge" style={{ marginBottom: '20px' }}>Server Gated</div>
          
          <h2 className="card-title">Welcome, {session.user?.name || session.user?.email}!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            This page is fully protected on the server side using <code>getServerSession()</code>. If you are not logged in, Next.js redirects you to the home page before rendering.
          </p>

          <a href="/" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
            Back to Home
          </a>
        </div>
      </main>
    </>
  );
}
