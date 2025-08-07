function postJson(url, params = {}) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }).then(res => res.json());
}

document.addEventListener('DOMContentLoaded', () => {
  const clientSelect = document.getElementById('clientid');
  const envSelect = document.getElementById('environment');
  const userSelect = document.getElementById('userid');
  const appTypeSelect = document.getElementById('applicationtype');
  const activeSelect = document.getElementById('active');
  const reportTypeSelect = document.getElementById('reporttype');
  const resultsDiv = document.getElementById('results');
  const form = document.getElementById('filter-form');

  function getFilterParams(forEndpoint) {
    const params = {};
    if (clientSelect.value) {
      params.clientid = parseInt(clientSelect.value);
    }
    if (envSelect.value) {
      params.companyid = parseInt(envSelect.value);
    }
    if (appTypeSelect.value) {
      params.applicationtype = appTypeSelect.value;
    }
    if (activeSelect.value) {
      params.active = activeSelect.value === 'true';
    }
    return params;
  }

  function clearSelect(select) {
    select.innerHTML = '<option value="">Todos</option>';
  }

  function fetchClients(params = {}) {
    clearSelect(clientSelect);
    postJson('/reports/ambientes', params)
      .then(data => {
        const seen = {};
        data.forEach(item => {
          if (!seen[item.clientid]) {
            seen[item.clientid] = item.client_name;
          }
        });
        Object.entries(seen).forEach(([id,name]) => {
          const opt = document.createElement('option');
          opt.value = id; opt.textContent = name;
          clientSelect.appendChild(opt);
        });
      });
  }

  function fetchAppTypes(params = {}) {
    clearSelect(appTypeSelect);
    postJson('/reports/ambientes', params)
      .then(data => {
        const types = {};
        data.forEach(item => {
          if (item.normalized_app_type) types[item.normalized_app_type] = true;
        });
        Object.keys(types).forEach(type => {
          const opt = document.createElement('option');
          opt.value = type; opt.textContent = type;
          appTypeSelect.appendChild(opt);
        });
      });
  }

  function fetchEnvironments(params = {}) {
    clearSelect(envSelect);
    postJson('/reports/ambientes', params)
      .then(data => {
        const seen = {};
        data.forEach(item => {
          if (!seen[item.companyid]) {
            seen[item.companyid] = item.environment_short;
          }
        });
        Object.entries(seen).forEach(([id, name]) => {
          const opt = document.createElement('option');
          opt.value = id;
          opt.textContent = name;
          envSelect.appendChild(opt);
        });
      });
  }

  function fetchUsers(params = {}) {
    clearSelect(userSelect);
    postJson('/reports/usuarios', params)
      .then(data => {
        const seen = {};
        data.forEach(item => {
          if (!seen[item.userid]) {
            seen[item.userid] = item.user_name;
          }
        });
        Object.entries(seen).forEach(([id,name]) => {
          const opt = document.createElement('option');
          opt.value = id; opt.textContent = name;
          userSelect.appendChild(opt);
        });
      });
  }

  // initial population
  const initialParams = getFilterParams();
  fetchClients(initialParams);
  fetchEnvironments(initialParams);
  fetchUsers(initialParams);
  fetchAppTypes(initialParams);

  // event listeners
  clientSelect.addEventListener('change', () => {
    const params = getFilterParams();
    fetchClients(params);
    fetchEnvironments(params);
    fetchUsers(params);
    fetchAppTypes(params);
  });

  envSelect.addEventListener('change', () => {
    const params = getFilterParams();
    fetchClients(params);
    fetchEnvironments(params);
    fetchUsers(params);
    fetchAppTypes(params);
  });

  userSelect.addEventListener('change', () => {
    const params = getFilterParams();
    fetchClients(params);
    fetchEnvironments(params);
    fetchUsers(params);
    fetchAppTypes(params);
  });

  appTypeSelect.addEventListener('change', () => {
    const params = getFilterParams();
    fetchClients(params);
    fetchEnvironments(params);
    fetchUsers(params);
    fetchAppTypes(params);
  });

  activeSelect.addEventListener('change', () => {
    const params = getFilterParams();
    fetchClients(params);
    fetchEnvironments(params);
    fetchUsers(params);
    fetchAppTypes(params);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const reportType = reportTypeSelect.value || 'ambientes';
    const params = getFilterParams(reportType);
    const endpoint = reportType === 'usuarios' ? '/reports/usuarios' : '/reports/ambientes';
    postJson(endpoint, params)
      .then(data => {
        // Consolidate duplicate records per entity and application type
        const seenKeys = new Set();
        const isUserReport = reportType === 'usuarios';
        const deduped = data.filter(item => {
          const keyBase = isUserReport ? item.userid : item.companyid;
          const key = `${keyBase}_${item.normalized_app_type}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            return true;
          }
          return false;
        });
        data = deduped;
        if (data.length === 0) {
          resultsDiv.innerHTML = '<p>Nenhum resultado encontrado.</p>';
          return;
        }
        let cols = Object.keys(data[0]);
        if (reportType === 'usuarios') {
          cols = ['userid','user_name','email','user_active','companyid','environment_short','normalized_app_type'];
        }
        let html = '<table><thead><tr>';
        cols.forEach(c => html += `<th>${c}</th>`);
        html += '</tr></thead><tbody>';
        data.forEach(row => {
          html += '<tr>';
          cols.forEach(c => html += `<td>${row[c]??''}</td>`);
          html += '</tr>';
        });
        html += '</tbody></table>';
        resultsDiv.innerHTML = html;
      });
  });
});