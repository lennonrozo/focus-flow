// Content Script - Implements all 4 accessibility features

class AccessibilityManager {
  constructor() {
    this.settings = {};
    this.visualShiftActive = false;
    this.highlighterRulerActive = false;
    this.anchorBarActive = false;
    this.textSimplifierActive = false;
    
    this.highlighterOverlay = null;
    this.anchorBar = null;
    this.flashInterval = null;
    this.originalTexts = new Map();
    this.pageId = this.generatePageId();
    
    // Track API availability
    this.apiAvailable = null; // null = unknown, true = available, false = unavailable
    
    // Bind event handlers
    this.boundHighlighterMove = this.handleHighlighterMove.bind(this);
    
    this.init();
  }
  
  async init() {
    await this.loadSettings();
    this.setupMessageListener();
    this.applyFeatures();
  }
  
  generatePageId() {
    return `${window.location.hostname}_${Date.now()}`;
  }
  
  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        this.settings = response;
        resolve();
      });
    });
  }
  
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'settingsUpdated') {
        this.settings = request.settings;
        this.applyFeatures();
      }
      
      if (request.action === 'preCache') {
        // Pre-cache simplifications when popup opens
        console.log('🚀 Pre-cache requested for Grade', request.grade);
        this.preCacheSimplifications(request.grade, request.apiAvailable);
      }
    });
  }
  
  applyFeatures() {
    this.applyVisualShift();
    this.applyHighlighterRuler();
    this.applyFlashingAnchorBar();
    this.applyTextSimplifier();
  }
  
  // ========== FEATURE 1: VISUAL SHIFT ==========
  applyVisualShift() {
    if (this.settings.visualShiftEnabled && !this.visualShiftActive) {
      const shiftAmount = this.settings.visualShiftAmount || 15;
      document.body.style.transform = `translateX(${shiftAmount}%)`;
      document.body.style.transition = 'transform 0.3s ease';
      this.visualShiftActive = true;
      console.log(`✅ Visual Shift enabled (${shiftAmount}%)`);
    } else if (!this.settings.visualShiftEnabled && this.visualShiftActive) {
      document.body.style.transform = '';
      this.visualShiftActive = false;
      console.log('❌ Visual Shift disabled');
    }
  }
  
  // ========== FEATURE 2: HIGHLIGHTER RULER ==========
  applyHighlighterRuler() {
    if (this.settings.highlighterRulerEnabled && !this.highlighterRulerActive) {
      this.createHighlighterOverlay();
      this.highlighterRulerActive = true;
      console.log('✅ Highlighter Ruler enabled');
    } else if (!this.settings.highlighterRulerEnabled && this.highlighterRulerActive) {
      this.removeHighlighterOverlay();
      this.highlighterRulerActive = false;
      console.log('❌ Highlighter Ruler disabled');
    }
  }
  
  createHighlighterOverlay() {
    // Create fullscreen overlay
    this.highlighterOverlay = document.createElement('div');
    this.highlighterOverlay.id = 'accessibility-highlighter-overlay';
    this.highlighterOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      background: rgba(0, 0, 0, ${(this.settings.dimOpacity || 70) / 100});
    `;
    document.body.appendChild(this.highlighterOverlay);
    
    // Track mouse movement
    document.addEventListener('mousemove', this.boundHighlighterMove);
  }
  
  handleHighlighterMove(e) {
    // Check if overlay still exists
    if (!this.highlighterOverlay) return;
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || element.id === 'accessibility-highlighter-overlay') return;
    
    const rect = element.getBoundingClientRect();
    const color = this.settings.highlightColor || '#ffc800';
    
    // Padding for border placement (border goes outside the element)
    const padding = 8;
    
    // Cutout extends to match border size (includes padding area)
    const cutoutLeft = rect.left - padding;
    const cutoutTop = rect.top - padding;
    const cutoutRight = rect.right + padding;
    const cutoutBottom = rect.bottom + padding;
    
    this.highlighterOverlay.style.clipPath = `
      polygon(
        evenodd,
        0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
        ${cutoutLeft}px ${cutoutTop}px,
        ${cutoutRight}px ${cutoutTop}px,
        ${cutoutRight}px ${cutoutBottom}px,
        ${cutoutLeft}px ${cutoutBottom}px,
        ${cutoutLeft}px ${cutoutTop}px
      )
    `;
    
    // Add highlight box with padding (border positioned outside element)
    let highlightBox = document.getElementById('accessibility-highlight-box');
    if (!highlightBox) {
      highlightBox = document.createElement('div');
      highlightBox.id = 'accessibility-highlight-box';
      highlightBox.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 1000000;
        border: 3px solid ${color};
        box-shadow: 0 0 20px ${color};
      `;
      document.body.appendChild(highlightBox);
    }
    
    // Position border with padding outside the element
    highlightBox.style.left = `${rect.left - padding}px`;
    highlightBox.style.top = `${rect.top - padding}px`;
    highlightBox.style.width = `${rect.width + (padding * 2)}px`;
    highlightBox.style.height = `${rect.height + (padding * 2)}px`;
  }
  
  removeHighlighterOverlay() {
    if (this.highlighterOverlay) {
      this.highlighterOverlay.remove();
      this.highlighterOverlay = null;
    }
    const highlightBox = document.getElementById('accessibility-highlight-box');
    if (highlightBox) highlightBox.remove();
    
    document.removeEventListener('mousemove', this.boundHighlighterMove);
  }
  
  // ========== FEATURE 3: FLASHING ANCHOR BAR ==========
  applyFlashingAnchorBar() {
    if (this.settings.flashingAnchorBarEnabled && !this.anchorBarActive) {
      this.createAnchorBar();
      this.anchorBarActive = true;
      console.log('✅ Flashing Anchor Bar enabled');
    } else if (!this.settings.flashingAnchorBarEnabled && this.anchorBarActive) {
      this.removeAnchorBar();
      this.anchorBarActive = false;
      console.log('❌ Flashing Anchor Bar disabled');
    }
  }
  
  createAnchorBar() {
    const barWidth = this.settings.barWidth || 8;
    
    this.anchorBar = document.createElement('div');
    this.anchorBar.id = 'accessibility-anchor-bar';
    this.anchorBar.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: ${barWidth}px;
      height: 100%;
      background: red;
      z-index: 1000001;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(this.anchorBar);
    
    // Start flashing
    this.startFlashing();
  }
  
  startFlashing() {
    const interval = this.settings.flashInterval || 1000;
    let visible = true;
    
    this.flashInterval = setInterval(() => {
      if (this.anchorBar) {
        this.anchorBar.style.opacity = visible ? '1' : '0.3';
        visible = !visible;
      }
    }, interval);
  }
  
  removeAnchorBar() {
    if (this.anchorBar) {
      this.anchorBar.remove();
      this.anchorBar = null;
    }
    if (this.flashInterval) {
      clearInterval(this.flashInterval);
      this.flashInterval = null;
    }
  }
  
  // ========== FEATURE 4: TEXT SIMPLIFIER ==========
  async applyTextSimplifier() {
    if (this.settings.textSimplifierEnabled && !this.textSimplifierActive) {
      await this.simplifyAllText();
      this.textSimplifierActive = true;
      console.log('✅ Text Simplifier enabled');
    } else if (!this.settings.textSimplifierEnabled && this.textSimplifierActive) {
      this.restoreOriginalText();
      this.textSimplifierActive = false;
      console.log('❌ Text Simplifier disabled');
    } else if (this.textSimplifierActive) {
      // Settings changed while active - re-simplify
      if (this.apiAvailable === true) {
        console.log('🔄 Grade changed - checking cache for new grade...');
      } else {
        console.log('🔄 Grade changed - re-running fallback algorithm (produces same result)');
      }
      await this.simplifyAllText();
    }
  }
  
  async simplifyAllText() {
    const paragraphs = this.getParagraphs();
    console.log(`📝 Found ${paragraphs.length} paragraphs/sections to simplify`);
    
    // Check if API availability has been detected
    if (this.apiAvailable === null) {
      console.log('⚠️ API availability unknown - detecting now...');
      this.apiAvailable = await this.detectAPIAvailability();
      console.log(`🔍 API Detection Result: ${this.apiAvailable ? '✅ Available' : '❌ Not Available'}`);
    }
    
    // Route to appropriate method based on API availability
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
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      return response.ok;
    } catch (error) {
      console.log('❌ Backend API not reachable:', error.message);
      return false;
    }
  }
  
  async simplifyWithAPI(paragraphs) {
    // API path: Use batching and cache
    const BATCH_SIZE = 10;
    const batches = [];
    
    for (let i = 0; i < paragraphs.length; i += BATCH_SIZE) {
      batches.push(paragraphs.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`📦 Processing ${batches.length} batches with API`);
    
    for (const batch of batches) {
      const batchData = batch.map((element, index) => {
        const text = element.textContent.trim();
        if (text.length < 20) return null;
        
        const id = `p_${Date.now()}_${index}`;
        
        if (!this.originalTexts.has(element)) {
          this.originalTexts.set(element, text);
        }
        
        return { id, text, element };
      }).filter(item => item !== null);
      
      if (batchData.length === 0) continue;
      
      // Send batch to API (will use cache if available)
      const simplified = await this.simplifyBatch(batchData);
      
      if (simplified && Array.isArray(simplified)) {
        simplified.forEach(result => {
          const item = batchData.find(d => d.id === result.id);
          if (item && result.text && result.text !== item.text) {
            item.element.textContent = result.text;
          }
        });
      }
    }
  }
  
  async simplifyWithFallback(paragraphs) {
    // Fallback path: No API, no batching - process paragraph by paragraph
    console.log(`🔧 Processing ${paragraphs.length} paragraphs with fallback algorithm`);
    
    for (const paragraph of paragraphs) {
      const originalText = paragraph.textContent.trim();
      if (originalText.length < 20) continue;
      
      if (!this.originalTexts.has(paragraph)) {
        this.originalTexts.set(paragraph, originalText);
      }
      
      // Use local fallback algorithm directly (no API call)
      const simplified = this.applyFallbackAlgorithm(originalText);
      if (simplified && simplified !== originalText) {
        paragraph.textContent = simplified;
      }
    }
  }
  
  applyFallbackAlgorithm(text) {
    // Local rule-based simplification (same as background.js fallback)
    const grade = this.settings.textSimplifierGrade || 3;
    
    let sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    sentences = sentences.map(s => s.trim()).filter(s => s.length > 0);
    
    // Condense to 3 key sentences
    if (sentences.length > 3) {
      const keyIndices = [0, Math.floor(sentences.length / 2), sentences.length - 1];
      sentences = keyIndices.map(i => sentences[i]);
    }
    
    // Simplify words
    const replacements = {
      'utilize': 'use', 'implement': 'do', 'facilitate': 'help',
      'demonstrate': 'show', 'approximately': 'about', 'consequently': 'so',
      'furthermore': 'also', 'nevertheless': 'but', 'therefore': 'so',
      'regarding': 'about', 'concerning': 'about', 'subsequently': 'later',
      'additionally': 'also', 'numerous': 'many', 'purchase': 'buy',
      'acquire': 'get', 'commence': 'start', 'terminate': 'end',
      'possess': 'have', 'require': 'need', 'however': 'but',
      'although': 'but', 'because': 'since'
    };
    
    sentences = sentences.map(sentence => {
      let simplified = sentence;
      
      for (const [complex, simple] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${complex}\\b`, 'gi');
        simplified = simplified.replace(regex, simple);
      }
      
      simplified = simplified.replace(/\([^)]+\)/g, '');
      simplified = simplified.replace(/["']/g, '');
      
      if (grade <= 4) {
        simplified = simplified.replace(/\b\w+ly\b/g, '');
      }
      
      simplified = simplified.replace(/\s+/g, ' ');
      simplified = simplified.replace(/\s+([.,!?])/g, '$1');
      
      return simplified.trim();
    });
    
    return sentences.join(' ');
  }
  
  async simplifyBatch(batchData) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'simplifyBatch',
        batch: batchData.map(d => ({ id: d.id, text: d.text })),
        grade: this.settings.textSimplifierGrade || 3,
        pageId: this.pageId
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Batch message error:', chrome.runtime.lastError.message);
          resolve(null);
          return;
        }
        if (response && response.success) {
          console.log(`✅ Batch simplified: ${response.results.length} items (Grade ${this.settings.textSimplifierGrade})`);
          resolve(response.results);
        } else {
          console.error('❌ Batch simplification failed:', response?.error);
          resolve(null);
        }
      });
    });
  }
  
  async preCacheSimplifications(grade, apiAvailable) {
    // Store API availability status
    this.apiAvailable = apiAvailable;
    console.log(`💾 API Status: ${apiAvailable ? '✅ Available' : '❌ Not Available'}`);
    
    if (!apiAvailable) {
      console.log('🔧 No API - skipping pre-cache (will use fallback algorithm when toggled)');
      return;
    }
    
    // Only pre-cache if API is available
    const paragraphs = this.getParagraphs();
    console.log(`💾 Pre-caching ${paragraphs.length} paragraphs for Grade ${grade} using API...`);
    
    // Batch paragraphs into groups of 10
    const BATCH_SIZE = 10;
    const batches = [];
    
    for (let i = 0; i < paragraphs.length; i += BATCH_SIZE) {
      batches.push(paragraphs.slice(i, i + BATCH_SIZE));
    }
    
    // Send all batches to background for caching (don't wait for response)
    for (const batch of batches) {
      const batchData = batch.map((element, index) => {
        const text = element.textContent.trim();
        if (text.length < 20) return null;
        return { id: `precache_${Date.now()}_${index}`, text };
      }).filter(item => item !== null);
      
      if (batchData.length === 0) continue;
      
      // Fire and forget - just cache in background
      chrome.runtime.sendMessage({
        action: 'preCacheBatch',
        batch: batchData.map(d => ({ id: d.id, text: d.text })),
        grade: grade,
        pageId: this.pageId
      });
    }
    
    console.log(`💾 Pre-cache initiated: ${batches.length} batches queued`);
  }
  
  getParagraphs() {
    // Get paragraph-level elements and lists
    const selectors = [
      'p',           // Paragraphs
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',  // Headings
      'blockquote',  // Quotes
      'td', 'th',    // Table cells
      'figcaption',  // Figure captions
      'dd', 'dt',    // Definition lists
      'ul', 'ol'     // Complete lists (not individual li)
    ];
    
    const paragraphs = [];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Skip elements in header, footer, nav
        if (element.closest('header, footer, nav')) return;
        
        // Skip hyperlinks
        if (element.tagName.toLowerCase() === 'a' || element.closest('a')) return;
        
        // Skip if it's inside another paragraph element (avoid duplication)
        const parentSelectors = selectors.filter(s => s !== selector);
        const hasParentParagraph = parentSelectors.some(s => element.closest(s));
        if (hasParentParagraph) return;
        
        // Skip if it has child paragraph elements (avoid duplication)
        const hasChildParagraphs = selectors.some(s => element.querySelector(s));
        if (hasChildParagraphs && selector !== 'ul' && selector !== 'ol') return;
        
        // Skip if no meaningful text
        const text = element.textContent.trim();
        if (text.length < 20) return;
        
        paragraphs.push(element);
      });
    });
    
    return paragraphs;
  }
  
  async simplifyText(text) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'simplifyText',
        text: text,
        grade: this.settings.textSimplifierGrade || 3,
        pageId: this.pageId
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Message error:', chrome.runtime.lastError.message);
          resolve(text);
          return;
        }
        if (response && response.success) {
          const status = response.fromCache ? '💾' : '📡';
          console.log(`${status} Simplified (Grade ${this.settings.textSimplifierGrade})`);
          resolve(response.simplifiedText);
        } else {
          console.error('❌ Simplification failed:', response?.error);
          resolve(text); // Return original on error
        }
      });
    });
  }
  
  restoreOriginalText() {
    this.originalTexts.forEach((originalText, element) => {
      // Check if element still exists in DOM
      if (element && element.parentElement) {
        element.textContent = originalText;
      }
    });
    this.originalTexts.clear();
  }
}

// Initialize when page loads
const manager = new AccessibilityManager();
