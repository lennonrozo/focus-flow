# 👨‍💻 Developer Documentation

This guide is for developers who want to understand, modify, or contribute to FocusFlow.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [API Detection Flow](#api-detection-flow)
4. [Text Simplification Flow](#text-simplification-flow)
5. [Caching Strategy](#caching-strategy)
6. [Adding New Features](#adding-new-features)
7. [Customizing Backend](#customizing-backend)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Contributing](#contributing)

---

## Architecture Overview

FocusFlow uses a **client-server architecture** with intelligent fallback:

```
┌─────────────────┐
│  Chrome Browser │
└────────┬────────┘
         │
    ┌────▼────────────────────────────────────┐
    │  Extension (Manifest V3)                │
    │  ┌──────────┐  ┌──────────┐  ┌────────┐│
    │  │ Popup    │  │ Content  │  │ Background  │
    │  │ (UI)     │  │ Script   │  │ (Service │
    │  │          │  │          │  │  Worker) │
    │  └────┬─────┘  └────┬─────┘  └────┬────┘│
    └───────┼─────────────┼──────────────┼─────┘
            │             │              │
            └─────────────┴──────────────┘
                          │
                   ┌──────▼───────┐
                   │  IndexedDB   │ (Client-side cache)
                   │  Cache       │
                   └──────────────┘
                          │
                   ┌──────▼──────────────────┐
                   │  Backend Server (Optional) │
                   │  FastAPI + Uvicorn     │
                   └──────┬─────────────────┘
                          │
                   ┌──────▼──────┐
                   │  In-Memory  │ (Server-side cache)
                   │  Cache      │
                   └─────────────┘
                          │
                   ┌──────▼──────────┐
                   │  Google Gemini  │ (AI simplification)
                   │  API            │
                   └─────────────────┘
                          │
                   ┌──────▼──────┐
                   │  Fallback   │ (Rule-based algorithm)
                   │  Algorithm  │
                   └─────────────┘
```

### Key Components

1. **Popup** (`popup/`): User interface for controlling features
2. **Content Script** (`content/`): Runs on every webpage, applies features
3. **Background Service Worker** (`background.js`): Handles API calls, caching, message routing
4. **Backend Server** (`backend/`): Optional Python server for AI text simplification
5. **Caching Layer**: Two-tier (IndexedDB + in-memory) for instant responses

---

## Project Structure

```
ext/
│
├── manifest.json              # Extension configuration (Manifest V3)
│                              # - Defines permissions
│                              # - Loads scripts
│                              # - Sets icons
│
├── background.js              # Service worker (event-driven)
│                              # - Handles message passing
│                              # - Makes HTTP requests to backend
│                              # - Manages IndexedDB cache
│                              # - Stores/retrieves settings
│
├── popup/                     # Extension popup UI
│   ├── popup.html            # Main interface structure
│   │                         # - Feature toggle switches
│   │                         # - Settings button
│   │                         # - Sliding settings panel
│   │
│   ├── popup.css             # Styling
│   │                         # - White background (#FFFFFF)
│   │                         # - Blue-gray cards (#F0F4F8)
│   │                         # - Dark blue text (#102A43)
│   │                         # - Slate blue accent (#243B53)
│   │
│   └── popup.js              # UI logic
│                             # - testBackendConnection() - API detection
│                             # - triggerPreCache() - starts caching
│                             # - loadSettings() - retrieves saved settings
│                             # - saveSettings() - persists changes
│
├── content/                   # Injected into every webpage
│   ├── content.js            # Feature implementation
│   │                         # AccessibilityManager class:
│   │                         # - applyVisualShift()
│   │                         # - applyHighlighterRuler()
│   │                         # - applyFlashingAnchorBar()
│   │                         # - applyTextSimplifier()
│   │                         #   - detectAPIAvailability()
│   │                         #   - simplifyWithAPI() (batching)
│   │                         #   - simplifyWithFallback() (local)
│   │                         #   - applyFallbackAlgorithm()
│   │                         # - getParagraphs() - intelligent extraction
│   │
│   └── content.css           # Animations and overlays
│                             # - Highlighter ruler styles
│                             # - Anchor bar animations
│                             # - Fade-in effects
│
├── images/                    # Extension icons
│   ├── icon-16.png           # Toolbar icon
│   ├── icon-48.png           # Extension management
│   └── icon-128.png          # Chrome Web Store
│
├── backend/                   # Python FastAPI server
│   ├── main.py               # Server implementation
│   │                         # - /health endpoint
│   │                         # - /api/simplify-batch endpoint
│   │                         # - Gemini API integration
│   │                         # - In-memory caching
│   │                         # - Fallback algorithm
│   │
│   ├── requirements.txt      # Python dependencies
│   │                         # - fastapi
│   │                         # - uvicorn
│   │                         # - google-generativeai
│   │                         # - pydantic
│   │                         # - python-dotenv
│   │
│   ├── .env.example          # Environment template
│   │                         # - GEMINI_API_KEY placeholder
│   │                         # - GEMINI_MODEL config
│   │
│   └── .env                  # Actual config (create this, gitignored)
│                             # - Your real API key
│                             # - Not committed to version control
│
└── Documentation files
    ├── README.md             # Main documentation
    ├── QUICKSTART.md         # Quick reference
    ├── INSTALL.md            # Step-by-step installation
    ├── CHECKLIST.md          # Setup verification
    └── DEVELOPER.md          # This file
```

---

## API Detection Flow

Understanding how the extension detects backend availability:

### On Popup Open

```javascript
// popup/popup.js

async function testBackendConnection() {
  try {
    const response = await fetch("http://localhost:3000/health", {
      method: "GET",
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok; // true if 200-299 status
  } catch (error) {
    console.log("❌ Backend API not available:", error.message);
    return false; // Network error, timeout, or non-OK status
  }
}

async function triggerPreCache() {
  // Step 1: Detect if backend is reachable
  const apiAvailable = await testBackendConnection();
  console.log(
    `🔍 API Detection: ${apiAvailable ? "✅ Available" : "❌ Not Available"}`,
  );

  // Step 2: Send message to content script with API status
  chrome.tabs.sendMessage(tabs[0].id, {
    action: "preCache",
    grade: settings.textSimplifierGrade || 3,
    apiAvailable: apiAvailable, // ← passes detection result
  });
}
```

### In Content Script

```javascript
// content/content.js

// Constructor
constructor() {
  this.apiAvailable = null; // null = unknown, true = available, false = not available
  // ... other initialization
}

// Message listener
setupMessageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'preCache') {
      // Store API availability status from popup
      this.apiAvailable = request.apiAvailable;

      // Start pre-caching (or skip if API not available)
      this.preCacheSimplifications(request.grade, request.apiAvailable);
    }
  });
}

// Pre-cache function
async preCacheSimplifications(grade, apiAvailable) {
  this.apiAvailable = apiAvailable;

  if (!apiAvailable) {
    console.log('🔧 No API - skipping pre-cache (will use fallback when toggled)');
    return; // Exit early, don't batch or send requests
  }

  // Only reaches here if API is available
  // ... batching and caching logic
}
```

### On Feature Toggle

```javascript
// content/content.js

async simplifyAllText() {
  // If API status unknown (user toggled before popup opened)
  if (this.apiAvailable === null) {
    console.log('⚠️ API availability unknown - detecting now...');
    this.apiAvailable = await this.detectAPIAvailability();
  }

  // Route based on detection
  if (this.apiAvailable === true) {
    console.log('📡 Using API with cache (batched requests)');
    await this.simplifyWithAPI(paragraphs);
  } else {
    console.log('🔧 Using fallback algorithm (no API, no batching)');
    await this.simplifyWithFallback(paragraphs);
  }
}

async detectAPIAvailability() {
  try {
    const response = await fetch('http://localhost:3000/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
```

### Decision Tree

```
Popup Opens
    │
    ├─ Fetch /health endpoint (2s timeout)
    │
    ├─ Success (200 OK) ────────► apiAvailable = true
    │                             │
    │                             ├─ Send preCache message
    │                             │
    │                             └─ Content script batches paragraphs
    │                                │
    │                                └─ Sends to background for caching
    │
    └─ Failure (timeout/error) ──► apiAvailable = false
                                    │
                                    ├─ Send preCache message
                                    │
                                    └─ Content script skips pre-cache

User Toggles Feature
    │
    ├─ apiAvailable === null ──► Run detection now
    │                            │
    │                            └─ Set apiAvailable (true/false)
    │
    ├─ apiAvailable === true ───► simplifyWithAPI()
    │                              │
    │                              ├─ Batch 10 paragraphs
    │                              ├─ Send to background
    │                              ├─ Background checks IndexedDB
    │                              ├─ If not cached → POST to backend
    │                              └─ Display results
    │
    └─ apiAvailable === false ──► simplifyWithFallback()
                                   │
                                   ├─ Loop through paragraphs
                                   ├─ Call applyFallbackAlgorithm() each
                                   └─ Display results (no API calls)
```

---

## Text Simplification Flow

### With API (Backend Available)

```javascript
// content/content.js

async simplifyWithAPI(paragraphs) {
  const BATCH_SIZE = 10;
  const grade = this.settings.textSimplifierGrade || 3;

  // Step 1: Batch paragraphs
  const batches = [];
  for (let i = 0; i < paragraphs.length; i += BATCH_SIZE) {
    batches.push(paragraphs.slice(i, i + BATCH_SIZE));
  }

  // Step 2: Process each batch
  for (const batch of batches) {
    // Prepare batch data
    const batchData = batch.map((element, index) => ({
      id: `${Date.now()}_${index}`,
      text: element.textContent.trim(),
      element: element // Keep reference for later
    })).filter(item => item.text.length >= 20);

    if (batchData.length === 0) continue;

    // Step 3: Send to background service worker
    const response = await chrome.runtime.sendMessage({
      action: 'simplifyBatch',
      batch: batchData.map(d => ({ id: d.id, text: d.text })),
      grade: grade,
      pageId: this.pageId
    });

    // Step 4: Apply simplified text to page
    if (response.success && response.results) {
      response.results.forEach(result => {
        const item = batchData.find(d => d.id === result.id);
        if (item && item.element) {
          // Store original for restore later
          if (!item.element.dataset.originalText) {
            item.element.dataset.originalText = item.element.textContent;
          }
          // Replace with simplified text
          item.element.textContent = result.text;
        }
      });
    }
  }
}
```

```javascript
// background.js

async function handleSimplifyBatch(batch, grade, pageId) {
  const results = [];
  const uncachedItems = [];

  // Step 1: Check IndexedDB cache
  for (const item of batch) {
    const cacheKey = generateCacheKey(item.text, grade);
    const cached = await getCacheEntry(cacheKey);

    if (cached) {
      results.push({ id: item.id, text: cached, cached: true });
    } else {
      uncachedItems.push(item);
    }
  }

  // Step 2: If all cached, return immediately
  if (uncachedItems.length === 0) {
    return { success: true, results, allCached: true };
  }

  // Step 3: Call backend for uncached items
  try {
    const response = await fetch(`${BACKEND_URL}/simplify-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batch: uncachedItems.map((item) => ({ id: item.id, text: item.text })),
        grade: grade,
        pageId: pageId,
      }),
    });

    const data = await response.json();

    // Step 4: Cache new results
    for (const result of data.results) {
      const originalItem = uncachedItems.find((i) => i.id === result.id);
      if (originalItem) {
        const cacheKey = generateCacheKey(originalItem.text, grade);
        await setCacheEntry(cacheKey, result.text);
        results.push({ id: result.id, text: result.text, cached: false });
      }
    }

    return { success: true, results };
  } catch (error) {
    // Step 5: Fallback on error
    console.error("Backend error, using fallback:", error);
    for (const item of uncachedItems) {
      const fallbackText = simplifyWithFallback(item.text);
      results.push({ id: item.id, text: fallbackText, fallback: true });
    }
    return { success: true, results };
  }
}
```

```python
# backend/main.py

@app.post("/api/simplify-batch")
async def simplify_batch(request: SimplifyBatchRequest):
    results = []

    for item in request.batch:
        # Step 1: Generate cache key
        cache_key = f"{hashlib.md5(item.text.encode()).hexdigest()}_{request.grade}"

        # Step 2: Check backend cache
        if cache_key in simple_cache:
            results.append(BatchResultItem(
                id=item.id,
                text=simple_cache[cache_key]
            ))
            continue

        # Step 3: Call Gemini API
        if USE_GEMINI:
            try:
                prompt = f"Simplify this text to a Grade {request.grade} reading level: {item.text}"
                response = model.generate_content(prompt)
                simplified = response.text.strip()
            except Exception as e:
                # Fallback on API error
                simplified = fallback_simplify(item.text)
        else:
            simplified = fallback_simplify(item.text)

        # Step 4: Cache result
        simple_cache[cache_key] = simplified

        # Step 5: Add to results
        results.append(BatchResultItem(
            id=item.id,
            text=simplified
        ))

    return SimplifyBatchResponse(
        success=True,
        results=results,
        grade=request.grade,
        latency=time.time() - start_time
    )
```

### Without API (Fallback Mode)

```javascript
// content/content.js

async simplifyWithFallback(paragraphs) {
  // NO batching - process individually
  for (const element of paragraphs) {
    const text = element.textContent.trim();
    if (text.length < 20) continue;

    // Store original
    if (!element.dataset.originalText) {
      element.dataset.originalText = text;
    }

    // Apply local fallback algorithm
    const simplified = this.applyFallbackAlgorithm(text);
    element.textContent = simplified;
  }
}

applyFallbackAlgorithm(text) {
  // Step 1: Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Step 2: Take first 3 sentences (or all if less)
  const condensed = sentences.slice(0, 3).join('. ') + '.';

  // Step 3: Replace complex words
  const wordReplacements = {
    'utilize': 'use',
    'implement': 'use',
    'demonstrate': 'show',
    'facilitate': 'help',
    'approximately': 'about',
    'numerous': 'many',
    'sufficient': 'enough',
    'substantial': 'large',
    'therefore': 'so',
    'however': 'but',
    'additionally': 'also',
    'consequently': 'so'
  };

  let simplified = condensed;
  for (const [complex, simple] of Object.entries(wordReplacements)) {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  }

  return simplified;
}
```

**Key Difference**: Fallback mode has NO:

- Batching (processes one by one)
- API calls (purely local)
- Caching (no need - instant anyway)
- Backend communication (completely offline)

---

## Caching Strategy

### Two-Tier Cache Architecture

```
┌─────────────────────────────────────────┐
│  Content Script (webpage)               │
│  ┌─────────────────────────────────┐    │
│  │ "Example text to simplify"      │    │
│  │ Grade: 3                         │    │
│  └──────────────┬──────────────────┘    │
└─────────────────┼────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Background Service Worker              │
│  ┌─────────────────────────────────┐    │
│  │ IndexedDB Cache (Tier 1)        │    │
│  │ Key: MD5(text) + grade          │    │
│  │ Persistent across sessions      │    │
│  └──────────────┬──────────────────┘    │
└─────────────────┼────────────────────────┘
                  │
                  ├─ Cache HIT ──► Return immediately
                  │
                  └─ Cache MISS
                        │
                        ▼
┌─────────────────────────────────────────┐
│  Backend Server                         │
│  ┌─────────────────────────────────┐    │
│  │ In-Memory Cache (Tier 2)        │    │
│  │ Key: MD5(text) + grade          │    │
│  │ Fast dict lookup                │    │
│  └──────────────┬──────────────────┘    │
└─────────────────┼────────────────────────┘
                  │
                  ├─ Cache HIT ──► Return (also cache in IndexedDB)
                  │
                  └─ Cache MISS
                        │
                        ▼
                  Google Gemini API
                        │
                        ▼
                  Cache in both tiers + return
```

### Cache Key Generation

```javascript
// background.js

function generateCacheKey(text, grade) {
  // MD5 hash of text + grade level
  // Ensures same text at same grade = same cache entry
  const textHash = md5(text.toLowerCase().trim());
  return `${textHash}_grade${grade}`;
}

// Example:
// Text: "The quick brown fox jumps over the lazy dog"
// Grade: 3
// Key: "9e107d9d372bb6826bd81d3542a419d6_grade3"
```

### IndexedDB Operations

```javascript
// background.js

async function getCacheEntry(key) {
  return new Promise((resolve) => {
    const request = indexedDB.open("AccessibilityProDB", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["simplifications"], "readonly");
      const store = transaction.objectStore("simplifications");
      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        resolve(getRequest.result?.text || null);
      };

      getRequest.onerror = () => {
        resolve(null);
      };
    };

    request.onerror = () => {
      resolve(null);
    };
  });
}

async function setCacheEntry(key, text) {
  return new Promise((resolve) => {
    const request = indexedDB.open("FocusFlowDB", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["simplifications"], "readwrite");
      const store = transaction.objectStore("simplifications");

      store.put({
        key: key,
        text: text,
        timestamp: Date.now(),
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    };

    request.onerror = () => resolve();
  });
}
```

### Pre-Caching Strategy

When popup opens, extension pre-caches simplified text BEFORE user toggles the feature:

```javascript
// content/content.js

async preCacheSimplifications(grade, apiAvailable) {
  if (!apiAvailable) return; // Skip if no API

  const paragraphs = this.getParagraphs();

  // Batch into groups of 10
  const batches = [];
  for (let i = 0; i < paragraphs.length; i += 10) {
    batches.push(paragraphs.slice(i, i + 10));
  }

  // Send all batches (fire and forget - no waiting for response)
  for (const batch of batches) {
    const batchData = batch.map((element, index) => ({
      id: `precache_${Date.now()}_${index}`,
      text: element.textContent.trim()
    })).filter(item => item.text.length >= 20);

    if (batchData.length === 0) continue;

    // Async message - doesn't block
    chrome.runtime.sendMessage({
      action: 'preCacheBatch', // Special action - no response needed
      batch: batchData,
      grade: grade,
      pageId: this.pageId
    });
  }

  console.log(`💾 Pre-cache initiated: ${batches.length} batches queued`);
}
```

**Result**: When user toggles Text Simplifier, results are instant (already cached)!

---

## Adding New Features

Follow this pattern to add a new accessibility feature:

### Step 1: Add Default Setting

```javascript
// background.js

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    // ... existing settings
    myNewFeatureEnabled: false, // Toggle state
    myNewFeatureSetting: 50, // Configuration value
  });
});
```

### Step 2: Add UI Controls

```html
<!-- popup/popup.html -->

<!-- Main panel - toggle -->
<div class="feature-toggle">
  <label>
    <input type="checkbox" id="myNewFeatureToggle" />
    <span>My New Feature</span>
  </label>
</div>

<!-- Settings panel - configuration -->
<div class="setting-card">
  <h3>My New Feature</h3>
  <div class="setting-item">
    <label>Setting Value: <span id="mySettingValue">50</span></label>
    <input type="range" id="mySetting" min="10" max="100" value="50" />
  </div>
</div>
```

### Step 3: Add Event Listeners

```javascript
// popup/popup.js

function setupEventListeners() {
  // ... existing listeners

  // Toggle
  document
    .getElementById("myNewFeatureToggle")
    .addEventListener("change", (e) => {
      settings.myNewFeatureEnabled = e.target.checked;
      saveSettings();
    });

  // Slider
  document.getElementById("mySetting").addEventListener("input", (e) => {
    document.getElementById("mySettingValue").textContent = e.target.value;
  });
}

function updateUI() {
  // ... existing UI updates

  document.getElementById("myNewFeatureToggle").checked =
    settings.myNewFeatureEnabled;
  document.getElementById("mySetting").value = settings.myNewFeatureSetting;
  document.getElementById("mySettingValue").textContent =
    settings.myNewFeatureSetting;
}
```

### Step 4: Implement Feature Logic

```javascript
// content/content.js

class AccessibilityManager {
  constructor() {
    // ... existing state
    this.myFeatureActive = false;
    this.myFeatureElement = null;
  }

  applyFeatures() {
    this.applyVisualShift();
    this.applyHighlighterRuler();
    this.applyFlashingAnchorBar();
    this.applyTextSimplifier();
    this.applyMyNewFeature(); // ← Add here
  }

  applyMyNewFeature() {
    if (this.settings.myNewFeatureEnabled && !this.myFeatureActive) {
      // Enable feature
      this.enableMyFeature();
      this.myFeatureActive = true;
      console.log("✅ My New Feature enabled");
    } else if (!this.settings.myNewFeatureEnabled && this.myFeatureActive) {
      // Disable feature
      this.disableMyFeature();
      this.myFeatureActive = false;
      console.log("❌ My New Feature disabled");
    } else if (this.myFeatureActive) {
      // Settings changed while active - update
      this.updateMyFeature();
    }
  }

  enableMyFeature() {
    // Create and apply feature
    this.myFeatureElement = document.createElement("div");
    this.myFeatureElement.id = "my-feature-overlay";
    this.myFeatureElement.style.property = this.settings.myNewFeatureSetting;
    document.body.appendChild(this.myFeatureElement);
  }

  disableMyFeature() {
    // Remove feature
    if (this.myFeatureElement) {
      this.myFeatureElement.remove();
      this.myFeatureElement = null;
    }
  }

  updateMyFeature() {
    // Update existing feature
    if (this.myFeatureElement) {
      this.myFeatureElement.style.property = this.settings.myNewFeatureSetting;
    }
  }
}
```

### Step 5: Add Styling (if needed)

```css
/* content/content.css */

#my-feature-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999998;
  /* ... your styles */
}
```

### Step 6: Save Settings in Popup

```javascript
// popup/popup.js

document.getElementById("saveBtn").addEventListener("click", () => {
  // ... existing settings
  settings.myNewFeatureSetting = parseInt(
    document.getElementById("mySetting").value,
  );

  saveSettings(true);
});
```

**Done!** Your new feature is fully integrated.

---

## Customizing Backend

### Change AI Model

```python
# backend/main.py

# At top of file
MODEL_NAME = "gemini-2.0-flash"  # Options: gemini-pro, gemini-2.0-flash-lite, etc.

# Model is initialized here
model = genai.GenerativeModel(MODEL_NAME)
```

### Add Request Logging

```python
# backend/main.py

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/api/simplify-batch")
async def simplify_batch(request: SimplifyBatchRequest):
    logger.info(f"📝 Batch request: {len(request.batch)} items, Grade {request.grade}")
    # ... rest of function
    logger.info(f"✅ Batch complete: {latency:.2f}s")
```

### Use Redis for Production Caching

```python
# backend/main.py

import redis
import json

# Initialize Redis
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

@app.post("/api/simplify-batch")
async def simplify_batch(request: SimplifyBatchRequest):
    for item in request.batch:
        cache_key = f"{hashlib.md5(item.text.encode()).hexdigest()}_{request.grade}"

        # Check Redis cache
        cached = redis_client.get(cache_key)
        if cached:
            results.append(BatchResultItem(
                id=item.id,
                text=cached
            ))
            continue

        # ... generate simplified text

        # Store in Redis with 24 hour expiry
        redis_client.setex(cache_key, 86400, simplified)

        results.append(BatchResultItem(
            id=item.id,
            text=simplified
        ))

    # ... rest of function
```

### Add Authentication

```python
# backend/main.py

from fastapi import Header, HTTPException
import os

API_SECRET = os.getenv("API_SECRET_KEY", "your-secret-key")

@app.post("/api/simplify-batch")
async def simplify_batch(
    request: SimplifyBatchRequest,
    x_api_key: str = Header(None)
):
    # Verify API key
    if x_api_key != API_SECRET:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )

    # ... rest of function
```

```javascript
// background.js - update callBackendAPI()

async function callBackendAPI(endpoint, data) {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "your-secret-key", // Add authentication header
    },
    body: JSON.stringify(data),
  });

  // ... rest of function
}
```

### Enable CORS for Different Origin

```python
# backend/main.py

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "chrome-extension://your-extension-id",
        "https://your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Deployment

### Deploy Backend to Railway

1. **Create `Procfile`** in `backend/`:

   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Sign up** at [railway.app](https://railway.app)

3. **New Project** → Deploy from GitHub

4. **Select** your repository

5. **Set environment variable**:
   - Go to Variables tab
   - Add `GEMINI_API_KEY` = your key

6. **Deploy** → Railway automatically detects Python

7. **Get URL** from deployment (e.g., `https://your-app.railway.app`)

8. **Update extension**:
   ```javascript
   // background.js
   const BACKEND_URL = "https://your-app.railway.app/api";
   ```

### Deploy to Google Cloud Run

1. **Create `Dockerfile`** in `backend/`:

   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   ENV PORT=8080

   CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
   ```

2. **Build and deploy**:

   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/accessibility-backend
   gcloud run deploy --image gcr.io/PROJECT_ID/accessibility-backend --platform managed
   ```

3. **Set environment variable**:
   ```bash
   gcloud run services update accessibility-backend \
     --set-env-vars GEMINI_API_KEY=your_key
   ```

### Publish Extension to Chrome Web Store

1. **Create ZIP**:

   ```bash
   cd ext
   zip -r ../accessibility-extension.zip * -x "*.git*" -x "*node_modules*"
   ```

2. **Developer Dashboard**: [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)

3. **Pay $5** one-time registration fee

4. **New Item** → Upload ZIP

5. **Fill in details**:
   - Name: FocusFlow
   - Description: (from README)
   - Screenshots: (take 4-5 screenshots)
   - Category: Accessibility
   - Privacy policy: (if collecting data)

6. **Submit for review** (typically 1-3 days)

---

## Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] All 4 features toggle on/off
- [ ] Settings save and persist
- [ ] Visual Shift moves content
- [ ] Highlighter follows mouse
- [ ] Anchor bar blinks
- [ ] Text simplifies (with backend)
- [ ] Fallback works (without backend)
- [ ] Console shows no errors

### Testing Backend Separately

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test simplify endpoint
curl -X POST http://localhost:3000/api/simplify-batch \
  -H "Content-Type: application/json" \
  -d '{
    "batch": [
      {"id": "1", "text": "The quick brown fox jumps over the lazy dog"}
    ],
    "grade": 3,
    "pageId": "test"
  }'
```

### Debugging

**Extension Console** (background.js):

1. Go to `chrome://extensions`
2. Find FocusFlow
3. Click "Inspect views: service worker"
4. Console tab shows background.js logs

**Content Script Console** (content.js):

1. Open any webpage
2. Press F12
3. Console tab shows content.js logs

**Look for emoji indicators**:

- ✅ = Success
- ❌ = Error
- 🔍 = Detection/testing
- 💾 = Caching
- 📡 = API call

---

## Contributing

### Code Style

- Use clear, descriptive variable names
- Add console logs with emoji indicators
- Comment complex logic
- Follow existing patterns

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes
# ...

# Commit
git add .
git commit -m "Add: Description of feature"

# Push
git push origin feature/my-new-feature

# Create pull request on GitHub
```

### Commit Message Format

```
Type: Short description

- Bullet point details
- What changed
- Why it changed

Type can be:
- Add: New feature
- Fix: Bug fix
- Update: Changes to existing feature
- Docs: Documentation only
- Refactor: Code restructure
- Style: Formatting changes
```

---

**Questions?** Open an issue on GitHub or check other documentation files!
