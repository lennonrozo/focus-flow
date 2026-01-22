// Popup JavaScript - Manages UI interactions and settings

let settings = {};

// Load settings on popup open
document.addEventListener('DOMContentLoaded', async () => {
  // Fix logo path dynamically
  const logoImg = document.getElementById('logoImg');
  if (logoImg) {
    logoImg.src = chrome.runtime.getURL('images/icon-48.png');
  }
  
  await loadSettings();
  setupEventListeners();
  
  // Trigger pre-caching when popup opens
  triggerPreCache();
});

// Test if backend API is available
async function testBackendConnection() {
  try {
    const response = await fetch('http://localhost:3000/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    console.log('❌ Backend API not available:', error.message);
    return false;
  }
}

async function triggerPreCache() {
  // First, detect if API is available
  const apiAvailable = await testBackendConnection();
  console.log(`🔍 API Detection: ${apiAvailable ? '✅ Available' : '❌ Not Available'}`);
  
  // Send message to active tab to start pre-caching
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      console.log('🚀 Triggering pre-cache for current page...');
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'preCache',
        grade: settings.textSimplifierGrade || 3,
        apiAvailable: apiAvailable
      }).catch(() => {
        // Ignore if content script not loaded yet
      });
    }
  });
}

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      settings = response;
      updateUI();
      resolve();
    });
  });
}

function updateUI() {
  // Update feature toggles
  document.getElementById('visualShiftToggle').checked = settings.visualShiftEnabled;
  document.getElementById('highlighterRulerToggle').checked = settings.highlighterRulerEnabled;
  document.getElementById('flashingAnchorBarToggle').checked = settings.flashingAnchorBarEnabled;
  document.getElementById('textSimplifierToggle').checked = settings.textSimplifierEnabled;
  
  // Update settings panel values
  document.getElementById('shiftAmount').value = settings.visualShiftAmount;
  document.getElementById('shiftAmountValue').textContent = settings.visualShiftAmount;
  
  document.getElementById('highlightColor').value = settings.highlightColor;
  
  document.getElementById('dimOpacity').value = settings.dimOpacity;
  document.getElementById('dimOpacityValue').textContent = settings.dimOpacity;
  
  document.getElementById('flashInterval').value = settings.flashInterval;
  document.getElementById('flashIntervalValue').textContent = settings.flashInterval;
  
  document.getElementById('barWidth').value = settings.barWidth;
  document.getElementById('barWidthValue').textContent = settings.barWidth;
  
  document.getElementById('readingGrade').value = settings.textSimplifierGrade;
}

function setupEventListeners() {
  // Settings panel toggle
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('mainPanel').classList.add('slide-left');
    document.getElementById('settingsPanel').classList.add('active');
  });
  
  document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('mainPanel').classList.remove('slide-left');
    document.getElementById('settingsPanel').classList.remove('active');
  });
  
  // Feature toggles - instant save
  document.getElementById('visualShiftToggle').addEventListener('change', (e) => {
    settings.visualShiftEnabled = e.target.checked;
    saveSettings();
  });
  
  document.getElementById('highlighterRulerToggle').addEventListener('change', (e) => {
    settings.highlighterRulerEnabled = e.target.checked;
    saveSettings();
  });
  
  document.getElementById('flashingAnchorBarToggle').addEventListener('change', (e) => {
    settings.flashingAnchorBarEnabled = e.target.checked;
    saveSettings();
  });
  
  document.getElementById('textSimplifierToggle').addEventListener('change', (e) => {
    settings.textSimplifierEnabled = e.target.checked;
    saveSettings();
  });
  
  // Settings sliders - live update values
  document.getElementById('shiftAmount').addEventListener('input', (e) => {
    document.getElementById('shiftAmountValue').textContent = e.target.value;
  });
  
  document.getElementById('dimOpacity').addEventListener('input', (e) => {
    document.getElementById('dimOpacityValue').textContent = e.target.value;
  });
  
  document.getElementById('flashInterval').addEventListener('input', (e) => {
    document.getElementById('flashIntervalValue').textContent = e.target.value;
  });
  
  document.getElementById('barWidth').addEventListener('input', (e) => {
    document.getElementById('barWidthValue').textContent = e.target.value;
  });
  
  // Save button
  document.getElementById('saveBtn').addEventListener('click', () => {
    // Gather all settings
    settings.visualShiftAmount = parseInt(document.getElementById('shiftAmount').value);
    settings.highlightColor = document.getElementById('highlightColor').value;
    settings.dimOpacity = parseInt(document.getElementById('dimOpacity').value);
    settings.flashInterval = parseInt(document.getElementById('flashInterval').value);
    settings.barWidth = parseInt(document.getElementById('barWidth').value);
    settings.textSimplifierGrade = parseInt(document.getElementById('readingGrade').value);
    
    saveSettings(true);
  });
}

function saveSettings(showStatus = false) {
  chrome.runtime.sendMessage({ 
    action: 'saveSettings', 
    settings: settings 
  }, (response) => {
    if (response.success && showStatus) {
      const statusEl = document.getElementById('saveStatus');
      statusEl.textContent = '✓ Settings saved!';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 2000);
    }
  });
}
