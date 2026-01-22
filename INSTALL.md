# 📦 Installation Guide - Step by Step

This guide walks you through installing FocusFlow with detailed explanations for each step.

**Total Time**: About 10-15 minutes  
**Difficulty**: Beginner-friendly

---

## Part 1: Installing the Chrome Extension

### Step 1: Download the Code

**Option A: Download ZIP**

1. Click the green **"Code"** button at the top of this page
2. Select **"Download ZIP"**
3. Save the ZIP file to your Downloads folder
4. Right-click the ZIP file → **"Extract All"**
5. Choose a location you'll remember (like `Documents\FocusFlow`)

**Option B: Clone with Git** (if you know Git)

```bash
git clone https://github.com/yourusername/accessibility-extension.git
cd accessibility-extension
```

### Step 2: Open Chrome Extensions Page

1. **Open Google Chrome**
2. **Method 1**: Type this in the address bar:

   ```
   chrome://extensions
   ```

   Press Enter

   **Method 2**: Or use the menu:
   - Click the three dots (⋮) in the top-right corner
   - Hover over **"More tools"**
   - Click **"Extensions"**

You should now see a page titled "Extensions" with a list of your installed extensions.

### Step 3: Enable Developer Mode

1. Look at the **top-right corner** of the Extensions page
2. Find the toggle switch labeled **"Developer mode"**
3. **Click it** so it turns blue/on

You should now see three new buttons appear: "Load unpacked", "Pack extension", and "Update"

### Step 4: Load the Extension

1. Click the **"Load unpacked"** button (appeared in Step 3)
2. A file browser window opens
3. **Navigate to** where you extracted the files
4. **Select the `ext` folder** (not the parent folder, specifically the `ext` folder inside)
5. Click **"Select Folder"** or **"Open"**

**Success!** You should see a new card appear with:

- FocusFlow logo
- Title: "FocusFlow"
- Status: "Enabled"
- A toggle switch (should be ON/blue)

### Step 5: Pin the Extension (Optional but Recommended)

1. Look at your Chrome toolbar (top-right, near the address bar)
2. Click the **puzzle piece icon** (Extensions)
3. Find **FocusFlow** in the list
4. Click the **pin icon** next to it

The FocusFlow icon will now always be visible in your toolbar!

### ✅ Extension Installed!

You can now use 3 of the 4 features:

- ✅ Visual Shift
- ✅ Highlighter Ruler
- ✅ Flashing Anchor Bar
- ⚠️ Text Simplifier (needs backend - see Part 2)

**Test it now:**

1. Visit any webpage (try [Wikipedia](https://en.wikipedia.org))
2. Click the FocusFlow icon
3. Toggle "Visual Shift" on
4. The page should move to the right!

---

## Part 2: Setting Up the Backend (For AI Text Simplification)

**Skip this section if you only want the visual features!**

The Text Simplifier needs a Python backend server to connect to Google's AI. Don't worry - it runs on your own computer, not in the cloud.

### Step 1: Install Python

**Check if you already have Python:**

Open a terminal/command prompt:

- **Windows**: Press `Win+R`, type `cmd`, press Enter
- **Mac**: Press `Cmd+Space`, type `terminal`, press Enter

Type this command:

```bash
python --version
```

**If you see**: `Python 3.8.x` or higher → **You're good! Skip to Step 2**

**If you see**: Error or version below 3.8 → **Install Python:**

1. Go to **[python.org/downloads](https://www.python.org/downloads/)**
2. Click the big yellow **"Download Python 3.x.x"** button
3. **Run the installer**
4. ⚠️ **IMPORTANT**: Check the box **"Add Python to PATH"** before clicking Install
5. Click **"Install Now"**
6. Wait for installation to complete
7. Click **"Close"**

**Verify installation:**

- Open a **NEW** terminal window (close old one)
- Type: `python --version`
- Should now show Python 3.x.x ✅

### Step 2: Get a Google Gemini API Key

This is **free** for personal use (generous limits).

1. **Go to**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

2. **Sign in** with your Google account (Gmail)

3. You'll see "Get API key" page
   - Click **"Create API key"**
   - Choose **"Create API key in new project"** (easiest)

4. **Copy the key** that appears
   - It looks like: `AIzaSyD1234567890abcdefghijklmnopqrstuvwx`
   - About 40 characters long
   - Starts with `AIza`

5. **Save it somewhere safe** (you'll paste it in Step 4)

⚠️ **Keep your API key private!** Don't share it online or commit it to GitHub.

### Step 3: Install Backend Dependencies

Open your terminal and navigate to the backend folder:

**Windows:**

```bash
cd C:\Users\YourName\Documents\FocusFlow\ext\backend
```

**Mac/Linux:**

```bash
cd ~/Documents/FocusFlow/ext/backend
```

Now install the required Python packages:

```bash
pip install -r requirements.txt
```

**This will install:**

- `fastapi` - Web framework
- `uvicorn` - Web server
- `google-generativeai` - Google AI library
- `pydantic` - Data validation
- `python-dotenv` - Environment variables

**You should see:**

```
Successfully installed fastapi-0.115.5 uvicorn-0.32.0 ...
```

This takes about 30-60 seconds.

### Step 4: Configure Your API Key

You need to create a `.env` file with your API key.

**Windows (Command Prompt):**

```bash
copy .env.example .env
notepad .env
```

**Windows (PowerShell):**

```bash
Copy-Item .env.example .env
notepad .env
```

**Mac/Linux:**

```bash
cp .env.example .env
nano .env
```

**In the text editor that opens:**

1. Find the line:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. Replace `your_gemini_api_key_here` with your **actual API key** from Step 2:

   ```
   GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwx
   ```

3. **Save the file**:
   - Notepad: File → Save → Close
   - Nano: Press `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Start the Backend Server

In your terminal (still in the `backend` folder):

```bash
python main.py
```

**You should see something like:**

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:3000 (Press CTRL+C to quit)
```

✅ **Server is running!**

⚠️ **Keep this terminal window open!** If you close it, the server stops.

**Minimize the window** to keep it running in the background.

### Step 6: Verify Everything Works

1. **Open your web browser**
2. **Go to**: `http://localhost:3000/health`
3. **You should see:**
   ```json
   {
     "status": "healthy",
     "model": "gemini-2.0-flash-lite",
     "gemini_enabled": true,
     "cache_size": 0
   }
   ```

If you see this JSON, **everything is working perfectly!** 🎉

### ✅ Backend Installed!

Now all 4 features work:

- ✅ Visual Shift
- ✅ Highlighter Ruler
- ✅ Flashing Anchor Bar
- ✅ Text Simplifier (AI-powered!)

---

## Part 3: Test Everything

### Quick Test

1. **Visit a text-heavy webpage**:
   - [Wikipedia Article](https://en.wikipedia.org/wiki/Aphasia)
   - [BBC News](https://www.bbc.com/news)
   - Any news article or blog post

2. **Click the FocusFlow icon** in your toolbar

3. **Toggle all features ON**:
   - ☑️ Visual Shift → Page moves right
   - ☑️ Highlighter Ruler → Move your mouse around!
   - ☑️ Flashing Anchor Bar → Red bar blinks on left side
   - ☑️ Text Simplifier → Wait 1-2 seconds, text becomes simpler

4. **Open Developer Console** to see what's happening:
   - Press **F12**
   - Click **"Console"** tab
   - You should see messages like:
     ```
     🔍 API Detection: ✅ Available
     💾 Pre-caching 47 paragraphs for Grade 3 using API...
     ✅ Text Simplifier enabled
     ```

### Detailed Feature Testing

**Visual Shift:**

- Text should move to the right side of screen
- Click Settings → Adjust "Shift Amount" → Click Save
- Try values from 5% to 30%

**Highlighter Ruler:**

- Move your mouse around the page
- Area around cursor should be highlighted (yellow by default)
- Everything else should be dimmed
- Click Settings → Change "Highlight Color" → Try different colors

**Flashing Anchor Bar:**

- Look at the left edge of the screen
- You should see a red vertical bar
- It should flash/blink (opacity changes)
- Click Settings → Adjust "Flash Interval" → Make it faster/slower

**Text Simplifier:**

- First time: Takes 1-2 seconds
- Text rewrites in simpler language
- Refresh the page → Enable again → **Instant!** (cached)
- Click Settings → Change "Reading Grade" to 2 → **Instant!** (pre-cached)

---

## Troubleshooting Installation Issues

### Extension Won't Load

**Error: "Manifest file is missing or unreadable"**

- You selected the wrong folder
- Make sure you select the `ext` folder specifically
- Inside `ext` there should be `manifest.json`

**Error: "Failed to load extension"**

- Check the error message for details
- Usually a file is missing or corrupted
- Try re-downloading the extension

**Extension icon doesn't appear**

- Go to chrome://extensions
- Make sure the toggle next to FocusFlow is **ON** (blue)
- Click the refresh icon (circular arrow) on the extension card

### Python Installation Issues

**Command "python" not found**

- Python not installed or not in PATH
- Re-install Python, make sure to check "Add Python to PATH"
- Or try `python3` instead of `python`

**Permission errors during pip install**

- Try: `pip install --user -r requirements.txt`
- Or run terminal as Administrator (Windows) / with sudo (Mac/Linux)

### Backend Won't Start

**Error: "No module named 'fastapi'"**

- Dependencies didn't install
- Make sure you're in the `backend` folder
- Run again: `pip install -r requirements.txt`

**Error: "Address already in use" or "Port 3000 is already in use"**

- Another program is using port 3000
- **Option 1**: Find and close the other program
- **Option 2**: Change the port:
  1. Open `main.py` in a text editor
  2. Find the last line: `uvicorn.run(app, host="0.0.0.0", port=3000)`
  3. Change to: `port=3001`
  4. Also update `background.js` - change `http://localhost:3000` to `http://localhost:3001`

**Error: "GEMINI_API_KEY not set"**

- This is just a warning - server still starts!
- But text simplifier will use basic fallback instead of AI
- To fix: Follow Step 4 above to add your API key

### Backend Runs But Extension Can't Connect

**Console shows: "Backend API not available"**

1. **Verify backend is actually running:**
   - Check terminal - should show "Uvicorn running on..."
   - Visit http://localhost:3000/health in browser

2. **Check the port number matches:**
   - Backend runs on port 3000 by default
   - `background.js` should have `http://localhost:3000`
   - Both must match!

3. **Firewall might be blocking:**
   - Windows: Allow Python through firewall when prompted
   - Mac: System Preferences → Security → Allow

4. **Try reloading the extension:**
   - Go to chrome://extensions
   - Click refresh icon on FocusFlow card

### Text Simplifier Doesn't Simplify

**No changes to text when toggled:**

1. **Make sure backend is running** (Step 5)
2. **Check console** (F12) for errors
3. **Refresh the page** after enabling
4. **Check the website** - some sites block modifications
5. **Test on Wikipedia** first - known to work

**Text simplifies but results are weird:**

- AI isn't perfect - try different grade levels
- Some text is hard to simplify automatically
- Very technical content may not simplify well

---

## Next Steps

✅ **Installation complete!** Here's what to do next:

1. **Customize settings** - Click Settings in the popup to adjust everything
2. **Test on different websites** - See what works best for you
3. **Read the [README.md](README.md)** - Learn all the features in detail
4. **Remember to start the backend** - Run `python main.py` each time you restart your computer

## Daily Usage

**Every time you restart your computer:**

1. Open terminal
2. Navigate to backend folder: `cd path/to/ext/backend`
3. Start server: `python main.py`
4. Minimize terminal, leave it running
5. Use Chrome normally - extension is always ready!

**To stop the backend:**

- Go to the terminal window
- Press `Ctrl+C`

---

## Getting Help

If you're still stuck:

1. **Check [README.md](README.md)** - Detailed troubleshooting section
2. **Check [QUICKSTART.md](QUICKSTART.md)** - Quick reference
3. **Look at console errors** (F12) - Often explains the problem
4. **Check terminal errors** - Where you ran `python main.py`

**Common console indicators:**

- ✅ Green checkmark = Working
- ❌ Red X = Error
- ⚠️ Warning triangle = Non-critical issue

---

**Welcome to FocusFlow!** We hope this makes web browsing easier and more comfortable. 💙
