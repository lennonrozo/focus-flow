# FocusFlow - Web Accessibility Extension for Cancer Survivors

A Chrome browser extension specifically designed for cancer survivors with aphasia and hemineglect. This tool provides 4 powerful accessibility features to make web browsing easier and more comfortable.

## Install

[![Install from Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=google-chrome)](https://chromewebstore.google.com/detail/REPLACE_WITH_EXTENSION_ID)

> Note: The link above is a placeholder until the listing is published.

## 🎬 Demo

### Video Walkthrough

[![FocusFlow Demo](https://img.youtube.com/vi/pWMtSIzZAb4/maxresdefault.jpg)](https://youtu.be/pWMtSIzZAb4)

**📺 [Watch Demo Video](https://youtu.be/pWMtSIzZAb4)**

> 📚 **New to this extension?** Check the [Documentation Index](DOCS_INDEX.md) for guides tailored to your needs:
>
> - 🚀 [Quick Start](QUICKSTART.md) - 10 minute setup
> - 📖 [Installation Guide](INSTALL.md) - Step-by-step with troubleshooting
> - ✓ [Setup Checklist](CHECKLIST.md) - Verify everything works
> - 👨‍💻 [Developer Docs](DEVELOPER.md) - Technical deep dive

## 🎯 Who Is This For?

This extension helps people who experience:

- **Aphasia**: Difficulty understanding or processing complex text
- **Hemineglect**: Tendency to ignore one side of visual field (usually left side)
- **Visual fatigue**: Eye strain from reading centered content
- **Reading comprehension challenges**: Need for simplified language

## ✨ Features

### 1. 👁️ Visual Shift

Moves all webpage content to the right side of your screen, making it easier to see if you have left-side vision challenges.

### 2. 📍 Highlighter Ruler

Creates a spotlight effect that follows your mouse, highlighting only what you're looking at while dimming everything else. Reduces visual clutter and helps you focus.

### 3. 🔴 Flashing Anchor Bar

A vertical red bar on the left edge of your screen that blinks regularly. Helps train your eyes to look at the left side and improves spatial awareness.

### 4. 🤖 AI Text Simplifier

Automatically rewrites complex text into simpler language at your chosen reading level (Grade 2-8). Uses Google's Gemini AI for intelligent, natural simplification.

## 🏗️ How It Works

The extension has two parts:

1. **Chrome Extension** (runs in your browser)
   - Detects when features are turned on/off
   - Applies visual changes to webpages
   - Handles text extraction and display

2. **Backend Server** (optional, runs on your computer)
   - Connects to Google Gemini AI for text simplification
   - Caches results so pages load instantly on repeat visits
   - Falls back to rule-based simplification if AI isn't available

```
Your Browser → Extension → Backend Server → Google Gemini AI
                                ↓
                          Cached Results (stored locally for speed)
```

## 📦 Installation

### Step 1: Download the Extension

1. **Download or clone this repository** to your computer
2. **Unzip the files** if you downloaded a ZIP
3. **Remember the folder location** (you'll need it in Step 2)

### Step 2: Install in Chrome

1. **Open Google Chrome**
2. **Go to Extensions page**:
   - Type `chrome://extensions` in the address bar, OR
   - Click the three dots menu → More Tools → Extensions
3. **Turn on "Developer mode"**:
   - Look for a toggle switch in the top-right corner
   - Click it so it turns blue/on
4. **Click "Load unpacked"** button (appears after enabling Developer mode)
5. **Navigate to and select the `ext` folder** from where you downloaded it
6. **Success!** You should see the FocusFlow icon appear in your browser toolbar

> 💡 **Tip**: Pin the extension to your toolbar by clicking the puzzle piece icon and clicking the pin next to FocusFlow

### Step 3: Backend Setup (Required for AI Text Simplification)

The Text Simplifier feature needs a backend server to connect to Google's AI. Other features work without it.

#### What You Need:

- **Python 3.8 or newer** ([Download Python](https://www.python.org/downloads/))
- **Google Gemini API Key** (free to get - see below)

#### 3A: Get Your Free Gemini API Key

1. **Visit**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the key** (looks like: `AIzaSyD...` - about 40 characters)
5. **Keep it safe** - you'll need it in step 3C

> ⚠️ **Important**: Don't share your API key publicly. It's like a password for the AI service.

#### 3B: Install Python Dependencies

Open your terminal/command prompt and run these commands:

**Windows:**

```bash
cd path\to\ext\backend
python -m pip install -r requirements.txt
```

**Mac/Linux:**

```bash
cd path/to/ext/backend
pip3 install -r requirements.txt
```

This installs:

- `fastapi` - Web server framework
- `uvicorn` - Server runner
- `google-generativeai` - Google's AI library
- `pydantic` - Data validation
- `python-dotenv` - Environment variable handler

**Installation should take 30-60 seconds.**

#### 3C: Add Your API Key

You have two options:

**Option 1: Create a .env file (Recommended - key persists)**

1. **Navigate to the `backend` folder**
2. **Copy `env.example` and rename it to `.env`**
   - Windows: `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`
3. **Open `.env` in any text editor** (Notepad, VS Code, etc.)
4. **Replace `your_gemini_api_key_here` with your actual API key:**
   ```
   GEMINI_API_KEY=example
   ```
5. **Save the file**

**Option 2: Set temporary environment variable**

**Windows (Command Prompt):**

```bash
set GEMINI_API_KEY=example
```

**Windows (PowerShell):**

```bash
$env:GEMINI_API_KEY="example"
```

**Mac/Linux:**

```bash
export GEMINI_API_KEY=example
```

> ⚠️ **Note**: This option requires setting the key every time you open a new terminal.

#### 3D: Start the Backend Server

In your terminal (still in the `backend` folder):

```bash
python main.py
```

**You should see:**

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:3000
```

✅ **Server is running!** Keep this terminal window open while using the extension.

#### 3E: Verify Server is Working

1. **Open your browser**
2. **Go to**: `http://localhost:3000/health`
3. **You should see** something like:
   ```json
   {
     "status": "healthy",
     "model": "gemini-2.0-flash-lite",
     "gemini_enabled": true,
     "cache_size": 0
   }
   ```

If you see this, everything is working! 🎉

### What If I Don't Want to Set Up the Backend?

No problem! Three of the four features work without it:

- ✅ Visual Shift - works
- ✅ Highlighter Ruler - works
- ✅ Flashing Anchor Bar - works
- ⚠️ Text Simplifier - uses basic fallback algorithm (no AI)

The fallback algorithm is simpler but still helpful. It:

- Condenses text to 3 sentences
- Replaces complex words with simpler ones
- Works completely offline

## 🎮 How to Use

### Opening the Extension

1. **Click the FocusFlow icon** in your Chrome toolbar
2. **A popup window opens** with a clean white interface

### The Main Panel

You'll see four toggle switches:

- **☑️ Visual Shift** - Moves content to the right
- **☑️ Highlighter Ruler** - Creates mouse spotlight effect
- **☑️ Flashing Anchor Bar** - Shows blinking red bar on left
- **☑️ Text Simplifier** - Simplifies text to easier reading level

**Just click any toggle to turn features on or off!**

### Customizing Settings

1. **Click the "Settings" button** (bottom of popup)
2. **Settings panel slides in from the right**
3. **Adjust each feature** to your preferences:

**Visual Shift Settings:**

- **Shift Amount**: How far to move content (5-30%)
  - Lower = subtle shift
  - Higher = content moves further right

**Highlighter Ruler Settings:**

- **Highlight Color**: Choose what color highlights the text you're reading
- **Dim Opacity**: How dark the non-highlighted areas become (10-90%)
  - Lower = dimmed areas are lighter
  - Higher = dimmed areas are darker

**Flashing Anchor Bar Settings:**

- **Flash Interval**: How fast the bar blinks (500-3000 milliseconds)
  - Lower = faster blinking
  - Higher = slower blinking
- **Bar Width**: How thick the red bar is (4-20 pixels)

**Text Simplifier Settings:**

- **Reading Grade Level**: 2, 3, 4, 5, 6, or 8
  - Grade 2: Very simple (early elementary)
  - Grade 3-4: Simple (elementary)
  - Grade 5-6: Moderate (middle school)
  - Grade 8: Advanced (high school)

4. **Click "Save Settings"** when done
5. **Click "Back"** to return to main panel

### Tips for Best Experience

- **Start with one feature** at a time to see how each helps
- **Visit a text-heavy website** (like Wikipedia or a news site) to test
- **Adjust settings** until it feels comfortable for you
- **Check the browser console** (press F12) to see what's happening behind the scenes

### Understanding Text Simplifier Behavior

**When Backend is Running (AI Mode):**

- First time you visit a page: Takes 1-2 seconds to simplify
- Return visits to same page: Instant (cached)
- Changing grade levels: Instant (pre-cached)

**When Backend is Off (Fallback Mode):**

- Works on every page immediately
- Uses rule-based simplification (no AI)
- Same speed regardless of visits
- Changing grade levels has no effect (algorithm is same for all grades)

## Performance

### Text Simplifier Metrics:

- **First Request**: 1-2 seconds (Gemini API call)
- **Cached Requests**: < 50ms (instant)
- **Background Batch**: ~10 seconds for all 6 grades
- **API Reduction**: 83% fewer calls after first visit
- **Storage**: ~500 bytes per text per grade

### Example Session:

```
User visits page with 100 text blocks
Grade 3 selected → 100 API calls (first time)
Background batch → 500 more calls (Grades 2,4,5,6,8)

Next visit to same page:
Grade 3 → 0 API calls (all cached!) ⚡
User switches to Grade 5 → 0 API calls (cached from batch!)
```

## 🐛 Troubleshooting

### Extension Not Loading

**Problem**: Extension won't appear or shows error when loading

**Solutions**:

1. **Check all files are present** - Make sure you selected the `ext` folder, not just individual files
2. **Reload the extension**:
   - Go to `chrome://extensions`
   - Find FocusFlow
   - Click the refresh icon (circular arrow)
3. **Check for errors**:
   - Press F12 to open Developer Tools
   - Look at the Console tab for error messages
4. **Try restarting Chrome** completely

### Backend Server Won't Start

**Problem**: `python main.py` gives an error

**Solutions**:

**Error: "python is not recognized"**

- Python is not installed or not in PATH
- Download Python from [python.org](https://www.python.org/downloads/)
- During installation, check "Add Python to PATH"

**Error: "No module named 'fastapi'"**

- Dependencies not installed
- Run: `pip install -r requirements.txt`

**Error: "Port 3000 is already in use"**

- Another program is using port 3000
- **Solution 1**: Find and close the other program
  ```bash
  # Windows - find what's using port 3000
  netstat -ano | findstr :3000
  ```
- **Solution 2**: Change the port
  - Open `main.py`
  - Change line near the end: `uvicorn.run(app, host="0.0.0.0", port=3000)` to `port=3001`
  - Also update `background.js`: change `http://localhost:3000` to `http://localhost:3001`

**Error: "GEMINI_API_KEY not set"**

- This is just a warning - server still runs!
- Backend uses fallback algorithm without API key
- To use AI: Follow Step 3C above to add your API key

### Text Simplifier Not Working

**Problem**: Text doesn't simplify when toggled on

**Check if backend is running**:

1. Open browser and go to `http://localhost:3000/health`
2. If you see JSON response, backend is working
3. If page won't load, backend is not running - see Step 3D above

**Check browser console**:

1. Press F12 on the webpage
2. Click "Console" tab
3. Toggle Text Simplifier on
4. Look for messages:
   - ✅ "API Detection: ✅ Available" = Backend working
   - ❌ "API Detection: ❌ Not Available" = Using fallback mode

**Check for errors**:

- Red error messages in console indicate problems
- Common issue: "Failed to fetch" = Backend not reachable
  - Make sure backend is running
  - Make sure it's on port 3000

### Features Not Applying to Webpage

**Problem**: Toggling features on doesn't change anything

**Solutions**:

1. **Refresh the webpage** after enabling features
2. **Check if content script loaded**:
   - Press F12
   - Look for "✅ AccessibilityManager initialized" in console
   - If missing, reload the page
3. **Some websites block extensions**:
   - Chrome Web Store pages
   - Chrome settings pages
   - Google Docs (has its own overlay)
   - Try on Wikipedia or a news site first

### Visual Shift Doesn't Move Content

**Problem**: Content stays centered even with Visual Shift on

**Reason**: Some websites use fixed positioning that overrides the shift

**Partial Solution**: Increase shift amount in settings (try 25-30%)

### Highlighter Ruler Creates Visual Glitches

**Problem**: Dark overlay flickers or doesn't cover correctly

**Solutions**:

1. Try adjusting **Dim Opacity** to a different value
2. Some websites have complex layouts - may not work perfectly on all sites
3. Disable and re-enable the feature

### Text Changes Back to Original

**Problem**: Simplified text reverts after a few seconds

**Reason**: Website is dynamically loading content

**Solution**: This is expected behavior - new content that loads after simplification will appear in original form. Toggle the feature off and on again to re-simplify.

### Server Stops After Closing Terminal

**Problem**: Backend only works while terminal is open

**This is normal!** The server runs in the terminal and stops when you close it.

**To keep it running**:

- Keep the terminal window open while using the extension
- Minimize the window to keep it running in background

**For advanced users** (run in background):

- Windows: Use `pythonw main.py` or task scheduler
- Mac/Linux: Use `nohup python main.py &`

## ⚙️ For Developers

### Project Structure

```
ext/
├── manifest.json              # Chrome extension configuration
├── background.js              # Service worker (handles API calls, caching)
├── popup/
│   ├── popup.html            # Main UI with sliding settings panel
│   ├── popup.css             # Styling (white background, blue cards)
│   └── popup.js              # UI logic and API detection
├── content/
│   ├── content.js            # All 4 features implementation
│   └── content.css           # Animations and overlays
├── images/
│   ├── icon-16.png           # Extension icons (various sizes)
│   ├── icon-48.png
│   └── icon-128.png
├── backend/
│   ├── main.py               # FastAPI server
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment template
│   └── .env                  # Your API key (create this, not in git)
├── README.md                 # This file
└── QUICKSTART.md             # Quick reference guide
```

### How the Code Works

#### Extension Architecture

**manifest.json**: Defines permissions, background scripts, content scripts

- Uses Manifest V3 (latest Chrome extension format)
- Requests `<all_urls>` permission to work on all websites
- Loads content scripts on every page

**background.js** (Service Worker):

- Manages settings storage (Chrome sync storage)
- Handles messages from popup and content scripts
- Makes API calls to backend server
- Manages IndexedDB cache for simplified text
- Detects if backend is available

**popup/** (User Interface):

- HTML: Main panel with feature toggles + sliding settings panel
- CSS: White background, light blue cards, dark blue text
- JS: Handles toggle changes, saves settings, detects API availability

**content/** (Page Modifications):

- Injected into every webpage
- `AccessibilityManager` class with all 4 features
- Detects API status and routes to AI or fallback
- Extracts paragraphs intelligently (excludes headers, nav, links)

#### Backend Architecture

**main.py** (FastAPI Server):

- `/health` endpoint: Check if server is running
- `/api/simplify-batch` endpoint: Batch text simplification
- Connects to Google Gemini AI when API key present
- Caches results in memory (dict)
- Falls back to rule-based algorithm without API key

**Caching Strategy**:

- Frontend: IndexedDB (persistent across browser sessions)
- Backend: In-memory dictionary (fast but resets on restart)
- Cache key: MD5 hash of text + grade level
- Pre-caching: When popup opens, backend caches all grade levels for instant switching

### Text Simplification Flow

**With API (Backend Running):**

```
1. Popup opens → testBackendConnection() → /health endpoint
2. If successful → apiAvailable = true
3. Extension extracts paragraphs from page
4. Batches 10 paragraphs → sends to background.js
5. Background checks IndexedDB cache
6. If not cached → POST to /api/simplify-batch
7. Backend checks its cache
8. If not cached → calls Gemini API
9. Results flow back: Backend → Background → Content Script
10. Content script replaces original text with simplified
11. Pre-cache triggered for other grade levels
```

**Without API (Fallback Mode):**

```
1. Popup opens → testBackendConnection() → fails/timeout
2. apiAvailable = false
3. Extension extracts paragraphs
4. NO batching, NO API calls
5. For each paragraph: applyFallbackAlgorithm()
   - Condenses to 3 sentences
   - Replaces complex words with simple ones
6. Displays results immediately
```

### Adding New Features

1. **Add setting to default values**:

   ```javascript
   // In background.js, onInstalled listener
   myNewFeatureEnabled: false,
   myNewFeatureSetting: 50
   ```

2. **Add UI controls**:

   ```html
   <!-- In popup/popup.html -->
   <input type="checkbox" id="myNewFeatureToggle" />
   ```

3. **Add method to AccessibilityManager**:

   ```javascript
   // In content/content.js
   applyMyNewFeature() {
     if (this.settings.myNewFeatureEnabled && !this.myFeatureActive) {
       // Enable feature
       this.myFeatureActive = true;
     } else if (!this.settings.myNewFeatureEnabled && this.myFeatureActive) {
       // Disable feature
       this.myFeatureActive = false;
     }
   }
   ```

4. **Call in applyFeatures()**:
   ```javascript
   applyFeatures() {
     this.applyVisualShift();
     this.applyHighlighterRuler();
     this.applyFlashingAnchorBar();
     this.applyTextSimplifier();
     this.applyMyNewFeature(); // Add here
   }
   ```

### Customizing Backend

**Change AI Model**:

```python
# In main.py, top of file
MODEL_NAME = "gemini-2.0-flash"  # Or "gemini-pro", etc.
```

**Add Redis Caching** (for production):

```python
import redis

# Replace simple_cache dict
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# In simplify_batch endpoint
cached = r.get(cache_key)
if cached:
    return json.loads(cached)

# After getting result
r.set(cache_key, json.dumps(result), ex=86400)  # 24 hour expiry
```

**Add Authentication**:

```python
from fastapi import Header, HTTPException

@app.post("/api/simplify-batch")
async def simplify_batch(
    request: SimplifyBatchRequest,
    api_key: str = Header(None, alias="X-API-Key")
):
    if api_key != os.getenv("MY_SECRET_KEY"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    # ... rest of code
```

**Enable CORS for different origin**:

```python
# If deploying backend to different domain
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://your-extension-id"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Deploying Backend to Production

**Option 1: Railway** (Easiest)

1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repo
3. Add `GEMINI_API_KEY` to environment variables
4. Railway auto-detects Python and deploys
5. Update `background.js`: `const BACKEND_URL = "https://your-app.railway.app/api"`

**Option 2: Heroku**

1. Create `Procfile`:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
2. Deploy: `git push heroku main`
3. Set config: `heroku config:set GEMINI_API_KEY=your_key`

**Option 3: Google Cloud Run**

1. Create `Dockerfile`:
   ```dockerfile
   FROM python:3.11
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
   ```
2. Deploy: `gcloud run deploy`

**After deployment**: Update the backend URL in [background.js](background.js) line ~8:

```javascript
const BACKEND_URL = "https://your-deployed-backend.com/api";
```

### Publishing Extension to Chrome Web Store

1. **Create developer account**: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. **Pay one-time $5 fee**
3. **Prepare assets**:
   - Screenshots of extension in action
   - Promotional images (440x280, 920x680, 1400x560)
   - Detailed description
4. **Upload ZIP**: Zip the `ext` folder
5. **Submit for review**: Usually approved in 1-3 days

## 📊 Performance

### Text Simplifier Metrics

| Scenario               | Time        | API Calls           |
| ---------------------- | ----------- | ------------------- |
| First visit (new page) | 1-2 seconds | 4-6 batches         |
| Return to same page    | < 50ms      | 0 (cached)          |
| Change grade level     | < 50ms      | 0 (pre-cached)      |
| Fallback mode          | Instant     | 0 (local algorithm) |

### Optimization Details

- **Paragraph-based processing**: Excludes headers, footers, nav elements, links
- **Batching**: Groups 10 paragraphs per API request (90% reduction in calls)
- **Pre-caching**: When popup opens, caches results before user toggles feature
- **Cache-first**: Always checks cache before making API calls
- **Storage**: ~500 bytes per paragraph per grade level

### Example Load:

Typical news article with 50 paragraphs:

- **Without optimization**: 50 API calls × 5 grades = 250 calls
- **With batching**: 5 batches × 1 call = 5 calls (98% reduction)
- **Subsequent visits**: 0 calls (100% cached)

## ❓ Frequently Asked Questions

**Q: Do I need to keep the terminal open?**
A: Yes, the backend server runs in the terminal. Close the terminal = server stops. Keep it minimized in the background.

**Q: Does this work on all websites?**
A: Most websites, yes. Some sites (Chrome settings, Web Store, Google Docs) block extensions by design.

**Q: Is my data being sent anywhere?**
A: Only if you use the AI text simplifier AND have the backend running. Text is sent to Google Gemini AI for simplification. No other data is transmitted. Other features work entirely locally.

**Q: Can I use this on mobile/phone?**
A: No, this is a Chrome desktop extension only. Chrome on mobile doesn't support extensions.

**Q: How much does the Gemini API cost?**
A: Google offers a generous free tier (15 requests per minute, 1,500 per day). For typical use, this is free. [Check current pricing](https://ai.google.dev/pricing)

**Q: What happens if I run out of API quota?**
A: Extension automatically falls back to rule-based simplification. You'll see a message in the console.

**Q: Can I customize which websites the extension works on?**
A: Currently it's enabled on all sites. To disable on specific sites, toggle features off when visiting those sites.

**Q: The simplified text looks weird/incorrect**
A: AI isn't perfect. Try a different grade level, or use fallback mode. You can also report issues to help improve it.

**Q: Can I run the backend on a different computer?**
A: Yes! Advanced users can deploy the backend to a server and change the URL in `background.js`. See "Deploying Backend to Production" section.

**Q: Is this open source?**
A: Yes! You can modify and improve it. See the Developer section for how the code works.

## 🤝 Contributing

We welcome improvements! Here's how you can help:

1. **Report bugs**: Open an issue describing what went wrong
2. **Suggest features**: Tell us what would help cancer survivors
3. **Improve documentation**: Make the instructions clearer
4. **Submit code**: Fork the repo, make changes, submit pull request

## 📝 License

MIT License - Free to use, modify, and distribute.

## 💙 Credits

Built with care for cancer survivors experiencing aphasia and hemineglect.

**Technology Used:**

- Chrome Extensions API
- Google Gemini AI (2.0 Flash Lite)
- FastAPI (Python web framework)
- IndexedDB (browser storage)

**Designed to improve**:

- Reading comprehension
- Visual field awareness
- Web browsing comfort
- Quality of life

---

## 🆘 Getting Help

**Found a bug?** Check the Troubleshooting section above first.

**Still stuck?** Check the browser console (F12) for error messages - they often explain what's wrong.

**Need more help?** Look for error messages in:

1. Browser console (F12 on webpage)
2. Extension console (chrome://extensions → Details → Inspect views: service worker)
3. Backend terminal (where you ran `python main.py`)

**Console indicators to look for:**

- ✅ Green checkmarks = working correctly
- ❌ Red X = errors
- 🔍 Magnifying glass = detection/testing
- 💾 Floppy disk = caching operations
- 📡 Satellite = API calls

---

**Thank you for using FocusFlow!** We hope this tool makes the web easier to navigate.
