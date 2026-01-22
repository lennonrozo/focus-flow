const DEFAULT_URL = 'https://focusflow-backend.onrender.com/api';

function $(id){return document.getElementById(id)}

function load(){
  const saved = localStorage.getItem('backendUrl');
  $('backendUrl').value = saved || DEFAULT_URL;
}

function save(){
  const url = $('backendUrl').value.trim();
  try { new URL(url); } catch { setStatus('Invalid URL'); return; }
  localStorage.setItem('backendUrl', url);
  setStatus('Saved!');
}

async function simplify(){
  const base = $('backendUrl').value.trim() || DEFAULT_URL;
  const grade = parseInt($('grade').value, 10);
  const text = $('inputText').value.trim();
  if(!text){ setStatus('Please enter text.'); return; }

  setStatus('Simplifying...');
  $('simplifyBtn').disabled = true;

  try {
    const res = await fetch(`${base}/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, grade })
    });

    if(!res.ok){
      throw new Error(`Backend error: ${res.status}`);
    }
    const data = await res.json();
    $('outputText').value = data.simplifiedText || '';
    setStatus('Done.');
  } catch (err) {
    console.error(err);
    setStatus('Failed. Check backend URL/CORS/availability.');
  } finally {
    $('simplifyBtn').disabled = false;
  }
}

function setStatus(msg){ $('status').textContent = msg; }

window.addEventListener('DOMContentLoaded', () => {
  load();
  $('saveSettings').addEventListener('click', save);
  $('simplifyBtn').addEventListener('click', simplify);
});
