# 📚 Documentation Index

Welcome to FocusFlow! Choose the guide that fits your needs:

## 🚀 For First-Time Users

**[QUICKSTART.md](QUICKSTART.md)** - Get running in 10 minutes

- Fast setup steps
- Minimal explanations
- Quick troubleshooting
- Perfect for: "I just want it to work!"

**[INSTALL.md](INSTALL.md)** - Step-by-step installation guide

- Detailed explanations for each step
- Screenshots and visual aids (in future versions)
- Beginner-friendly language
- Troubleshooting for each step
- Perfect for: "I'm new to this, walk me through it"

**[CHECKLIST.md](CHECKLIST.md)** - Verify your setup is complete

- Check off each step as you complete it
- Daily startup checklist
- Make sure nothing is missed
- Perfect for: "Did I do everything right?"

## 📖 For Understanding the Extension

**[README.md](README.md)** - Complete documentation

- What the extension does
- Detailed feature descriptions
- Architecture overview
- Usage instructions
- Comprehensive troubleshooting
- FAQ section
- Perfect for: "I want to understand everything"

## 👨‍💻 For Developers

**[DEVELOPER.md](DEVELOPER.md)** - Technical documentation

- Architecture deep dive
- Code structure and flow diagrams
- API detection logic
- Caching strategy
- How to add new features
- Backend customization
- Deployment guides
- Perfect for: "I want to modify/contribute to this"

## 🆘 For Troubleshooting

**Quick Links:**

- [Extension won't load](README.md#extension-not-loading) (README.md)
- [Backend won't start](README.md#backend-server-wont-start) (README.md)
- [Text simplifier not working](README.md#text-simplifier-not-working) (README.md)
- [Features not applying](README.md#features-not-applying-to-webpage) (README.md)

---

## Document Quick Reference

| Document          | Length      | Difficulty   | Purpose                     |
| ----------------- | ----------- | ------------ | --------------------------- |
| **QUICKSTART.md** | 5 min read  | Easy         | Get up and running fast     |
| **INSTALL.md**    | 15 min read | Beginner     | Detailed step-by-step setup |
| **CHECKLIST.md**  | 5 min read  | Easy         | Verify setup completion     |
| **README.md**     | 20 min read | Intermediate | Complete user guide         |
| **DEVELOPER.md**  | 45 min read | Advanced     | Technical architecture      |

---

## Reading Path Recommendations

### "I just downloaded this and want to use it"

1. Start with **QUICKSTART.md**
2. Use **CHECKLIST.md** to verify
3. If stuck, consult **README.md** troubleshooting section

### "I'm not tech-savvy but want to install this properly"

1. Read **INSTALL.md** carefully
2. Follow **CHECKLIST.md** as you go
3. Keep **README.md** open for reference

### "I want to modify this extension for my needs"

1. Quick setup with **QUICKSTART.md**
2. Read **DEVELOPER.md** for architecture
3. Use **README.md** for feature reference

### "I'm considering using this for my organization"

1. Read **README.md** overview
2. Review **DEVELOPER.md** deployment section
3. Check **INSTALL.md** for user setup process

---

## Key Concepts Explained

### What is an Extension?

A small program that runs inside your Chrome browser to add new features. Think of it like an app on your phone, but for your web browser.

### What is a Backend Server?

A program that runs on your computer (or a server) that the extension talks to. For this extension, it connects to Google's AI to simplify text. **Three of the four features work without it.**

### What is an API?

A way for programs to talk to each other. In this case:

- The extension talks to the backend (our API)
- The backend talks to Google Gemini (Google's API)

### What is Caching?

Storing results so you don't have to ask for them again. Like writing down an answer so you don't have to look it up every time.

### What is Python?

A programming language the backend server is written in. You need to install it to run the backend.

---

## Support Resources

### Console Logs (Emoji Guide)

When you press F12 and look at the Console, you'll see messages with emojis:

- ✅ = Everything working correctly
- ❌ = Error occurred
- ⚠️ = Warning (non-critical)
- 🔍 = Detecting/testing something
- 💾 = Saving to cache
- 📡 = Calling backend API
- 🔧 = Using fallback algorithm
- 📝 = Processing text
- 🚀 = Starting process

### File Structure

```
ext/
├── manifest.json          # Extension configuration
├── background.js          # Handles API calls and caching
├── popup/                 # The window you see when clicking the icon
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # Code that runs on every webpage
│   ├── content.js
│   └── content.css
└── backend/               # Python server (optional)
    ├── main.py
    ├── requirements.txt
    └── .env               # Your API key goes here
```

### Important URLs

**Local:**

- Backend health check: `http://localhost:3000/health`
- Extensions page: `chrome://extensions`

**External:**

- Get API key: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Python download: [https://www.python.org/downloads/](https://www.python.org/downloads/)
- Chrome Web Store: [https://chrome.google.com/webstore](https://chrome.google.com/webstore)

---

## Common Terms Glossary

**Backend** - Server program that connects to Google's AI  
**Cache** - Stored results for faster loading  
**Content Script** - Code that modifies webpages  
**Developer Mode** - Chrome setting that allows loading custom extensions  
**Extension** - Program that adds features to Chrome  
**Grade Level** - Reading difficulty (2 = simple, 8 = complex)  
**IndexedDB** - Browser storage for caching  
**Manifest** - Configuration file for the extension  
**Popup** - Window that appears when you click the extension icon  
**Service Worker** - Background script that handles API calls  
**Terminal** - Text-based program for running commands

---

**Need help?** Start with the document that matches your comfort level and goals. All documents link to each other for easy navigation.

**Found an issue?** Check the troubleshooting section in [README.md](README.md) or the specific installation step in [INSTALL.md](INSTALL.md).

**Want to contribute?** See [DEVELOPER.md](DEVELOPER.md) for technical details and contribution guidelines.
