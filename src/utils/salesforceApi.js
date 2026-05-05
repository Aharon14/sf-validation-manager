export async function fetchValidationRules(instanceUrl, accessToken) {
  const apiVersion = 'v59.0';
  const soql = `SELECT Id, ValidationName, Active, Description, ErrorMessage, ErrorDisplayField, NamespacePrefix FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = 'Account' ORDER BY ValidationName ASC`;
  const url = `${instanceUrl}/services/data/${apiVersion}/tooling/query?q=${encodeURIComponent(soql)}`;
  const res = await sfFetch(url, accessToken);
  return res.records || [];
}

export async function updateValidationRule(instanceUrl, accessToken, ruleId, active) {
  const apiVersion = 'v59.0';
  const getUrl = `${instanceUrl}/services/data/${apiVersion}/tooling/sobjects/ValidationRule/${ruleId}`;
  
  const getRes = await fetch(getUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!getRes.ok) {
    throw new Error(`Failed to fetch rule: HTTP ${getRes.status}`);
  }

  const ruleData = await getRes.json();
  const existingMetadata = ruleData.Metadata || {};

  const patchRes = await fetch(getUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Metadata: {
        ...existingMetadata,
        active: active,
      }
    }),
  });

  if (!patchRes.ok && patchRes.status !== 204) {
    let msg = `HTTP ${patchRes.status}`;
    try {
      const err = await patchRes.json();
      msg = Array.isArray(err) ? err.map(e => e.message).join('; ') : err.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return true;
}

export async function bulkUpdateValidationRules(instanceUrl, accessToken, updates) {
  const results = await Promise.allSettled(
    updates.map(({ id, active }) =>
      updateValidationRule(instanceUrl, accessToken, id, active)
        .then(() => ({ id, success: true }))
        .catch(err => ({ id, success: false, error: err.message }))
    )
  );
  const succeeded = [];
  const failed = [];
  results.forEach(r => {
    if (r.status === 'fulfilled') {
      if (r.value.success) succeeded.push(r.value.id);
      else failed.push(r.value);
    } else {
      failed.push({ error: r.reason?.message });
    }
  });
  return { succeeded, failed };
}

export async function fetchUserInfo(instanceUrl, accessToken) {
  const url = `${instanceUrl}/services/oauth2/userinfo`;
  return sfFetch(url, accessToken);
}

async function sfFetch(url, accessToken) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (Array.isArray(err)) msg = err.map(e => e.message).join('; ');
      else msg = err.message || err.error_description || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}