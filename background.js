// Background Service Worker - Manages API calls, caching, and batch processing

// Backend URL - configurable via Options (chrome.storage.sync)
let BACKEND_URL = 'http://localhost:3000/api';

// Initialize backend URL from storage and watch for changes
chrome.storage.sync.get({ backendUrl: BACKEND_URL }, ({ backendUrl }) => {
  BACKEND_URL = backendUrl || BACKEND_URL;
  console.log('🔧 Backend URL set to:', BACKEND_URL);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.backendUrl) {
    BACKEND_URL = changes.backendUrl.newValue || BACKEND_URL;
    console.log('🔄 Backend URL updated to:', BACKEND_URL);
  }
});

// Batch processing tracker
let currentBatch = null;
const ALL_GRADES = [2, 3, 4, 5, 6, 8];

// Initialize default settings
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      visualShiftEnabled: false,
      visualShiftAmount: 15,
      highlighterRulerEnabled: false,
      highlightColor: '#ffc800',
      dimOpacity: 70,
      flashingAnchorBarEnabled: false,
      flashInterval: 1000,
      barWidth: 8,
      textSimplifierEnabled: false,
      textSimplifierGrade: 3
    });
    chrome.runtime.openOptionsPage();
  }
});

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(null, (settings) => {
      sendResponse(settings);
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set(request.settings, () => {
      // Notify all tabs about settings change
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { 
            action: 'settingsUpdated', 
            settings: request.settings 
          }).catch(() => {});
        });
      });
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'simplifyText') {
    // Test backend flow with async call
    console.log('📥 Testing backend flow - Grade', request.grade, 'Text length:', request.text?.length);
    console.log('📝 Text preview:', request.text?.substring(0, 100));
    handleSimplifyText(request)
      .then(result => {
        console.log('✅ Backend response received:', result);
        sendResponse({ 
          success: true, 
          simplifiedText: result.simplifiedText, 
          fromCache: result.fromCache
        });
      })
      .catch(error => {
        console.error('❌ Backend failed, using fallback:', error);
        const simplified = simplifyWithFallback(request.text, request.grade);
        sendResponse({ 
          success: true, 
          simplifiedText: simplified, 
          fromCache: false
        });
      });
    return true; // Async response
  }
  
  if (request.action === 'simplifyBatch') {
    // Handle batch simplification
    console.log('📦 Batch request - Grade', request.grade, 'Items:', request.batch.length);
    handleSimplifyBatch(request)
      .then(results => {
        console.log('✅ Batch response received:', results.length, 'items');
        sendResponse({ 
          success: true, 
          results: results
        });
      })
      .catch(error => {
        console.error('❌ Batch failed, using fallback:', error);
        const results = request.batch.map(item => ({
          id: item.id,
          text: simplifyWithFallback(item.text, request.grade)
        }));
        sendResponse({ 
          success: true, 
          results: results
        });
      });
    return true; // Async response
  }
  
  if (request.action === 'preCacheBatch') {
    // Pre-cache batch in background (no response needed)
    console.log('💾 Pre-cache batch - Grade', request.grade, 'Items:', request.batch.length);
    handlePreCacheBatch(request);
    // No response needed - fire and forget
    return false;
  }
  
  if (request.action === 'checkCache') {
    checkCacheForText(request, sendResponse);
    return true;
  }
});

async function handleSimplifyText(request) {
  console.log('📥 Received simplification request for Grade', request.grade);
  return await simplifyTextWithCache(request.text, request.grade, request.pageId);
}

async function handleSimplifyBatch(request) {
  console.log('📦 Processing batch of', request.batch.length, 'items for Grade', request.grade);
  
  // Check cache first for each item
  const cachedResults = [];
  const uncachedItems = [];
  
  for (const item of request.batch) {
    const cacheKey = generateCacheKey(item.text, request.grade);
    const cached = await getCacheEntry(cacheKey);
    
    if (cached) {
      cachedResults.push({ id: item.id, text: cached, fromCache: true });
    } else {
      uncachedItems.push(item);
    }
  }
  
  console.log(`💾 Cache hits: ${cachedResults.length}, Cache misses: ${uncachedItems.length}`);
  
  // If all cached, return immediately
  if (uncachedItems.length === 0) {
    return cachedResults;
  }
  
  // Process uncached items through backend
  try {
    const response = await fetch(`${BACKEND_URL}/simplify-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        batch: uncachedItems, 
        grade: request.grade,
        pageId: request.pageId
      })
    });
    
    console.log(`📡 Backend batch responded with status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('💾 Batch results:', data.results.length);
    
    // Cache the new results
    for (let i = 0; i < uncachedItems.length; i++) {
      const cacheKey = generateCacheKey(uncachedItems[i].text, request.grade);
      await setCacheEntry(cacheKey, data.results[i].text);
    }
    
    // Combine cached and new results
    return [...cachedResults, ...data.results];
  } catch (error) {
    console.error('❌ Backend batch failed - using local fallback:', error);
    // Fallback: simplify each uncached item locally
    const fallbackResults = uncachedItems.map(item => ({
      id: item.id,
      text: simplifyWithFallback(item.text, request.grade)
    }));
    return [...cachedResults, ...fallbackResults];
  }
}

async function handlePreCacheBatch(request) {
  console.log('💾 Pre-caching batch of', request.batch.length, 'items for Grade', request.grade);
  
  // Process batch and cache results (no need to return anything)
  try {
    const response = await fetch(`${BACKEND_URL}/simplify-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        batch: request.batch, 
        grade: request.grade,
        pageId: request.pageId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache all results
    for (let i = 0; i < request.batch.length; i++) {
      const cacheKey = generateCacheKey(request.batch[i].text, request.grade);
      await setCacheEntry(cacheKey, data.results[i].text);
    }
    
    console.log(`✅ Pre-cached ${data.results.length} items for Grade ${request.grade}`);
  } catch (error) {
    console.error('❌ Pre-cache failed:', error);
    // Silent fail - user hasn't requested simplification yet
  }
}

async function simplifyTextWithCache(text, grade, pageId) {
  const cacheKey = generateCacheKey(text, grade);
  
  // Check IndexedDB cache
  console.log(`🔍 Checking cache for Grade ${grade}...`);
  const cached = await getCacheEntry(cacheKey);
  
  if (cached) {
    console.log(`💾 Cache HIT (Grade ${grade})`);
    return { simplifiedText: cached, fromCache: true };
  }
  
  // Cache miss - call backend
  console.log(`📡 Cache MISS - calling backend (Grade ${grade})`);
  const simplified = await callBackendAPI(text, grade, pageId);
  
  // Store in cache
  await setCacheEntry(cacheKey, simplified);
  
  return { simplifiedText: simplified, fromCache: false };
}

async function triggerBatchPrecompute(text, completedGrade, pageId) {
  console.log(`🔄 Starting batch precompute (excluding Grade ${completedGrade})`);
  
  const remainingGrades = ALL_GRADES.filter(g => g !== completedGrade);
  
  currentBatch = {
    text,
    pageId,
    grades: remainingGrades,
    cancelled: false
  };
  
  for (const grade of remainingGrades) {
    if (currentBatch.cancelled) {
      console.log(`⏭️ Batch cancelled`);
      break;
    }
    
    const cacheKey = generateCacheKey(text, grade);
    const cached = await getCacheEntry(cacheKey);
    
    if (cached) {
      console.log(`💾 Grade ${grade} already cached - skipping`);
      continue;
    }
    
    // Call backend and cache
    try {
      console.log(`📤 Batch: processing Grade ${grade}`);
      const simplified = await callBackendAPI(text, grade, pageId);
      await setCacheEntry(cacheKey, simplified);
      console.log(`✅ Batch: cached Grade ${grade}`);
      
      // Delay between requests (rate limiting)
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`❌ Batch failed for Grade ${grade}:`, error);
    }
  }
  
  if (!currentBatch.cancelled) {
    console.log(`✅ Batch complete - all ${ALL_GRADES.length} grades cached`);
  }
  currentBatch = null;
}

async function callBackendAPI(text, grade, pageId) {
  console.log(`🔗 Calling backend API: ${BACKEND_URL}/simplify`);
  try {
    const response = await fetch(`${BACKEND_URL}/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, grade, pageId })
    });
    
    console.log(`📡 Backend responded with status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('💾 Backend data:', data);
    return data.simplifiedText;
  } catch (error) {
    console.error('❌ Backend API failed - using local fallback:', error);
    // Fallback: use local simplification algorithm
    return simplifyWithFallback(text, grade);
  }
}

// Local fallback algorithm (rule-based simplification)
function simplifyWithFallback(text, grade) {
  console.log('🔧 Using local fallback algorithm - condensing to 3 sentences');
  
  // Split into sentences
  let sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  sentences = sentences.map(s => s.trim()).filter(s => s.length > 0);
  
  // If already 3 or fewer sentences, just simplify words
  if (sentences.length <= 3) {
    return simplifySentences(sentences, grade).join(' ');
  }
  
  // Extract key sentences: first, middle, and last (most important info)
  const keyIndices = [
    0, // First sentence (intro/context)
    Math.floor(sentences.length / 2), // Middle sentence (main point)
    sentences.length - 1 // Last sentence (conclusion)
  ];
  
  const keySentences = keyIndices.map(i => sentences[i]);
  
  // Simplify and return
  return simplifySentences(keySentences, grade).join(' ');
}

function simplifySentences(sentences, grade) {
  const replacements = {
    // Complex to simple words
    'utilize': 'use',
    'implement': 'do',
    'facilitate': 'help',
    'demonstrate': 'show',
    'approximately': 'about',
    'consequently': 'so',
    'furthermore': 'also',
    'nevertheless': 'but',
    'therefore': 'so',
    'regarding': 'about',
    'concerning': 'about',
    'subsequently': 'later',
    'additionally': 'also',
    'numerous': 'many',
    'purchase': 'buy',
    'acquire': 'get',
    'commence': 'start',
    'terminate': 'end',
    'possess': 'have',
    'require': 'need',
    'however': 'but',
    'although': 'but',
    'because': 'since'
  };
  
  return sentences.map(sentence => {
    let simplified = sentence;
    
    // Apply word replacements
    for (const [complex, simple] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    }
    
    // Remove parenthetical phrases
    simplified = simplified.replace(/\([^)]+\)/g, '');
    
    // Remove quotes
    simplified = simplified.replace(/["']/g, '');
    
    if (grade <= 4) {
      // Remove adverbs ending in -ly
      simplified = simplified.replace(/\b\w+ly\b/g, '');
    }
    
    // Clean up multiple spaces
    simplified = simplified.replace(/\s+/g, ' ');
    simplified = simplified.replace(/\s+([.,!?])/g, '$1');
    
    return simplified.trim();
  });
}

// IndexedDB cache functions
function generateCacheKey(text, grade) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  return `${Math.abs(hash).toString(36)}_g${grade}`;
}

async function getCacheEntry(key) {
  return new Promise((resolve) => {
    const request = indexedDB.open('FocusFlowCache', 1);
    
    request.onerror = () => resolve(null);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('simplifications')) {
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(['simplifications'], 'readonly');
      const store = transaction.objectStore('simplifications');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result ? result.text : null);
      };
      
      getRequest.onerror = () => resolve(null);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('simplifications')) {
        db.createObjectStore('simplifications', { keyPath: 'key' });
      }
    };
  });
}

async function setCacheEntry(key, text) {
  return new Promise((resolve) => {
    const request = indexedDB.open('FocusFlowCache', 1);
    
    request.onerror = () => resolve(false);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['simplifications'], 'readwrite');
      const store = transaction.objectStore('simplifications');
      
      store.put({ key, text, timestamp: Date.now() });
      
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('simplifications')) {
        db.createObjectStore('simplifications', { keyPath: 'key' });
      }
    };
  });
}

async function checkCacheForText(request, sendResponse) {
  const cacheKey = generateCacheKey(request.text, request.grade);
  const cached = await getCacheEntry(cacheKey);
  sendResponse({ cached: !!cached });
}
