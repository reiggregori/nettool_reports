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
  const resultsDiv = document.getElementById('results');
  const form = document.getElementById('filter-form');

  function clearSelect(select) {
    select.innerHTML = '<option value="">Todos</option>';
  }

  function fetchClients() {
    clearSelect(clientSelect);
    postJson('/reports/ambientes', {})
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
  fetchClients();
  fetchEnvironments();
  fetchUsers();
  fetchAppTypes();

  // event listeners
  clientSelect.addEventListener('change', () => {
    const params = { clientid: clientSelect.value };
    fetchEnvironments(params);
    fetchUsers(params);
    fetchAppTypes(params);
  });

  envSelect.addEventListener('change', () => {
    const params = { clientid: clientSelect.value, companyid: envSelect.value };
    fetchUsers(params);
    fetchAppTypes(params);
  });

  userSelect.addEventListener('change', () => {
    const params = { clientid: clientSelect.value, userid: userSelect.value };
    fetchEnvironments(params);
    fetchAppTypes(params);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = {};
    if (clientSelect.value) params.clientid = clientSelect.value;
    if (envSelect.value) params.companyid = envSelect.value;
    if (userSelect.value) params.userid = userSelect.value;
    if (appTypeSelect.value) params.applicationtype = appTypeSelect.value;
    if (activeSelect.value) params.active = activeSelect.value;

    const endpoint = userSelect.value ? '/reports/usuarios' : '/reports/ambientes';
    postJson(endpoint, params)
      .then(data => {
        // Consolidate duplicate records per entity and application type
        const seenKeys = new Set();
        const deduped = data.filter(item => {
          const keyBase = userSelect.value ? item.userid : item.companyid;
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
        const cols = Object.keys(data[0]);
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