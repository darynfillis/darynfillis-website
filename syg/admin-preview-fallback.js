(function () {
  const sameOriginEndpoint = '/.netlify/functions/deals';
  const productionProxyEndpoint = '/api/syg-deals-production';
  const productionHosts = new Set(['darynfillis.com', 'www.darynfillis.com']);
  const localHosts = new Set(['localhost', '127.0.0.1']);
  const isPreviewHost = !productionHosts.has(window.location.hostname) && !localHosts.has(window.location.hostname);
  let activeEndpoint = sameOriginEndpoint;

  function isPreviewPasswordEnvironmentError(error) {
    const message = String(error && error.message ? error.message : '');
    return isPreviewHost && (
      message.includes('Missing SYG_PASSWORD') ||
      message.includes('Unauthorized') ||
      message.includes('Request failed: 401') ||
      message.includes('Request failed: 500')
    );
  }

  async function callEndpoint(endpoint, method, body) {
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-syg-password': password },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });

    if (!res.ok) {
      let msg = 'Request failed: ' + res.status;
      try {
        const err = await res.json();
        if (err && err.error) msg = err.error;
      } catch (e) {}
      throw new Error(msg);
    }

    return res.json();
  }

  window.sygAdminApi = async function sygAdminApi(method, body) {
    try {
      return await callEndpoint(activeEndpoint, method, body);
    } catch (error) {
      if (activeEndpoint === sameOriginEndpoint && isPreviewPasswordEnvironmentError(error)) {
        activeEndpoint = productionProxyEndpoint;
        if (typeof status === 'function') status('Using production API');
        if (typeof $ === 'function' && $('lastSavedNote')) {
          $('lastSavedNote').textContent = 'Deploy Preview fallback is active. This preview is using the production SYG data API because the preview environment does not have the matching SYG_PASSWORD. Saves affect the live SYG Blob data.';
        }
        return callEndpoint(activeEndpoint, method, body);
      }
      throw error;
    }
  };

  async function unlockWithPreviewFallback() {
    password = $('passwordInput').value || password;
    if (!password) {
      status('Password required', 'error');
      return;
    }
    sessionStorage.setItem(passwordKey, password);
    status('Loading');
    try {
      const data = await window.sygAdminApi('GET');
      records = Array.isArray(data) ? data.map(normalizeRecord) : [];
      showEditor();
      render();
      status(activeEndpoint === productionProxyEndpoint ? 'Loaded via production API' : 'Loaded');
      if (activeEndpoint !== productionProxyEndpoint) $('lastSavedNote').textContent = 'Loaded ' + records.length + ' saved entries.';
    } catch (error) {
      status(error.message, 'error');
      if (isPreviewHost && $('lastSavedNote')) {
        $('lastSavedNote').textContent = 'Deploy Preview login failed. Confirm the PR preview has access to SYG_PASSWORD, or merge this PR and test at /syg/admin on production.';
      }
    }
  }

  async function saveAllWithPreviewFallback() {
    status('Saving');
    try {
      records = records.map(normalizeRecord);
      await window.sygAdminApi('POST', records);
      dirty = false;
      status(activeEndpoint === productionProxyEndpoint ? 'Saved via production API' : 'Saved');
      $('lastSavedNote').textContent = 'Saved ' + records.length + ' entries at ' + new Date().toLocaleString() + (activeEndpoint === productionProxyEndpoint ? ' using the production SYG data API.' : '.');
      render();
    } catch (error) {
      status(error.message, 'error');
    }
  }

  if ($('unlockBtn')) $('unlockBtn').onclick = unlockWithPreviewFallback;
  if ($('saveBtn')) $('saveBtn').onclick = saveAllWithPreviewFallback;

  if (password) {
    $('passwordInput').value = password;
    unlockWithPreviewFallback();
  }
})();
