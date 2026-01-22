const DEFAULT_URL = 'https://focusflow-backend-hywd.onrender.com/api';

function $(id){return document.getElementById(id)}

async function load(){
  chrome.storage.sync.get({ backendUrl: DEFAULT_URL }, ({ backendUrl }) => {
    $('backendUrl').value = backendUrl || DEFAULT_URL;
  });
}

function save(){
  const url = $('backendUrl').value.trim();
  if (!url) {
    $('status').textContent = 'Please enter a URL.';
    return;
  }
  // Minimal validation
  try { new URL(url); } catch { $('status').textContent = 'Invalid URL.'; return; }

  $('saveBtn').disabled = true;
  chrome.storage.sync.set({ backendUrl: url }, () => {
    $('status').textContent = 'Saved!';
    $('saveBtn').disabled = false;
    setTimeout(()=> $('status').textContent = '', 2000);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  load();
  $('saveBtn').addEventListener('click', save);
});
