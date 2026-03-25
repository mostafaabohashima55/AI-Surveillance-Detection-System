'use strict';

function goStep2() {
  let valid = true;
  const fields = [
    ['regFirstName', 'err-first', 'First name required'],
    ['regLastName', 'err-last', 'Last name required'],
    ['regEmail', 'err-email', 'Valid email required'],
    ['regRole', 'err-role', 'Please select a role'],
  ];
  fields.forEach(([id, errId, msg]) => {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    err.textContent = '';
    el.classList.remove('is-invalid');
    if (!el.value.trim()) { err.textContent = msg; el.classList.add('is-invalid'); valid = false; }
    else if (id === 'regEmail' && !/\S+@\S+\.\S+/.test(el.value)) { err.textContent = 'Enter a valid email'; el.classList.add('is-invalid'); valid = false; }
  });
  if (!valid) return;
  document.getElementById('step1').style.display = 'none';
  document.getElementById('step2').style.display = 'block';
  document.getElementById('step2ind').style.background = '#00d4ff';
}

function goStep1() {
  document.getElementById('step2').style.display = 'none';
  document.getElementById('step1').style.display = 'block';
  document.getElementById('step2ind').style.background = 'rgba(255,255,255,0.1)';
}

function checkPasswordStrength(val) {
  const bars = [1,2,3,4].map(i => document.getElementById('sb'+i));
  const label = document.getElementById('strengthLabel');
  bars.forEach(b => b.style.background = 'rgba(255,255,255,0.08)');
  if (!val) { label.textContent = ''; return; }
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ['#ff3b5c','#ffb020','#00d4ff','#00e676'];
  const labels = ['Weak','Fair','Good','Strong'];
  for (let i = 0; i < score; i++) bars[i].style.background = colors[score-1];
  label.style.color = colors[score-1];
  label.textContent = labels[score-1] || '';
}

document.getElementById('toggleRegPass').addEventListener('click', () => {
  const inp = document.getElementById('regPass');
  const eye = document.getElementById('regPassEye');
  if (inp.type === 'password') { inp.type = 'text'; eye.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; eye.className = 'fas fa-eye'; }
});

function doRegister() {
  const firstName = document.getElementById('regFirstName').value.trim();
  const lastName = document.getElementById('regLastName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const confirm = document.getElementById('regPassConfirm').value;
  const agreed = document.getElementById('agreeTerms').checked;
  let valid = true;

  document.getElementById('err-pass').textContent = '';
  document.getElementById('err-confirm').textContent = '';

  if (!pass || pass.length < 8) { document.getElementById('err-pass').textContent = 'Password must be at least 8 characters.'; valid = false; }
  if (pass !== confirm) { document.getElementById('err-confirm').textContent = 'Passwords do not match.'; valid = false; }
  if (!agreed) { alert('You must agree to the Terms of Service.'); valid = false; }
  if (!valid) return;

  const name = `${firstName} ${lastName}`.trim();
  document.getElementById('regBtnText').style.display = 'none';
  document.getElementById('regBtnLoader').style.display = 'inline';
  apiRequest('/user/', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password: pass,
      role: (document.getElementById('regRole').value || 'viewer').toLowerCase()
    })
  })
    .then(() => {
      window.location.href = 'login.html';
    })
    .catch(err => {
      alert(err.message || 'Registration failed.');
    })
    .finally(() => {
      document.getElementById('regBtnText').style.display = 'inline';
      document.getElementById('regBtnLoader').style.display = 'none';
    });
}

window.goStep2 = goStep2;
window.goStep1 = goStep1;
window.checkPasswordStrength = checkPasswordStrength;
window.doRegister = doRegister;
