'use strict';

//الجزء دا هيتشال يا محمد لما تيجي تشتغل
// TEMPORARY MOCK LOGIN - REMOVE WHEN BACKEND IS READY
// Delete this entire IIFE block to restore API-only login with zero other changes.
(function () {
  function isBackendUnreachableError(err) {
    if (!err) return false;
    const msg = String(err.message || '').toLowerCase();
    const name = err.name || '';
    if (name === 'TypeError' && (msg.includes('fetch') || msg.includes('failed') || msg.includes('network'))) return true;
    if (msg.includes('failed to fetch')) return true;
    if (msg.includes('networkerror')) return true;
    if (msg.includes('load failed')) return true;
    if (msg.includes('aborted')) return true;
    return false;
  }

  window.tryTemporaryMockSuperAdminLoginWhenBackendUnreachable = function (email, password, err) {
    if (!isBackendUnreachableError(err)) return false;
    const MOCK_EMAIL = 'superadmin@example.com';
    const MOCK_PASSWORD = '123456';
    if (email !== MOCK_EMAIL || password !== MOCK_PASSWORD) return false;
    localStorage.setItem('token', 'FAKE_JWT_TOKEN');
    localStorage.setItem('currentUser', JSON.stringify({
      id: 'mock-super-admin',
      name: 'Super Admin',
      email: MOCK_EMAIL,
      role: 'super_admin'
    }));
    window.location.href = 'index.html';
    return true;
  };
})();
// END TEMPORARY MOCK LOGIN النهاااااااية

document.getElementById('togglePass').addEventListener('click', () => {
  const inp = document.getElementById('loginPass');
  const eye = document.getElementById('passEye');
  if (inp.type === 'password') { inp.type = 'text'; eye.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; eye.className = 'fas fa-eye'; }
});

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  let valid = true;

  document.getElementById('emailErr').textContent = '';
  document.getElementById('passErr').textContent = '';
  document.getElementById('loginEmail').classList.remove('is-invalid');
  document.getElementById('loginPass').classList.remove('is-invalid');

  if (!email) {
    document.getElementById('emailErr').textContent = 'Email is required.';
    document.getElementById('loginEmail').classList.add('is-invalid');
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    document.getElementById('emailErr').textContent = 'Enter a valid email address.';
    document.getElementById('loginEmail').classList.add('is-invalid');
    valid = false;
  }
  if (!pass) {
    document.getElementById('passErr').textContent = 'Password is required.';
    document.getElementById('loginPass').classList.add('is-invalid');
    valid = false;
  }
  if (!valid) return;

  // Show loader
  document.getElementById('loginBtnText').style.display = 'none';
  document.getElementById('loginBtnLoader').style.display = 'inline';
  document.getElementById('loginBtn').disabled = true;

  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: pass })
  })
    .then(res => {
      const token = res?.token || res?.data?.token || res?.accessToken;
      if (!token) throw new Error('Token not found in login response');
      localStorage.setItem('token', token);
      return apiRequest('/user/me');
    })
    .then(userRes => {
      const user = userRes?.data || userRes?.user || userRes;
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id || user._id,
          name: user.name || user.fullName || '',
          email: user.email || email,
          role: user.role || 'viewer'
        }));
      }
      window.location.href = 'index.html';
    })
    //دي كمان تبعهم يا محمد
    .catch(err => {
      if (typeof tryTemporaryMockSuperAdminLoginWhenBackendUnreachable === 'function' &&
          tryTemporaryMockSuperAdminLoginWhenBackendUnreachable(email, pass, err)) {
        return;
      }
      //----نهايتها يا باشا--
      document.getElementById('passErr').textContent = err.message || 'Login failed';
      document.getElementById('loginPass').classList.add('is-invalid');
    })
    .finally(() => {
      document.getElementById('loginBtnText').style.display = 'inline';
      document.getElementById('loginBtnLoader').style.display = 'none';
      document.getElementById('loginBtn').disabled = false;
    });
}

// Enter key
document.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

window.doLogin = doLogin;
