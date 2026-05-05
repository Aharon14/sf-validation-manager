import React, { useState } from 'react';
import { initiateOAuthLogin, SF_CONFIG } from '../utils/auth';
import './LoginPage.css';

export default function LoginPage() {
  const [hovering, setHovering] = useState(false);
  const [connecting, setConnecting] = useState(false);

  function handleLogin() {
    setConnecting(true);
    setTimeout(() => initiateOAuthLogin(), 400);
  }

  return (
    <div className="login-root">
      {/* Grid background */}
      <div className="login-grid" />

      {/* Corner decorations */}
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />

      {/* Ticker */}
      <div className="ticker-bar">
        <span className="ticker-text">
          SALESFORCE VALIDATION MANAGER &nbsp;·&nbsp; TOOLING API &nbsp;·&nbsp; OAUTH 2.0 &nbsp;·&nbsp;
          ACCOUNT OBJECT &nbsp;·&nbsp; METADATA DEPLOY &nbsp;·&nbsp;
          SALESFORCE VALIDATION MANAGER &nbsp;·&nbsp; TOOLING API &nbsp;·&nbsp; OAUTH 2.0 &nbsp;·&nbsp;
          ACCOUNT OBJECT &nbsp;·&nbsp; METADATA DEPLOY &nbsp;·&nbsp;
        </span>
      </div>

      <main className="login-main">
        {/* Header */}
        <div className="login-header">
          <div className="logo-row">
            <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="1" y="1" width="38" height="38" stroke="var(--accent)" strokeWidth="1"/>
                <path d="M8 20 L20 8 L32 20 L20 32 Z" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                <circle cx="20" cy="20" r="4" fill="var(--accent)"/>
                <line x1="8" y1="20" x2="32" y2="20" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 2"/>
                <line x1="20" y1="8" x2="20" y2="32" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 2"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">SFVALIDATOR</span>
              <span className="logo-version">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Center card */}
        <div className="login-card">
          <div className="card-label">// AUTHORIZATION REQUIRED</div>

          <h1 className="card-title">
            Validation Rule<br />
            <span className="title-accent">Manager</span>
          </h1>

          <p className="card-desc">
            Connect to your Salesforce org to inspect, activate, 
            and deploy validation rules on the Account object via Tooling API.
          </p>

          {/* Feature list */}
          <div className="feature-list">
            {[
              ['01', 'OAuth 2.0 Web Server Flow'],
              ['02', 'Tooling API — Read validation rules'],
              ['03', 'Toggle active / inactive state'],
              ['04', 'Bulk enable or disable all rules'],
              ['05', 'Deploy changes back to Salesforce'],
            ].map(([num, label]) => (
              <div key={num} className="feature-item">
                <span className="feature-num">{num}</span>
                <span className="feature-label">{label}</span>
                <span className="feature-check">✓</span>
              </div>
            ))}
          </div>

          {/* Login button */}
          <button
            className={`login-btn ${hovering ? 'hovered' : ''} ${connecting ? 'connecting' : ''}`}
            onClick={handleLogin}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            disabled={connecting}
          >
            {connecting ? (
              <>
                <span className="btn-spinner" />
                CONNECTING...
              </>
            ) : (
              <>
                <SalesforceIcon />
                CONNECT TO SALESFORCE
              </>
            )}
          </button>

          {/* Config info */}
          <div className="config-info">
            <div className="config-row">
              <span className="cfg-key">ENDPOINT</span>
              <span className="cfg-val">{SF_CONFIG.loginUrl}</span>
            </div>
            <div className="config-row">
              <span className="cfg-key">FLOW</span>
              <span className="cfg-val">OAuth 2.0 Web Server</span>
            </div>
            <div className="config-row">
              <span className="cfg-key">SCOPE</span>
              <span className="cfg-val">api web full refresh_token</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <span>BUILT FOR CLOUDVANDANA ASSIGNMENT</span>
          <span className="footer-dot">·</span>
          <span>ASSOCIATE SOFTWARE ENGINEER</span>
        </div>
      </main>

      {/* Bottom ticker */}
      <div className="ticker-bar bottom-ticker">
        <span className="ticker-text reverse">
          REACT &nbsp;·&nbsp; SALESFORCE TOOLING API &nbsp;·&nbsp; METADATA API &nbsp;·&nbsp; 
          CONNECTED APP &nbsp;·&nbsp; JWT BEARER &nbsp;·&nbsp; SOQL &nbsp;·&nbsp;
          REACT &nbsp;·&nbsp; SALESFORCE TOOLING API &nbsp;·&nbsp; METADATA API &nbsp;·&nbsp; 
          CONNECTED APP &nbsp;·&nbsp; JWT BEARER &nbsp;·&nbsp; SOQL &nbsp;·&nbsp;
        </span>
      </div>
    </div>
  );
}

function SalesforceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 50 35" fill="currentColor">
      <path d="M20.8 4.1c2.2-2.3 5.3-3.7 8.7-3.7 4.9 0 9.2 2.8 11.4 6.9 2-.9 4.2-1.4 6.5-1.4 8.6 0 15.6 7 15.6 15.7s-7 15.7-15.6 15.7c-1 0-2-.1-3-.3-1.9 3.4-5.5 5.7-9.7 5.7-1.7 0-3.3-.4-4.7-1.1-2 4.5-6.5 7.6-11.8 7.6C12 49.2 6.3 44.4 5.1 38c-.7.1-1.5.2-2.2.2C1.3 38.2 0 36.8 0 35.1c0-1.7 1.3-3.1 3-3.1h.2C2.2 30.3 1.5 28.3 1.5 26.1c0-7 5.7-12.6 12.6-12.6 1.4 0 2.8.2 4 .6.9-4.3 4.7-7.5 9.3-7.5-.4-.9-.7-1.9-.8-2.9 0 .1.1.1.2.1" />
    </svg>
  );
}
