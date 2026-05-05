import React, { useState, useCallback } from 'react';
import ValidationRuleCard from './ValidationRuleCard';
import {
  fetchValidationRules,
  updateValidationRule,
  bulkUpdateValidationRules,
  fetchUserInfo,
} from '../utils/salesforceApi';
import { revokeToken, clearSession } from '../utils/auth';
import './Dashboard.css';

export default function Dashboard({ session, onLogout }) {
  const [rules, setRules] = useState([]);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [localChanges, setLocalChanges] = useState({}); // id -> active (unsaved changes)
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL | ACTIVE | INACTIVE

  const { accessToken, instanceUrl } = session;

  function showToast(msg, type = 'info') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Fetch user info
  async function loadUserInfo() {
    try {
      const info = await fetchUserInfo(instanceUrl, accessToken);
      setUserInfo(info);
    } catch {}
  }

  // Fetch all validation rules
  async function handleFetchRules() {
    setLoading(true);
    setError(null);
    setLocalChanges({});
    try {
      if (!userInfo) await loadUserInfo();
      const data = await fetchValidationRules(instanceUrl, accessToken);
      setRules(data);
      setHasFetched(true);
      showToast(`Loaded ${data.length} validation rule${data.length !== 1 ? 's' : ''}`, 'success');
    } catch (err) {
      setError(err.message);
      showToast('Failed to fetch rules: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Toggle a single rule (local state only — saved on deploy)
  function handleToggleRule(ruleId, newActive) {
    setLocalChanges(prev => {
      const original = rules.find(r => r.Id === ruleId)?.Active;
      const updated = { ...prev };
      if (newActive === original) {
        delete updated[ruleId]; // revert to original
      } else {
        updated[ruleId] = newActive;
      }
      return updated;
    });
    setRules(prev => prev.map(r => r.Id === ruleId ? { ...r, Active: newActive } : r));
  }

  // Enable all
  function handleEnableAll() {
    const changes = {};
    const updated = rules.map(r => {
      if (!r.Active) changes[r.Id] = true;
      return { ...r, Active: true };
    });
    setRules(updated);
    setLocalChanges(prev => ({ ...prev, ...changes }));
  }

  // Disable all
  function handleDisableAll() {
    const changes = {};
    const updated = rules.map(r => {
      if (r.Active) changes[r.Id] = false;
      return { ...r, Active: false };
    });
    setRules(updated);
    setLocalChanges(prev => ({ ...prev, ...changes }));
  }

  // Deploy — push all local changes to Salesforce
  async function handleDeploy() {
    const changeList = Object.entries(localChanges).map(([id, active]) => ({ id, active }));
    if (changeList.length === 0) {
      showToast('No changes to deploy', 'warning');
      return;
    }

    setDeploying(true);
    const deployingIds = new Set(changeList.map(c => c.id));
    setPendingIds(deployingIds);

    try {
      const { succeeded, failed } = await bulkUpdateValidationRules(instanceUrl, accessToken, changeList);

      // Remove deployed items from local changes
      const newChanges = { ...localChanges };
      succeeded.forEach(id => delete newChanges[id]);
      setLocalChanges(newChanges);

      if (failed.length === 0) {
        showToast(`✓ Deployed ${succeeded.length} change${succeeded.length !== 1 ? 's' : ''} successfully`, 'success');
      } else {
        showToast(`${succeeded.length} deployed, ${failed.length} failed`, 'warning');
      }
    } catch (err) {
      showToast('Deploy failed: ' + err.message, 'error');
    } finally {
      setDeploying(false);
      setPendingIds(new Set());
    }
  }

  // Logout
  async function handleLogout() {
    try {
      await revokeToken(accessToken, instanceUrl);
    } catch {}
    clearSession();
    onLogout();
  }

  const changeCount = Object.keys(localChanges).length;
  const activeCount = rules.filter(r => r.Active).length;
  const inactiveCount = rules.length - activeCount;

  const filteredRules = rules.filter(r => {
    if (filter === 'ACTIVE') return r.Active;
    if (filter === 'INACTIVE') return !r.Active;
    return true;
  });

  return (
    <div className="dash-root">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-bar" />
          {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <header className="dash-header">
        <div className="header-left">
          <div className="dash-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="0.5" y="0.5" width="23" height="23" stroke="var(--accent)" strokeWidth="1"/>
              <path d="M4 12L12 4L20 12L12 20Z" stroke="var(--accent)" strokeWidth="1" fill="none"/>
              <circle cx="12" cy="12" r="2.5" fill="var(--accent)"/>
            </svg>
            <span className="dash-logo-text">SFVALIDATOR</span>
          </div>
          <div className="header-breadcrumb">
            <span>Account</span>
            <span className="bc-sep">/</span>
            <span className="bc-current">Validation Rules</span>
          </div>
        </div>

        <div className="header-right">
          {userInfo && (
            <div className="user-chip">
              <div className="user-avatar">{(userInfo.name || userInfo.email || 'U')[0].toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{userInfo.name || userInfo.email}</span>
                <span className="user-org">{instanceUrl.replace('https://', '')}</span>
              </div>
            </div>
          )}
          <button className="icon-btn danger-btn" onClick={handleLogout} title="Logout">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2V12H5M9 4L12 7L9 10M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
            </svg>
            LOGOUT
          </button>
        </div>
      </header>

      <div className="dash-body">
        {/* Sidebar / stats */}
        <aside className="dash-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">// STATUS</div>
            <div className="stat-block">
              <span className="stat-num">{rules.length}</span>
              <span className="stat-label">Total Rules</span>
            </div>
            <div className="stat-block active-stat">
              <span className="stat-num">{activeCount}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-block inactive-stat">
              <span className="stat-num">{inactiveCount}</span>
              <span className="stat-label">Inactive</span>
            </div>
            {changeCount > 0 && (
              <div className="stat-block changes-stat">
                <span className="stat-num">{changeCount}</span>
                <span className="stat-label">Unsaved Changes</span>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">// CONNECTION</div>
            <div className="conn-info">
              <div className="conn-row">
                <span className="conn-key">API</span>
                <span className="conn-val connected">CONNECTED</span>
              </div>
              <div className="conn-row">
                <span className="conn-key">ORG</span>
                <span className="conn-val">{instanceUrl.replace('https://', '').split('.')[0]}</span>
              </div>
              <div className="conn-row">
                <span className="conn-key">OBJECT</span>
                <span className="conn-val">Account</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">// FILTER</div>
            {['ALL', 'ACTIVE', 'INACTIVE'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                <span className="filter-dot" style={{
                  background: f === 'ACTIVE' ? 'var(--success)' : f === 'INACTIVE' ? 'var(--danger)' : 'var(--accent)'
                }} />
                {f}
                <span className="filter-count">
                  {f === 'ALL' ? rules.length : f === 'ACTIVE' ? activeCount : inactiveCount}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="dash-main">
          {/* Action bar */}
          <div className="action-bar">
            <div className="action-left">
              <button
                className="action-btn primary-btn"
                onClick={handleFetchRules}
                disabled={loading}
              >
                {loading ? <span className="btn-spinner" /> : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                  </svg>
                )}
                {loading ? 'FETCHING...' : 'FETCH RULES'}
              </button>

              {hasFetched && (
                <>
                  <button className="action-btn success-btn" onClick={handleEnableAll} disabled={loading || deploying}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                    </svg>
                    ENABLE ALL
                  </button>
                  <button className="action-btn danger-btn-outline" onClick={handleDisableAll} disabled={loading || deploying}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 5L9 9M9 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                    </svg>
                    DISABLE ALL
                  </button>
                </>
              )}
            </div>

            {changeCount > 0 && (
              <button
                className={`action-btn deploy-btn ${deploying ? 'deploying' : ''}`}
                onClick={handleDeploy}
                disabled={deploying}
              >
                {deploying ? (
                  <><span className="btn-spinner" /> DEPLOYING...</>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1L13 7L7 13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                    </svg>
                    DEPLOY {changeCount} CHANGE{changeCount !== 1 ? 'S' : ''}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="error-banner">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 4V7M7 10H7.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
              {error}
            </div>
          )}

          {/* Empty / placeholder state */}
          {!hasFetched && !loading && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="1" y="1" width="62" height="62" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4"/>
                  <path d="M16 32 L32 16 L48 32 L32 48 Z" stroke="var(--border-bright)" strokeWidth="1" fill="none"/>
                  <circle cx="32" cy="32" r="8" stroke="var(--border-bright)" strokeWidth="1" fill="none"/>
                  <circle cx="32" cy="32" r="2" fill="var(--text-dim)"/>
                </svg>
              </div>
              <div className="empty-title">NO DATA LOADED</div>
              <div className="empty-desc">
                Click "FETCH RULES" to retrieve all validation rules<br />
                from the Account object in your Salesforce org.
              </div>
              <div className="empty-hint">// Uses Tooling API: SELECT * FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = 'Account'</div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="rules-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}

          {/* Rules list */}
          {hasFetched && !loading && (
            <>
              {filteredRules.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-title">NO {filter} RULES</div>
                  <div className="empty-desc">No validation rules match the current filter.</div>
                </div>
              ) : (
                <div className="rules-list">
                  {filteredRules.map((rule, i) => (
                    <div key={rule.Id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <ValidationRuleCard
                        rule={rule}
                        onToggle={handleToggleRule}
                        pending={pendingIds.has(rule.Id)}
                        hasLocalChange={rule.Id in localChanges}
                      />
                      {rule.Id in localChanges && (
                        <div className="change-indicator">
                          ↑ PENDING DEPLOY — {localChanges[rule.Id] ? 'will ACTIVATE' : 'will DEACTIVATE'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
