/* ============================================================
   SENTINEL AI — Shared Client Utilities
   (loaded before page-specific JS)

   This shared file owns the shared app `State/MOCK/I18N` and common helpers.
   Page-specific scripts load after this file and should not duplicate those helpers.
   ============================================================ */

'use strict';

const API_BASE = 'http://localhost:3000/dashboard/api';

// ── App State ──────────────────────────────────────────────
const State = {
  theme: localStorage.getItem('theme') || 'light',
  lang: localStorage.getItem('lang') || 'en',
  sidebarCollapsed: false,
  currentPage: 'dashboard',
  charts: {},
  cameraList: [],
  alertList: [],
  adminList: [],
  editingCamera: null
};

const ROLE_OPTIONS = ['super_admin', 'admin', 'viewer'];

// ── I18n ────────────────────────────────────────────────────
const translations = {
  en: {
    dashboard: 'Dashboard',
    alerts: 'Alerts',
    cameras: 'Cameras',
    history: 'History',
    admins: 'Admins',
    settings: 'Settings',
    profile: 'Profile',
    search: 'Search...',
    notifications: 'Notifications',
    account: 'Account',
    welcome: 'Welcome',
    backToDashboard: 'Back to Dashboard',
    accountInformation: 'Account Information',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    emailAddress: 'Email Address',
    emailPlaceholder: 'name@example.com',
    saveChanges: 'Save Changes',
    overview: 'OVERVIEW',
    management: 'MANAGEMENT',
    system: 'SYSTEM',
    totalCameras: 'Total Cameras',
    activeCameras: 'Active Cameras',
    totalAlerts: 'Total Alerts',
    todayAlerts: "Today's Alerts",
    recentAlerts: 'Recent Alerts',
    cameraStatus: 'Camera Status',
    livePreview: 'Live Camera Preview',
    alertsChart: 'Alerts Per Day',
    logout: 'Logout',
    camera: 'Camera',
    rtspIp: 'RTSP / IP',
    location: 'Location',
    status: 'Status',
    actions: 'Actions',
    role: 'Role',
    editRole: 'Edit Role',
    saveRole: 'Save Role',
    close: 'Close',
    changeRole: 'Change Role',
    selectRole: 'Select Role'
  },
  ar: {
    dashboard: 'لوحة التحكم',
    alerts: 'التنبيهات',
    cameras: 'الكاميرات',
    history: 'السجل',
    admins: 'المشرفين',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    search: 'بحث...',
    notifications: 'الإشعارات',
    account: 'الحساب',
    welcome: 'مرحبا',
    backToDashboard: 'العودة إلى لوحة التحكم',
    accountInformation: 'معلومات الحساب',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'اكتب اسمك الكامل',
    emailAddress: 'البريد الإلكتروني',
    emailPlaceholder: 'name@example.com',
    saveChanges: 'حفظ التغييرات',
    overview: 'نظرة عامة',
    management: 'الإدارة',
    system: 'النظام',
    totalCameras: 'إجمالي الكاميرات',
    activeCameras: 'الكاميرات النشطة',
    totalAlerts: 'إجمالي التنبيهات',
    todayAlerts: 'تنبيهات اليوم',
    recentAlerts: 'التنبيهات الأخيرة',
    cameraStatus: 'حالة الكاميرا',
    livePreview: 'معاينة الكاميرا المباشرة',
    alertsChart: 'التنبيهات يومياً',
    logout: 'تسجيل الخروج',
    camera: 'الكاميرا',
    rtspIp: 'RTSP / IP',
    location: 'الموقع',
    status: 'الحالة',
    actions: 'الإجراءات',
    role: 'الدور',
    editRole: 'تعديل الدور',
    saveRole: 'حفظ الدور',
    close: 'إغلاق',
    changeRole: 'تغيير الدور',
    selectRole: 'اختر دوراً'
  }
};

const dynamicPhraseMap = {
  'Dashboard': 'لوحة التحكم',
  'Alerts': 'التنبيهات',
  'Cameras': 'الكاميرات',
  'Detection History': 'سجل الكشف',
  'Admin Management': 'إدارة المشرفين',
  'Settings': 'الإعدادات',
  'Logout': 'تسجيل الخروج',
  'View All Alerts': 'عرض كل التنبيهات',
  'System Online': 'النظام متصل',
  'Live Camera Preview': 'المعاينة المباشرة للكاميرات',
  'Recent Alerts': 'التنبيهات الأخيرة',
  'Camera Status': 'حالة الكاميرات',
  'All Alerts': 'كل التنبيهات',
  'All Cameras': 'كل الكاميرات',
  'History': 'السجل',
  'Search': 'بحث',
  'Date': 'التاريخ',
  'Camera': 'الكاميرا',
  'Type': 'النوع',
  'Actions': 'الإجراءات',
  'Notifications': 'الإشعارات',
  'Account': 'الحساب',
  'Profile': 'الملف الشخصي'
};

function t(key) {
  return translations[State.lang]?.[key] || key;
}

// ── Shared UI Lifecycle ─────────────────────────────────────
function hideLoader() {
  const l = document.getElementById('loadingOverlay');
  if (!l) return;
  setTimeout(() => {
    l.classList.add('hide');
    setTimeout(() => l.remove(), 400);
  }, 800);
}

// ── Theme ───────────────────────────────────────────────────
function applyTheme(theme) {
  // `State` is defined in each page JS for now.
  State.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

  if (typeof refreshCharts === 'function') refreshCharts();
}

function toggleTheme() {
  applyTheme(State.theme === 'dark' ? 'light' : 'dark');
}

// ── Language ────────────────────────────────────────────────
function applyLang(lang) {
  State.lang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  applyTranslations(lang);
}

function updateI18nDOM() {
  const navKeys = { dashboard: 'dashboard', alerts: 'alerts', cameras: 'cameras', history: 'history', admins: 'admins', settings: 'settings' };
  document.querySelectorAll('.sidebar .nav-link[data-page] .nav-label').forEach(el => {
    const page = el.closest('.nav-link')?.getAttribute('data-page');
    if (page && navKeys[page]) el.setAttribute('data-i18n', navKeys[page]);
  });

  const notifTitle = document.querySelector('.notif-dropdown .border-bottom span');
  if (notifTitle) notifTitle.setAttribute('data-i18n', 'notifications');

  const accountHeader = document.querySelector('.dropdown-menu .dropdown-header');
  if (accountHeader) accountHeader.setAttribute('data-i18n', 'account');

  const phraseKeyMap = {
    Dashboard: 'dashboard',
    Alerts: 'alerts',
    Cameras: 'cameras',
    History: 'history',
    Settings: 'settings',
    Logout: 'logout',
    Camera: 'camera',
    Status: 'status',
    Actions: 'actions',
    Role: 'role',
    'Edit Role': 'editRole',
    'Save Role': 'saveRole',
    Close: 'close',
    'Change Role': 'changeRole',
    'Select Role': 'selectRole'
  };

  document.querySelectorAll('button, th, label, .card-title, .nav-label, .dropdown-item').forEach(el => {
    if (el.hasAttribute('data-i18n')) return;
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    const key = phraseKeyMap[text];
    if (key) el.setAttribute('data-i18n', key);
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = translated;
    else el.textContent = translated;
  });

  // Update sidebar active label.
  const activeLink = document.querySelector('.nav-link.active .nav-label');
  if (activeLink) {
    const key = activeLink.closest('[data-page]')?.getAttribute('data-page');
    if (key) activeLink.textContent = t(key);
  }
}

function applyTranslations(lang) {
  State.lang = lang;
  updateI18nDOM();
  applyDynamicTextTranslations(lang);
}

function applyDynamicTextTranslations(lang) {
  const candidates = document.querySelectorAll('h1,h2,h3,h4,h5,h6,label,button,a,span,p,th,option');
  candidates.forEach(el => {
    if (el.hasAttribute('data-i18n')) return;
    if (el.children.length > 0 && el.childNodes.length > 1) return;
    const currentText = el.textContent.trim();
    if (!currentText) return;
    if (!el.dataset.originalText) el.dataset.originalText = currentText;
    const baseText = el.dataset.originalText.trim();
    if (lang === 'ar' && dynamicPhraseMap[baseText]) {
      el.textContent = dynamicPhraseMap[baseText];
    } else if (lang === 'en' && el.dataset.originalText) {
      el.textContent = el.dataset.originalText;
    }
  });
}

// ── Sidebar ──────────────────────────────────────────────────
function bindSidebarToggle() {
  const btn = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');

  if (btn) {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 767) {
        document.getElementById('sidebar').classList.toggle('mobile-open');
        overlay?.classList.toggle('show');
      } else {
        State.sidebarCollapsed = !State.sidebarCollapsed;
        document.getElementById('sidebar').classList.toggle('collapsed', State.sidebarCollapsed);
        document.getElementById('mainContent').classList.toggle('expanded', State.sidebarCollapsed);
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('mobile-open');
      overlay.classList.remove('show');
    });
  }
}

// ── Topbar ───────────────────────────────────────────────────
function bindTopbarActions() {
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  ensureCurrentUser();
  ensureProfileLink();
  bindLogoutActions();
  syncCurrentUserUI();
  hydrateCurrentUser();
}

function getProfileHref() {
  return window.location.pathname.includes('/pages/') ? '../profile.html' : 'profile.html';
}

function ensureProfileLink() {
  const profileHref = getProfileHref();
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    const profileLink = menu.querySelector('.dropdown-item .fa-user')?.closest('.dropdown-item');
    if (!profileLink) return;
    profileLink.setAttribute('href', profileHref);
    profileLink.setAttribute('data-i18n', 'profile');
    profileLink.innerHTML = `<i class="fas fa-user"></i> ${t('profile')}`;
  });
}

function ensureCurrentUser() {
  const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!current.name) return;
  if (!ROLE_OPTIONS.includes(current.role)) {
    current.role = 'viewer';
    localStorage.setItem('currentUser', JSON.stringify(current));
  }
}

function getLoginHref() {
  return window.location.pathname.includes('/pages/') ? '../login.html' : 'login.html';
}

function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = getLoginHref();
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  window.location.href = getLoginHref();
}

function bindLogoutActions() {
  document.querySelectorAll('a[href$="login.html"]').forEach(link => {
    if (link.dataset.boundLogout === '1') return;
    link.dataset.boundLogout = '1';
    link.addEventListener('click', e => {
      e.preventDefault();
      logout();
    });
  });
}

function syncCurrentUserUI() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.name) return;

  document.querySelectorAll('.u-name, .user-name').forEach(el => {
    el.textContent = currentUser.name;
  });

  const userInitials = initials(currentUser.name);
  document.querySelectorAll('.topbar-avatar, .sidebar-avatar').forEach(el => {
    el.textContent = userInitials;
  });

  const topbarTitle = document.getElementById('topbarTitle');
  if (topbarTitle && State.currentPage === 'dashboard') {
    topbarTitle.textContent = `${t('welcome')}, ${currentUser.name}`;
  }

  const roleLabel = (currentUser.role || 'viewer').replace('_', ' ');
  document.querySelectorAll('.u-role, .user-role').forEach(el => {
    el.textContent = roleLabel.replace(/\b\w/g, c => c.toUpperCase());
  });
}

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let payload = null;
  try { payload = await response.json(); } catch (_) { payload = null; }
  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Request failed';
    throw new Error(message);
  }
  return payload;
}

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

async function hydrateCurrentUser() {
  try {
    if (!localStorage.getItem('token')) return;
    const data = await apiRequest('/user/me');
    const user = data?.data || data?.user || data;
    if (user && (user.name || user.email)) {
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id || user._id,
        name: user.name || user.fullName || '',
        email: user.email || '',
        role: user.role || 'viewer'
      }));
      syncCurrentUserUI();
    }
  } catch (_) {
    // Keep UI stable if profile endpoint fails.
  }
}

// ── Helpers ──────────────────────────────────────────────────
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function statusBadge(status) {
  const map = { 'Pending': 'badge-pending', 'Resolved': 'badge-resolved', 'False Alert': 'badge-false' };
  return `<span class="badge-status ${map[status] || 'badge-false'} px-2 py-1 rounded-pill" style="font-size:0.7rem;font-weight:600">${status}</span>`;
}

function formatDateTime(dt) {
  const [d, tStr] = dt.split(' ');
  return `<div style="font-size:0.8rem;font-weight:500">${d}</div><div style="font-size:0.72rem;color:var(--text-muted)">${tStr}</div>`;
}

function timeAgo(dtStr) {
  const then = new Date(dtStr);
  const now = new Date('2025-01-22T15:00:00');
  const diff = Math.floor((now - then) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }

  const colors = { success: '#00e676', danger: '#ff3b5c', warning: '#ffb020', info: '#00d4ff' };
  const icons = { success: 'fa-check-circle', danger: 'fa-exclamation-circle', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };

  const toast = document.createElement('div');
  toast.style.cssText = `background:var(--bg-card);border:1px solid var(--border);border-left:3px solid ${colors[type]};border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px;font-size:0.82rem;color:var(--text-primary);box-shadow:0 4px 20px rgba(0,0,0,0.15);min-width:260px;max-width:340px;opacity:0;transform:translateX(20px);transition:all 0.25s ease;font-family:'DM Sans',sans-serif;`;
  toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]};flex-shrink:0"></i><span style="flex:1">${message}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0 4px;font-size:1rem">&times;</button>`;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'none';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

window.checkAuth = checkAuth;
window.logout = logout;
window.apiRequest = apiRequest;
window.asArray = asArray;
window.API_BASE = API_BASE;
window.hydrateCurrentUser = hydrateCurrentUser;

