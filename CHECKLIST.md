# ✓ Setup Checklist

Use this checklist to make sure you've completed all setup steps correctly.

## Prerequisites

- [ ] Google Chrome installed
- [ ] Python 3.8 or newer installed (`python --version`)
- [ ] Git installed (optional, for cloning)

## Extension Installation

- [ ] Repository downloaded/cloned
- [ ] Files extracted to accessible location
- [ ] Chrome opened to `chrome://extensions`
- [ ] Developer mode enabled (toggle in top-right)
- [ ] Extension loaded (Load unpacked → select `ext` folder)
- [ ] Extension appears in extensions list
- [ ] Extension icon visible in toolbar (pin if needed)

## Backend Setup

### API Key

- [ ] Visited [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- [ ] Signed in with Google account
- [ ] Created new API key
- [ ] API key copied and saved safely

### Dependencies

- [ ] Navigated to `backend` folder in terminal
- [ ] Ran `pip install -r requirements.txt`
- [ ] All packages installed successfully
- [ ] No error messages during installation

### Configuration

- [ ] Created `.env` file (copied from `.env.example`)
- [ ] Opened `.env` in text editor
- [ ] Pasted actual API key into `GEMINI_API_KEY=` line
- [ ] Saved `.env` file
- [ ] `.env` file is in `backend` folder (not `ext` folder)

### Server Start

- [ ] Terminal open in `backend` folder
- [ ] Ran `python main.py`
- [ ] Server started without errors
- [ ] See message: "Uvicorn running on http://127.0.0.1:3000"
- [ ] Terminal window still open (minimized)

### Verification

- [ ] Opened browser
- [ ] Visited `http://localhost:3000/health`
- [ ] Saw JSON response with `"status": "healthy"`
- [ ] `"gemini_enabled": true` in response

## Feature Testing

### Basic Tests

- [ ] Opened test webpage (Wikipedia, news site, etc.)
- [ ] Clicked extension icon
- [ ] Popup window opened
- [ ] All 4 feature toggles visible

### Visual Shift

- [ ] Toggled "Visual Shift" ON
- [ ] Page content moved to the right
- [ ] Toggled OFF - content returned to center

### Highlighter Ruler

- [ ] Toggled "Highlighter Ruler" ON
- [ ] Moved mouse around page
- [ ] Area around cursor highlighted (yellow by default)
- [ ] Rest of page dimmed
- [ ] Toggled OFF - full brightness returned

### Flashing Anchor Bar

- [ ] Toggled "Flashing Anchor Bar" ON
- [ ] Red vertical bar appeared on left edge
- [ ] Bar flashes/blinks (opacity changes)
- [ ] Toggled OFF - bar disappeared

### Text Simplifier

- [ ] Backend server running (checked above)
- [ ] Toggled "Text Simplifier" ON
- [ ] Waited 1-2 seconds
- [ ] Text on page became simpler/shorter
- [ ] Refreshed page, toggled ON again
- [ ] Text simplified instantly (cached)
- [ ] Changed grade level in Settings
- [ ] Text updated instantly (pre-cached)

## Settings Panel

- [ ] Clicked "Settings" button in popup
- [ ] Settings panel slid in from right
- [ ] All setting cards visible
- [ ] Adjusted a slider (e.g., Shift Amount)
- [ ] Value displayed changed
- [ ] Clicked "Save Settings"
- [ ] Saw "✓ Settings saved!" message
- [ ] Clicked "Back" button
- [ ] Returned to main panel
- [ ] Setting changes applied to page

## Console Verification (Optional but Recommended)

- [ ] Pressed F12 on test webpage
- [ ] Clicked "Console" tab
- [ ] Toggled Text Simplifier ON
- [ ] Saw messages like:
  - [ ] `🔍 API Detection: ✅ Available`
  - [ ] `💾 Pre-caching X paragraphs...`
  - [ ] `✅ Text Simplifier enabled`
- [ ] No red error messages

## Common Issues Resolved

If you had any issues, check the ones you resolved:

- [ ] Python not in PATH - reinstalled with PATH option
- [ ] Port 3000 in use - changed to different port
- [ ] Dependencies failed - used `--user` flag
- [ ] API key error - created `.env` file correctly
- [ ] Extension not loading - selected correct `ext` folder
- [ ] Features not working - refreshed page after enabling

## Final Verification

**Everything working if:**

- [ ] ✅ Extension icon shows in Chrome toolbar
- [ ] ✅ Popup opens when icon clicked
- [ ] ✅ All 4 features toggle on/off
- [ ] ✅ Backend server running (terminal shows "Uvicorn running")
- [ ] ✅ `/health` endpoint returns JSON
- [ ] ✅ Console shows "API Detection: ✅ Available"
- [ ] ✅ Text simplifies on first toggle (1-2 sec)
- [ ] ✅ Text simplifies instantly on second toggle (cached)

## Daily Startup Checklist

After computer restart, remember to:

- [ ] Open terminal
- [ ] Navigate to backend: `cd path/to/ext/backend`
- [ ] Start server: `python main.py`
- [ ] Minimize terminal
- [ ] Extension ready to use!

---

**All checked? Congratulations! 🎉**

You're all set up. Enjoy easier web browsing with FocusFlow!

**Need help?** See:

- [INSTALL.md](INSTALL.md) - Detailed installation guide
- [README.md](README.md) - Complete documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick reference
