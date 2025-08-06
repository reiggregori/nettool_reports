// static/js/reports.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('filters-form');
  const tableBody = document.getElementById('results-body');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    // Converte os valores booleanos e numéricos corretamente
    if (data.active !== '') data.active = data.active === 'true';
    if (data.clientid) data.clientid = Number(data.clientid);

    const resp = await fetch('/reports/ambientes', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const rows = await resp.json();
    tableBody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.companyid}</td>
        <td>${r.environment_short}</td>
        <td>${r.client_name}</td>
        <td>${r.normalized_app_type}</td>
        <td>${r.environment_active}</td>
      </tr>
    `).join('');
  });
});