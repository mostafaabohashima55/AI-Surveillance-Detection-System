'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  applyTheme(State.theme);
  applyLang(State.lang);
  bindTopbarActions();
  
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmNewPassword');
  const savedText = document.getElementById('profileSavedText');
  let user = null;

  apiRequest('/user/me')
    .then(res => {
      user = res?.data || res?.user || res;
      if (nameInput) nameInput.value = user?.name || user?.fullName || '';
      if (emailInput) emailInput.value = user?.email || '';
      localStorage.setItem('currentUser', JSON.stringify({
        id: user?.id || user?._id,
        name: user?.name || user?.fullName || '',
        email: user?.email || '',
        role: user?.role || 'viewer'
      }));
      syncCurrentUserUI();
    })
    .catch(err => showToast(err.message || 'Failed to load profile.', 'danger'))
    .finally(() => hideLoader());

  document.getElementById('profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedName = nameInput?.value.trim() || '';
    const updatedEmail = emailInput?.value.trim() || '';
    const inputCurrentPassword = currentPasswordInput?.value || '';
    const newPassword = newPasswordInput?.value || '';
    const confirmPassword = confirmPasswordInput?.value || '';

    if (!updatedName || !updatedEmail || !inputCurrentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all profile fields.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match.', 'danger');
      return;
    }

    const userId = user?.id || user?._id;
    if (!userId) {
      showToast('Unable to update profile: missing user id.', 'danger');
      return;
    }

    apiRequest(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: updatedName,
        email: updatedEmail,
        currentPassword: inputCurrentPassword,
        password: newPassword
      })
    })
      .then(res => {
        const updatedUser = res?.data || res?.user || res;
        localStorage.setItem('currentUser', JSON.stringify({
          id: updatedUser?.id || updatedUser?._id || userId,
          name: updatedUser?.name || updatedName,
          email: updatedUser?.email || updatedEmail,
          role: updatedUser?.role || user?.role || 'viewer'
        }));
        if (savedText) {
          savedText.textContent = State.lang === 'ar' ? 'تم حفظ التغييرات بنجاح.' : 'Changes saved successfully.';
        }
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
        syncCurrentUserUI();
        showToast(State.lang === 'ar' ? 'تم تحديث الملف الشخصي وكلمة المرور.' : 'Profile and password updated successfully.', 'success');
      })
      .catch(err => {
        showToast(err.message || 'Profile update failed.', 'danger');
      });
  });
});
