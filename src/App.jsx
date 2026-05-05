import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import OAuthCallback from './components/OAuthCallback';
import Dashboard from './components/Dashboard';
import { loadSession, clearSession } from './utils/auth';

export default function App() {
  const [session, setSession] = useState(null);
  const [appReady, setAppReady] = useState(false);
  const [callbackError, setCallbackError] = useState(null);

  useEffect(() => {
    // Check if this is an OAuth callback (token in URL hash)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const instanceUrl = params.get('instance_url');

    if (accessToken && instanceUrl) {
      // We have a token — save it and show dashboard
      const sess = {
        accessToken,
        instanceUrl: decodeURIComponent(instanceUrl),
        userId: params.get('id'),
      };
      sessionStorage.setItem('sf_session', JSON.stringify(sess));
      setSession(sess);
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
      setAppReady(true);
      return;
    }

    // Check for existing session
    const existing = loadSession();
    if (existing) {
      setSession(existing);
    }
    setAppReady(true);
  }, []);

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  if (!appReady) return null;

  if (session) {
    return <Dashboard session={session} onLogout={handleLogout} />;
  }

  return <LoginPage />;
}