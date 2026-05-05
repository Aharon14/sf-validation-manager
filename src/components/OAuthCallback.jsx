import React, { useEffect, useState } from 'react';
import { saveSession } from '../utils/auth';

export default function OAuthCallback({ onSuccess, onError }) {
  const [status, setStatus] = useState('Completing login...');

  useEffect(() => {
    // Implicit flow returns token in URL hash (#access_token=...&instance_url=...)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const instanceUrl = params.get('instance_url');
    const error = params.get('error');
    const errorDesc = params.get('error_description');

    if (error) {
      onError(errorDesc || error);
      return;
    }

    if (!accessToken || !instanceUrl) {
      onError('No token received from Salesforce.');
      return;
    }

    const tokenData = {
      access_token: accessToken,
      instance_url: decodeURIComponent(instanceUrl),
      refresh_token: null,
      id: params.get('id'),
      issued_at: params.get('issued_at'),
    };

    saveSession(tokenData);
    setStatus('Connected! Loading your org...');
    window.history.replaceState({}, document.title, '/');
    setTimeout(() => onSuccess(tokenData), 500);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      gap: '24px',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{
        width: '48px', height: '48px',
        border: '2px solid var(--border)',
        borderTop: '2px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: 'var(--accent)', fontSize: '12px', letterSpacing: '0.1em' }}>
        {status}
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>
        OAUTH 2.0 IMPLICIT FLOW
      </div>
    </div>
  );
}