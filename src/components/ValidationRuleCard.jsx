import React, { useState } from 'react';
import './ValidationRuleCard.css';

export default function ValidationRuleCard({ rule, onToggle, pending }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = rule.Active;

  return (
    <div className={`vr-card ${isActive ? 'active' : 'inactive'} ${pending ? 'pending' : ''}`}>
      {/* Status bar */}
      <div className="vr-status-bar" />

      <div className="vr-header" onClick={() => setExpanded(e => !e)}>
        <div className="vr-left">
          {/* Status badge */}
          <div className={`vr-badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
            <span className="badge-dot" />
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </div>

          <div className="vr-name-row">
            <span className="vr-name">{rule.ValidationName || rule.FullName}</span>
            {rule.NamespacePrefix && (
              <span className="vr-ns">{rule.NamespacePrefix}</span>
            )}
          </div>

          {rule.ErrorDisplayField && (
            <div className="vr-field">FIELD: {rule.ErrorDisplayField}</div>
          )}
        </div>

        <div className="vr-right">
          {/* Toggle switch */}
          <button
            className={`toggle-btn ${isActive ? 'toggle-on' : 'toggle-off'}`}
            onClick={e => { e.stopPropagation(); onToggle(rule.Id, !isActive); }}
            disabled={pending}
            title={isActive ? 'Deactivate' : 'Activate'}
          >
            {pending ? (
              <span className="toggle-spinner" />
            ) : (
              <span className="toggle-thumb" />
            )}
          </button>

          {/* Expand arrow */}
          <button className={`expand-btn ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(e => !e)}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="vr-details">
          {rule.Description && (
            <div className="detail-row">
              <span className="detail-key">DESCRIPTION</span>
              <span className="detail-val">{rule.Description}</span>
            </div>
          )}
          {rule.ErrorMessage && (
            <div className="detail-row">
              <span className="detail-key">ERROR MSG</span>
              <span className="detail-val error-msg">{rule.ErrorMessage}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-key">RULE ID</span>
            <span className="detail-val mono">{rule.Id}</span>
          </div>
          {rule.FullName && (
            <div className="detail-row">
              <span className="detail-key">API NAME</span>
              <span className="detail-val mono">{rule.FullName}</span>
            </div>
          )}
          {rule.Metadata?.errorConditionFormula && (
            <div className="detail-row formula-row">
              <span className="detail-key">FORMULA</span>
              <pre className="formula-pre">{rule.Metadata.errorConditionFormula}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
