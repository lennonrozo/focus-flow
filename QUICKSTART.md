# ⚡ Quick Start Guide - Get Running in 10 Minutes

This guide gets you up and running fast. For detailed explanations, see [README.md](README.md).

## 📋 What You'll Need

- ✅ Google Chrome browser
- ✅ Python 3.8 or newer ([Download here](https://www.python.org/downloads/))
- ✅ Google Gemini API key ([Get free key here](https://aistudio.google.com/app/apikey))
- ✅ 10 minutes

## 🎯 Step 1: Install Extension (2 minutes)

1. **Download this repository** (green "Code" button → Download ZIP)
2. **Unzip** to a folder you can find
3. **Open Chrome** and type: `chrome://extensions`
4. **Turn on "Developer mode"** (toggle in top-right)
5. **Click "Load unpacked"** → Select the `ext` folder
6. **Done!** Extension icon appears in toolbar

## 🔧 Step 2: Set Up Backend (5 minutes)

### Get Your API Key (1 minute)

1. Go to: **[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
2. Sign in with Google
3. Click **"Create API Key"**
4. **Copy the key** (starts with `AIza...`)

### Install & Configure (2 minutes)

Open your terminal and run:

```bash
# Go to backend folder
cd path/to/ext/backend

# Install Python packages
pip install -r requirements.txt

# Create .env file (Windows)
copy .env.example .env

# Create .env file (Mac/Linux)
cp .env.example .env
```

Now **edit the `.env` file** and paste your API key:

```
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnop
```

### Start Server (2 minutes)

```bash
python main.py
```

**You should see:**

```
INFO:     Uvicorn running on http://127.0.0.1:3000
```

✅ **Server is running!** Keep this terminal open.

**Test it works:** Open browser → Go to `http://localhost:3000/health`

You should see JSON with `"status": "healthy"`

## 🎮 Step 3: Use It! (3 minutes)

1. **Go to any webpage** (try [Wikipedia](https://en.wikipedia.org))
2. **Click the extension icon** in Chrome toolbar
3. **Toggle features on**:
   - ☑️ Visual Shift → Content moves right
   - ☑️ Highlighter Ruler → Move your mouse around!
   - ☑️ Flashing Anchor Bar → Red bar blinks on left
   - ☑️ Text Simplifier → Text becomes simpler (takes 1-2 seconds first time)

4. **Click "Settings"** to customize:
   - Change colors
   - Adjust speeds
   - Pick reading grade level

5. **Try changing the grade level** → Instant! (pre-cached)

## 🔍 How to Tell If It's Working

**Press F12** to open Developer Tools → Click "Console" tab

**You should see:**

```
🔍 API Detection: ✅ Available
💾 Pre-caching 47 paragraphs for Grade 3 using API...
📡 Cache MISS - calling backend (Grade 3)
✅ Text Simplifier enabled
```

**✅ = Good!** Everything working.
**❌ = Problem.** See troubleshooting below.

## 🐛 Quick Troubleshooting

| Problem                     | Solution                                                        |
| --------------------------- | --------------------------------------------------------------- |
| Extension icon not showing  | Reload: chrome://extensions → Click refresh icon                |
| "python is not recognized"  | Install Python: [python.org](https://www.python.org/downloads/) |
| "Port 3000 already in use"  | Close other programs or change port in main.py                  |
| "Backend API not available" | Make sure terminal with `python main.py` is still open          |
| Text not simplifying        | Check http://localhost:3000/health loads in browser             |
| Features not working        | Refresh the webpage after enabling them                         |

## 💡 Pro Tips

- **First time on a page**: Takes 1-2 seconds to simplify
- **Return visits**: Instant! Everything is cached
- **Keep terminal open**: Server stops when you close it
- **Check the console**: Press F12 to see what's happening
- **No backend?** Three features still work, text simplifier uses basic fallback

## 🚀 What's Next?

- **Customize settings** - Click Settings button in popup
- **Try different websites** - News sites, Wikipedia, blogs
- **Adjust to your needs** - Everyone is different!
- **Read full README** - Learn how everything works

## ⚙️ Commands Reference

**Start backend:**

```bash
cd backend
python main.py
```

**Stop backend:**

- Press `Ctrl+C` in the terminal

**Reload extension after code changes:**

- Go to chrome://extensions
- Click refresh icon on FocusFlow

**Check if backend is running:**

- Open browser → http://localhost:3000/health

**See extension errors:**

- Press F12 on any webpage → Console tab

## 🆘 Still Need Help?

1. **Read the full [README.md](README.md)** - Has detailed troubleshooting
2. **Check browser console** (F12) for error messages
3. **Check terminal** where backend is running for errors
4. **Make sure all steps completed** - Easy to miss something!

---

**That's it!** You should be up and running. Enjoy easier web browsing! 💙
