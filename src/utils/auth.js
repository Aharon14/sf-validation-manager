const SF_CONFIG = {
  clientId: import.meta.env.VITE_SF_CLIENT_ID || 'YOUR_CONNECTED_APP_CLIENT_ID',
  loginUrl: import.meta.env.VITE_SF_LOGIN_URL || 'https://login.salesforce.com',
  redirectUri: import.meta.env.VITE_SF_REDIRECT_URI || window.location.origin + '/oauth/callback',
};

export function initiateOAuthLogin() {
  const params = new URLSearchParams({
    response_type: 'token',
    client_id: SF_CONFIG.clientId,
    redirect_uri: SF_CONFIG.redirectUri,
    scope: 'api web full',
    display: 'page',
  });

  window.location.href = `${SF_CONFIG.loginUrl}/services/oauth2/authorize?${params}`;
}

export async function exchangeCodeForToken(code) {
  return null;
}

export async function revokeToken(accessToken, instanceUrl) {
  await fetch(`${instanceUrl}/services/oauth2/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token: accessToken }),
  });
}

export function saveSession(tokenData) {
  sessionStorage.setItem('sf_session', JSON.stringify({
    accessToken: tokenData.access_token,
    instanceUrl: tokenData.instance_url,
    refreshToken: tokenData.refresh_token,
    userId: tokenData.id,
    issuedAt: tokenData.issued_at,
  }));
}

export function loadSession() {
  try {
    const raw = sessionStorage.getItem('sf_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem('sf_session');
}

export { SF_CONFIG };