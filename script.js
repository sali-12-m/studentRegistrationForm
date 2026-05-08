
'use strict';

/* ─── State ─── */
let currentStep = 1;

/* ─── Utility helpers ─── */
function val(id) {
  return document.getElementById(id).value.trim();
}

function el(id) {
  return document.getElementById(id);
}

/* ─── Error display ─── */
function setError(errorId, show) {
  const fieldId = errorId.replace('e-', 'f-');
  const field = el(fieldId);
  const errorEl = el(errorId);
  if (field) field.classList.toggle('error', show);
  if (errorEl) errorEl.style.display = show ? 'block' : 'none';
}

/* ─── Individual validators ─── */
function require(fieldId, errorId) {
  const empty = !val(fieldId);
  setError(errorId, empty);
  return !empty;
}

function requireEmail(fieldId, errorId) {
  const v = val(fieldId);
  const invalid = !v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  setError(errorId, invalid);
  return !invalid;
}

function requireUsername(fieldId, errorId) {
  const v = val(fieldId);
  const invalid = !v || v.length < 5 || !/^\w+$/.test(v);
  setError(errorId, invalid);
  return !invalid;
}

function requirePw(fieldId, errorId) {
  const invalid = val(fieldId).length < 8;
  setError(errorId, invalid);
  return !invalid;
}

function requirePwMatch(fieldId1, fieldId2, errorId) {
  const mismatch = val(fieldId1) !== val(fieldId2);
  const field2 = el(fieldId2);
  const errorEl = el(errorId);
  if (field2) field2.classList.toggle('error', mismatch);
  if (errorEl) errorEl.style.display = mismatch ? 'block' : 'none';
  return !mismatch;
}

function requireAgree(fieldId, errorId) {
  const checked = el(fieldId).checked;
  el(errorId).style.display = checked ? 'none' : 'block';
  return checked;
}

/* ─── Step validators ─── */
const validators = {
  1: () => {
    let ok = true;
    ok = require('f-fname', 'e-fname') && ok;
    ok = require('f-lname', 'e-lname') && ok;
    ok = require('f-dob',   'e-dob')   && ok;
    ok = requireEmail('f-email', 'e-email') && ok;
    return ok;
  },
  2: () => {
    let ok = true;
    ok = require('f-faculty', 'e-faculty') && ok;
    ok = require('f-degree',  'e-degree')  && ok;
    ok = require('f-year',    'e-year')    && ok;
    return ok;
  },
  3: () => {
    let ok = true;
    ok = requireUsername('f-username', 'e-username') && ok;
    ok = requirePw('f-pw', 'e-pw') && ok;
    ok = requirePwMatch('f-pw', 'f-pw2', 'e-pw2') && ok;
    ok = requireAgree('f-agree', 'e-agree') && ok;
    return ok;
  }
};

/* ─── Navigation ─── */
function goNext(step) {
  if (!validators[step]()) {
    showToast('Please fix the highlighted fields.', true);
    return;
  }
  showPanel(step + 1);
}

function goBack(step) {
  showPanel(step - 1);
}

function showPanel(n) {
  // Hide all panels
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  el('panel-' + n).classList.add('active');
  currentStep = n;

  // Update progress indicators
  [1, 2, 3].forEach(i => {
    const stepItem = el('si-' + i);
    stepItem.classList.remove('active', 'done');
    if (i < n) stepItem.classList.add('done');
    else if (i === n) stepItem.classList.add('active');

    if (i <= 2) {
      el('sl-' + i).classList.toggle('done', i < n);
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Photo preview ─── */
function handlePhoto(input) {
  if (!input.files || !input.files[0]) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = el('photo-preview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    el('photo-circle').querySelector('svg').style.display = 'none';
  };
  reader.readAsDataURL(input.files[0]);
}

/* ─── File drop label ─── */
function handleFile(input, dropId, nameId) {
  if (!input.files || !input.files[0]) return;

  const fileName = input.files[0].name;
  const nameEl = el(nameId);
  nameEl.textContent = fileName;
  nameEl.style.display = 'block';

  const dropEl = el(dropId);
  dropEl.querySelector('p').style.display = 'none';
  dropEl.querySelector('svg').style.display = 'none';
}

/* ─── Form submission ─── */
function submitForm() {
  if (!validators[3]()) {
    showToast('Please fix the highlighted fields.', true);
    return;
  }

  // Generate a reference number
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const ref  = `REF-${year}-${rand}`;

  el('ref-id').textContent = ref;

  // Hide all step panels and progress
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('.progress-track').style.opacity = '0.3';

  // Show success screen
  el('panel-success').style.display = 'flex';

  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Registration submitted successfully!');
}

/* ─── Reset form ─── */
function resetForm() {
  // Clear text inputs
  document.querySelectorAll('input:not([type=file]):not([type=checkbox])').forEach(i => {
    i.value = '';
  });

  // Reset selects
  document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);

  // Clear textareas
  document.querySelectorAll('textarea').forEach(t => t.value = '');

  // Uncheck agreement
  el('f-agree').checked = false;

  // Reset photo
  el('photo-preview').style.display = 'none';
  el('photo-circle').querySelector('svg').style.display = '';

  // Restore progress bar opacity
  document.querySelector('.progress-track').style.opacity = '1';

  // Hide success panel and go back to step 1
  el('panel-success').style.display = 'none';
  showPanel(1);
}

/* ─── Toast notifications ─── */
let toastTimer;

function showToast(message, isError = false) {
  const toast = el('toast');
  el('toast-msg').textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ─── Clear field errors on user input ─── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
      const errorId = 'e-' + field.id.replace('f-', '');
      const errorEl = document.getElementById(errorId);
      if (errorEl) errorEl.style.display = 'none';
    });
  });
});
