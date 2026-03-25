/* ============================================================
   SENTINEL AI — Core Application JavaScript
   ============================================================ */

'use strict';

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  applyTheme(State.theme);
  applyLang(State.lang);
  bindTopbarActions();
  bindSidebarToggle();
  State.currentPage = 'alerts';
  if (typeof bindAlertFilters === 'function') bindAlertFilters();
  loadAlerts();
  setInterval(updateLiveBadges, 3000);
  setInterval(simulateLiveAlert, 18000);
});

function loadAlerts() {
  apiRequest('/alert/')
    .then(res => {
      const alerts = asArray(res);
      State.alertList = alerts.map(a => ({
        id: a.id || a._id,
        cam: a.cameraName || a.camera?.name || `Camera ${a.cameraId || ''}`.trim(),
        camId: a.cameraId || a.camera?.id || null,
        type: a.type || a.alertType || 'Unknown',
        status: a.status || 'Pending',
        time: (a.createdAt || a.time || '').replace('T', ' ').slice(0, 19),
        confidence: Number(a.confidence || a.score || 0),
        details: a.details || a.description || 'No details provided.'
      }));
      renderAlertsPage();
    })
    .catch(err => showToast(err.message || 'Failed to fetch alerts.', 'danger'))
    .finally(() => hideLoader());
}

// ── Navigation ───────────────────────────────────────────────
function navigateTo(page) {
  const routes = {
    dashboard: '../index.html',
    alerts: 'alerts.html',
    cameras: 'cameras.html',
    history: 'history.html',
    admins: 'admins.html',
    settings: 'settings.html'
  };
  const url = routes[page];
  if (url) window.location.href = url;
}

// ── Dashboard ────────────────────────────────────────────────
function renderDashboard() {
  const online = State.cameraList.filter(c => c.status === 'online').length;
  const total = State.cameraList.length;
  const totalAlerts = State.alertList.length;
  const todayAlerts = State.alertList.filter(a => a.time.startsWith('2025-01-22')).length;

  // Stat Cards
  setHTML('stat-totalCameras', `<div class="stat-value">${total}</div><div class="stat-label">Total Cameras</div><div class="stat-trend neutral"><i class="fas fa-minus fa-xs"></i> No change</div>`);
  setHTML('stat-activeCameras', `<div class="stat-value">${online}</div><div class="stat-label">Active Cameras</div><div class="stat-trend up"><i class="fas fa-arrow-up fa-xs"></i> ${Math.round(online/total*100)}% uptime</div>`);
  setHTML('stat-totalAlerts', `<div class="stat-value">${totalAlerts}</div><div class="stat-label">Total Alerts</div><div class="stat-trend down"><i class="fas fa-arrow-up fa-xs"></i> +3 this week</div>`);
  setHTML('stat-todayAlerts', `<div class="stat-value">${todayAlerts}</div><div class="stat-label">Today's Alerts</div><div class="stat-trend down"><i class="fas fa-arrow-up fa-xs"></i> High activity</div>`);

  // Recent Alerts
  const recents = State.alertList.slice(0, 5);
  setHTML('recentAlertsList', recents.map(a => `
    <div class="alert-item">
      <div class="alert-item-icon ${a.type === 'Weapon' ? 'weapon' : 'harassment'}">
        <i class="${a.type === 'Weapon' ? 'fas fa-gun' : 'fas fa-person-rays'}"></i>
      </div>
      <div class="flex-1">
        <div class="alert-item-title">${a.type} Detected — ${a.cam}</div>
        <div class="alert-item-meta">${a.id} &bull; Confidence: ${a.confidence}%</div>
      </div>
      <div class="d-flex flex-column align-items-end gap-1">
        <div class="alert-item-time">${timeAgo(a.time)}</div>
        ${statusBadge(a.status)}
      </div>
    </div>
  `).join(''));

  // Camera Status List
  const camRows = State.cameraList.slice(0, 6).map(c => `
    <tr>
      <td><div class="d-flex align-items-center gap-2"><i class="fas fa-video text-muted-custom" style="font-size:0.8rem"></i>${c.name}</div></td>
      <td><span class="font-mono">${c.ip.replace('rtsp://','')}</span></td>
      <td>${c.location}</td>
      <td><span class="badge-status badge-${c.status}">${c.status.charAt(0).toUpperCase()+c.status.slice(1)}</span></td>
      <td>${c.alerts}</td>
    </tr>
  `).join('');
  setHTML('cameraStatusBody', camRows);

  // Camera Live Preview
  const liveCards = State.cameraList.slice(0, 4).map(c => buildCameraCard(c, true)).join('');
  setHTML('livePreviews', liveCards);

  // Charts
  setTimeout(() => {
    renderBarChart();
    renderDonutChart();
  }, 100);
}

function renderBarChart() {
  const ctx = document.getElementById('alertsBarChart');
  if (!ctx) return;
  if (State.charts.bar) State.charts.bar.destroy();
  const isDark = State.theme === 'dark';
  State.charts.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MOCK.chartData.labels,
      datasets: [
        { label: 'Weapon', data: MOCK.chartData.weapon, backgroundColor: 'rgba(255,59,92,0.7)', borderColor: '#ff3b5c', borderWidth: 1, borderRadius: 4 },
        { label: 'Harassment', data: MOCK.chartData.harassment, backgroundColor: 'rgba(168,85,247,0.7)', borderColor: '#a855f7', borderWidth: 1, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11 } } } },
      scales: {
        x: { grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 11 } } },
        y: { grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 11 } }, beginAtZero: true }
      }
    }
  });
}

function renderDonutChart() {
  const ctx = document.getElementById('alertsDonutChart');
  if (!ctx) return;
  if (State.charts.donut) State.charts.donut.destroy();
  const isDark = State.theme === 'dark';
  const weapon = State.alertList.filter(a => a.type === 'Weapon').length;
  const harassment = State.alertList.filter(a => a.type === 'Harassment').length;
  State.charts.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Weapon', 'Harassment'],
      datasets: [{ data: [weapon, harassment], backgroundColor: ['rgba(255,59,92,0.85)', 'rgba(168,85,247,0.85)'], borderWidth: 0, hoverOffset: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '72%',
      plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11 }, padding: 16 } } }
    }
  });
}

function refreshCharts() {
  if (State.currentPage === 'dashboard') {
    setTimeout(() => { renderBarChart(); renderDonutChart(); }, 100);
  }
  if (State.currentPage === 'history') {
    setTimeout(() => renderHistoryChart(), 100);
  }
}

// ── Alerts Page ───────────────────────────────────────────────
let alertFilters = { date: '', camera: '', type: '', search: '' };

function renderAlertsPage() {
  const filtered = filterAlerts();
  buildAlertsTable(filtered);
}

function filterAlerts() {
  return State.alertList.filter(a => {
    const f = alertFilters;
    if (f.date && !a.time.startsWith(f.date)) return false;
    if (f.camera && a.camId !== parseInt(f.camera)) return false;
    if (f.type && a.type !== f.type) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!a.id.toLowerCase().includes(q) && !a.cam.toLowerCase().includes(q) && !a.type.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function buildAlertsTable(alerts) {
  const tbody = document.getElementById('alertsTableBody');
  if (!tbody) return;
  if (alerts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-bell-slash"></i><h5>No Alerts Found</h5><p>No alerts match your current filters.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = alerts.map(a => `
    <tr>
      <td><span class="font-mono text-primary-custom">${a.id}</span></td>
      <td>${formatDateTime(a.time)}</td>
      <td><div class="d-flex align-items-center gap-2"><i class="fas fa-video" style="color:var(--text-muted);font-size:0.75rem"></i>${a.cam}</div></td>
      <td><span class="badge-status ${a.type === 'Weapon' ? 'badge-weapon' : 'badge-harassment'} px-2 py-1 rounded-pill" style="font-size:0.72rem;font-weight:600">${a.type}</span></td>
      <td><span class="badge fw-600" style="font-size:0.72rem">${a.confidence}%</span></td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn-icon" title="View Details" onclick="viewAlertDetail('${a.id}')"><i class="fas fa-eye"></i></button>
          <button class="btn-icon" title="Mark False Alert" onclick="markFalseAlert('${a.id}')"><i class="fas fa-times"></i></button>
          <button class="btn-icon" title="Mark Resolved" onclick="markResolved('${a.id}')"><i class="fas fa-check"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function markFalseAlert(id) {
  apiRequest(`/alert/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'False Alert' })
  })
    .then(() => {
      const a = State.alertList.find(x => x.id === id);
      if (a) a.status = 'False Alert';
      renderAlertsPage();
      showToast('Alert marked as false alert', 'warning');
    })
    .catch(err => showToast(err.message || 'Status update failed.', 'danger'));
}
function markResolved(id) {
  apiRequest(`/alert/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Resolved' })
  })
    .then(() => {
      const a = State.alertList.find(x => x.id === id);
      if (a) a.status = 'Resolved';
      renderAlertsPage();
      showToast('Alert marked as resolved', 'success');
    })
    .catch(err => showToast(err.message || 'Status update failed.', 'danger'));
}

function viewAlertDetail(id) {
  const a = State.alertList.find(x => x.id === id);
  if (!a) return;
  const content = document.getElementById('alertDetailContent');
  if (!content) return;
  content.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="detection-frame mb-3">
          <div class="detection-frame-bg">
            <div class="scan-line"></div>
            <div class="detection-overlay"><span class="detection-overlay-label">${a.type.toUpperCase()}</span></div>
            <i class="fas fa-video" style="font-size:3rem;color:rgba(0,212,255,0.15);z-index:0"></i>
          </div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <span class="badge-status badge-${a.type === 'Weapon' ? 'danger' : 'warning'} px-3 py-2">${a.type}</span>
          <span class="badge-status badge-${a.status === 'Resolved' ? 'online' : a.status === 'Pending' ? 'warning' : 'offline'} px-3 py-2">${a.status}</span>
          <span class="badge-status badge-warning px-3 py-2"><i class="fas fa-chart-bar me-1"></i>${a.confidence}% Confidence</span>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="card h-100"><div class="card-body">
          <h6 class="card-title mb-3" style="font-size:0.85rem">Alert Information</h6>
          <div class="d-flex flex-column gap-3">
            ${detailRow('fas fa-fingerprint', 'Alert ID', `<span class="font-mono text-primary-custom">${a.id}</span>`)}
            ${detailRow('fas fa-video', 'Camera', a.cam)}
            ${detailRow('fas fa-clock', 'Date & Time', formatDateTime(a.time))}
            ${detailRow('fas fa-crosshairs', 'Detection Type', a.type)}
            ${detailRow('fas fa-percentage', 'Confidence', `${a.confidence}%`)}
            ${detailRow('fas fa-circle-info', 'Description', a.details)}
          </div>
          <div class="d-flex gap-2 mt-4">
            <button class="btn-primary-custom flex-1 justify-content-center" onclick="markResolved('${a.id}');bootstrap.Modal.getInstance(document.getElementById('alertDetailModal')).hide()">
              <i class="fas fa-check"></i> Resolve
            </button>
            <button class="btn-outline-custom" onclick="markFalseAlert('${a.id}');bootstrap.Modal.getInstance(document.getElementById('alertDetailModal')).hide()">
              <i class="fas fa-times"></i> False Alert
            </button>
          </div>
        </div></div>
      </div>
    </div>`;
  new bootstrap.Modal(document.getElementById('alertDetailModal')).show();
}

function detailRow(icon, label, value) {
  return `<div>
    <div class="d-flex align-items-center gap-2 mb-1">
      <i class="${icon}" style="color:var(--primary);font-size:0.75rem;width:14px"></i>
      <span style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);font-weight:600">${label}</span>
    </div>
    <div style="font-size:0.83rem;color:var(--text-primary);padding-left:22px">${value}</div>
  </div>`;
}

// ── Cameras Page ──────────────────────────────────────────────
function renderCamerasPage() {
  const tbody = document.getElementById('camerasTableBody');
  if (!tbody) return;
  if (State.cameraList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-video-slash"></i><h5>No Cameras</h5><p>Add your first camera to get started.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = State.cameraList.map(c => `
    <tr>
      <td><div class="d-flex align-items-center gap-2">
        <div style="width:32px;height:32px;border-radius:8px;background:var(--primary-glow);display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:var(--primary)"><i class="fas fa-video"></i></div>
        <div><div style="font-weight:600;font-size:0.85rem">${c.name}</div><div style="font-size:0.7rem;color:var(--text-muted)">${c.location}</div></div>
      </div></td>
      <td><span class="font-mono">${c.ip}</span></td>
      <td>${c.location}</td>
      <td><span class="badge-status badge-${c.status}">${c.status.charAt(0).toUpperCase()+c.status.slice(1)}</span></td>
      <td>${c.alerts}</td>
      <td>${c.added}</td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn-icon" title="Test Connection" onclick="testCamera(${c.id})"><i class="fas fa-plug"></i></button>
          <button class="btn-icon" title="Edit" onclick="editCamera(${c.id})"><i class="fas fa-pen"></i></button>
          <button class="btn-icon danger" title="Delete" onclick="deleteCamera(${c.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
  // Update camera filter options in alerts
  updateCameraFilterOptions();
}

function editCamera(id) {
  const cam = State.cameraList.find(c => c.id === id);
  if (!cam) return;
  State.editingCamera = id;
  document.getElementById('camModalTitle').textContent = 'Edit Camera';
  document.getElementById('camName').value = cam.name;
  document.getElementById('camIp').value = cam.ip;
  document.getElementById('camLocation').value = cam.location;
  new bootstrap.Modal(document.getElementById('cameraModal')).show();
}

function openAddCamera() {
  State.editingCamera = null;
  document.getElementById('camModalTitle').textContent = 'Add New Camera';
  document.getElementById('cameraForm').reset();
  new bootstrap.Modal(document.getElementById('cameraModal')).show();
}

function saveCamera() {
  const name = document.getElementById('camName').value.trim();
  const ip = document.getElementById('camIp').value.trim();
  const location = document.getElementById('camLocation').value.trim();
  let valid = true;
  ['camName','camIp','camLocation'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.toggle('is-invalid', !el.value.trim());
    if (!el.value.trim()) valid = false;
  });
  if (!valid) return;
  if (State.editingCamera) {
    const cam = State.cameraList.find(c => c.id === State.editingCamera);
    if (cam) { cam.name = name; cam.ip = ip; cam.location = location; }
    showToast('Camera updated successfully', 'success');
  } else {
    State.cameraList.push({ id: Date.now(), name, ip, location, status: 'offline', added: new Date().toISOString().slice(0,10), alerts: 0 });
    showToast('Camera added successfully', 'success');
  }
  bootstrap.Modal.getInstance(document.getElementById('cameraModal')).hide();
  renderCamerasPage();
}

function deleteCamera(id) {
  if (!confirm('Delete this camera?')) return;
  State.cameraList = State.cameraList.filter(c => c.id !== id);
  renderCamerasPage();
  showToast('Camera deleted', 'danger');
}

function testCamera(id) {
  const cam = State.cameraList.find(c => c.id === id);
  if (!cam) return;
  showToast(`Testing connection to ${cam.name}...`, 'info');
  setTimeout(() => {
    const ok = Math.random() > 0.3;
    showToast(ok ? `✓ ${cam.name} — Connection successful` : `✗ ${cam.name} — Connection failed`, ok ? 'success' : 'danger');
  }, 1500);
}

function updateCameraFilterOptions() {
  const sel = document.getElementById('filterCamera');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">All Cameras</option>' +
    State.cameraList.map(c => `<option value="${c.id}" ${cur==c.id?'selected':''}>${c.name}</option>`).join('');
}

// ── History Page ──────────────────────────────────────────────
function renderHistoryPage() {
  const search = document.getElementById('histSearch')?.value?.toLowerCase() || '';
  const type = document.getElementById('histType')?.value || '';
  const status = document.getElementById('histStatus')?.value || '';
  const filtered = State.alertList.filter(a => {
    if (type && a.type !== type) return false;
    if (status && a.status !== status) return false;
    if (search && !a.id.toLowerCase().includes(search) && !a.cam.toLowerCase().includes(search)) return false;
    return true;
  });
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-clock-rotate-left"></i><h5>No History Found</h5><p>No detection records match your filters.</p></div></td></tr>`;
  } else {
    tbody.innerHTML = filtered.map((a,i) => `
      <tr class="animate-in" style="animation-delay:${i*0.03}s">
        <td><span class="font-mono text-primary-custom">${a.id}</span></td>
        <td>${formatDateTime(a.time)}</td>
        <td>${a.cam}</td>
        <td><span class="badge-status ${a.type === 'Weapon' ? 'badge-weapon' : 'badge-harassment'} px-2 py-1 rounded-pill" style="font-size:0.72rem">${a.type}</span></td>
        <td><span class="badge fw-600" style="font-size:0.72rem">${a.confidence}%</span></td>
        <td>${statusBadge(a.status)}</td>
        <td><button class="btn-icon" onclick="viewAlertDetail('${a.id}')"><i class="fas fa-eye"></i></button></td>
      </tr>`).join('');
  }
  setTimeout(renderHistoryChart, 100);
}

function renderHistoryChart() {
  const ctx = document.getElementById('historyLineChart');
  if (!ctx) return;
  if (State.charts.line) State.charts.line.destroy();
  const isDark = State.theme === 'dark';
  State.charts.line = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MOCK.hourlyData.labels,
      datasets: [{
        label: 'Alerts',
        data: MOCK.hourlyData.counts,
        borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.08)',
        borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#00d4ff',
        tension: 0.4, fill: true
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 11 } } },
        y: { grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 11 } }, beginAtZero: true }
      }
    }
  });
}

// ── Admins Page ───────────────────────────────────────────────
function renderAdminsPage() {
  const tbody = document.getElementById('adminsTableBody');
  if (!tbody) return;
  tbody.innerHTML = State.adminList.map(a => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.8rem;flex-shrink:0">${initials(a.name)}</div>
          <div><div style="font-weight:600;font-size:0.85rem">${a.name}</div><div style="font-size:0.72rem;color:var(--text-muted)">${a.email}</div></div>
        </div>
      </td>
      <td><span class="badge rounded-pill ${a.role === 'Super Admin' ? 'bg-danger' : a.role === 'Admin' ? 'bg-primary' : 'bg-secondary'}" style="font-size:0.7rem">${a.role}</span></td>
      <td><span class="badge-status badge-${a.status === 'Active' ? 'online' : 'offline'}">${a.status}</span></td>
      <td>${a.added}</td>
      <td style="font-size:0.78rem;color:var(--text-muted)">${a.last}</td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn-icon" onclick="editAdmin(${a.id})"><i class="fas fa-pen"></i></button>
          ${a.role !== 'Super Admin' ? `<button class="btn-icon danger" onclick="deleteAdmin(${a.id})"><i class="fas fa-trash"></i></button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function editAdmin(id) {
  showToast('Edit admin feature — form would appear here', 'info');
}
function deleteAdmin(id) {
  if (!confirm('Delete this admin?')) return;
  State.adminList = State.adminList.filter(a => a.id !== id);
  renderAdminsPage();
  showToast('Admin deleted', 'danger');
}
function openAddAdmin() {
  new bootstrap.Modal(document.getElementById('addAdminModal')).show();
}
function saveAdmin() {
  const name = document.getElementById('adminName')?.value.trim();
  const email = document.getElementById('adminEmail')?.value.trim();
  const role = document.getElementById('adminRole')?.value;
  const pass = document.getElementById('adminPass')?.value;
  let valid = true;
  ['adminName','adminEmail','adminRole','adminPass'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('is-invalid', !el.value.trim());
    if (!el.value.trim()) valid = false;
  });
  if (!valid) return;
  State.adminList.push({ id: Date.now(), name, email, role, status: 'Active', added: new Date().toISOString().slice(0,10), last: 'Never' });
  bootstrap.Modal.getInstance(document.getElementById('addAdminModal')).hide();
  document.getElementById('addAdminModal').querySelector('form')?.reset();
  renderAdminsPage();
  showToast('Admin added successfully', 'success');
}

// ── Settings Page ─────────────────────────────────────────────
function renderSettingsPage() {
  const el = document.getElementById('langSelect');
  if (el) el.value = State.lang;
  const th = document.getElementById('themeSelect');
  if (th) th.value = State.theme;
}
function applySettings() {
  const lang = document.getElementById('langSelect')?.value;
  const theme = document.getElementById('themeSelect')?.value;
  if (lang) applyLang(lang);
  if (theme) applyTheme(theme);
  showToast('Settings saved successfully', 'success');
}

// ── Camera Cards ──────────────────────────────────────────────
function buildCameraCard(cam, showPreview) {
  return `
    <div class="camera-card">
      <div class="camera-preview">
        <div class="camera-preview-bg">
          ${cam.status === 'online' ? '<div class="scan-line"></div>' : ''}
          <i class="fas fa-video camera-preview-icon"></i>
        </div>
        ${cam.status === 'online' ? `<div class="camera-live-badge"><div class="live-dot"></div> LIVE</div>` : ''}
        <div class="camera-status-badge"><span class="badge-status badge-${cam.status}">${cam.status.charAt(0).toUpperCase()+cam.status.slice(1)}</span></div>
      </div>
      <div class="camera-info">
        <h6>${cam.name}</h6>
        <div class="cam-ip">${cam.ip.replace('rtsp://','')}</div>
      </div>
    </div>`;
}

// ── Live Alert Simulation ─────────────────────────────────────
function simulateLiveAlert() {
  if (State.currentPage !== 'dashboard') return;
  const cam = State.cameraList.filter(c => c.status === 'online');
  if (!cam.length) return;
  const c = cam[Math.floor(Math.random() * cam.length)];
  const type = Math.random() > 0.5 ? 'Weapon' : 'Harassment';
  showToast(`⚠ ${type} detected at ${c.name}`, 'danger');
  const notifCount = document.getElementById('notifCount');
  if (notifCount) {
    const cur = parseInt(notifCount.textContent) || 0;
    notifCount.textContent = cur + 1;
  }
}

function updateLiveBadges() {
  // Randomly flicker scan lines for realism (no-op visually unless we add logic)
}

// ── Alert Filters Binding ────────────────────────────────────
window.bindAlertFilters = function() {
  const apply = () => { alertFilters.date = document.getElementById('filterDate')?.value || ''; alertFilters.camera = document.getElementById('filterCamera')?.value || ''; alertFilters.type = document.getElementById('filterType')?.value || ''; renderAlertsPage(); };
  ['filterDate','filterCamera','filterType'].forEach(id => document.getElementById(id)?.addEventListener('change', apply));
  document.getElementById('alertSearch')?.addEventListener('input', e => { alertFilters.search = e.target.value; renderAlertsPage(); });
};

// ── Global Functions (for onclick handlers) ───────────────────
window.navigateTo = navigateTo;
window.toggleTheme = toggleTheme;
window.applyLang = applyLang;
window.openAddCamera = openAddCamera;
window.editCamera = editCamera;
window.deleteCamera = deleteCamera;
window.saveCamera = saveCamera;
window.testCamera = testCamera;
window.viewAlertDetail = viewAlertDetail;
window.markFalseAlert = markFalseAlert;
window.markResolved = markResolved;
window.openAddAdmin = openAddAdmin;
window.saveAdmin = saveAdmin;
window.editAdmin = editAdmin;
window.deleteAdmin = deleteAdmin;
window.applySettings = applySettings;
window.showToast = showToast;
