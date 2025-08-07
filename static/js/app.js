function postJson(url, params = {}) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }).then(res => res.json());
}

function exportTableToCSV(tableId, filename = 'relatorio.csv') {
  const table = document.querySelector(`#${tableId}`);
  if (!table) return;
  let csv = [];
  const rows = table.querySelectorAll('tr');
  for (let row of rows) {
    let cols = Array.from(row.querySelectorAll('th,td')).map(td => `"${(td.innerText || '').replace(/"/g, '""')}"`);
    csv.push(cols.join(','));
  }
  const csvContent = "data:text/csv;charset=utf-8," + csv.join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', () => {
  const clientSelect = document.getElementById('clientid');
  const envSelect = document.getElementById('environment');
  const appTypeSelect = document.getElementById('applicationtype');
  const activeSelect = document.getElementById('active');
  const reportTypeSelect = document.getElementById('reporttype');
  const resultsDiv = document.getElementById('results');
  const form = document.getElementById('filter-form');

  function getFilterParams() {
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
      params.active = activeSelect.value === 'true' ? true : (activeSelect.value === 'false' ? false : undefined);
    }
    return params;
  }

  function clearSelect(select) {
    select.innerHTML = '<option value="">Todos</option>';
  }

  function fetchClients(params = {}) {
    const prev = clientSelect.value;
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
        if (prev && clientSelect.querySelector(`option[value="${prev}"]`)) {
          clientSelect.value = prev;
        }
      });
  }

  function fetchAppTypes(params = {}) {
    const prev = appTypeSelect.value;
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
        if (prev && appTypeSelect.querySelector(`option[value="${prev}"]`)) {
          appTypeSelect.value = prev;
        }
      });
  }

  function fetchEnvironments(params = {}) {
    const prev = envSelect.value;
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
        if (prev && envSelect.querySelector(`option[value="${prev}"]`)) {
          envSelect.value = prev;
        }
      });
  }

  // initial population
  const initialParams = getFilterParams();
  fetchClients(initialParams);
  fetchEnvironments(initialParams);
  fetchAppTypes(initialParams);

  // event listeners
  clientSelect.addEventListener('change', () => {
    const params = getFilterParams();
    fetchEnvironments(params);
    fetchAppTypes(params);
  });

  envSelect.addEventListener('change', () => {
    const params = getFilterParams();
    fetchAppTypes(params);
  });

  appTypeSelect.addEventListener('change', () => {});

  activeSelect.addEventListener('change', () => {});

  // Exportar CSV
  document.getElementById('exportBtn').addEventListener('click', () => {
    const table = document.getElementById('results-table');
    if (!table) {
      alert('Nenhum resultado para exportar. Por favor, realize uma busca primeiro.');
      return;
    }
    exportTableToCSV('results-table');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const reportType = reportTypeSelect.value || 'ambientes';
    const params = getFilterParams();
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
        let html = '<table id="results-table" class="table table-striped table-bordered"><thead><tr>';
        cols.forEach(c => html += `<th>${c}</th>`);
        html += '</tr></thead><tbody>';
        data.forEach(row => {
          html += '<tr>';
          cols.forEach(c => html += `<td>${row[c]??''}</td>`);
          html += '</tr>';
        });
        html += '</tbody></table>';
        resultsDiv.innerHTML = html;
        // Ative a ordenação
        const table = resultsDiv.querySelector('table');
        if (table && typeof Tablesort !== 'undefined') {
          new Tablesort(table);
        }
      });
  });
});