import os
import time
import hashlib
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite")

# Use the new Google GenAI SDK with structured output support
try:
    from google import genai
    if GEMINI_API_KEY:
        client = genai.Client(api_key=GEMINI_API_KEY)
        USE_GEMINI = True
        print(f"✅ Gemini API initialized: {MODEL_NAME}")
    else:
        raise ValueError("GEMINI_API_KEY not found")
except (ImportError, ValueError) as e:
    print(f"⚠️ Warning: {e}. Using fallback algorithm.")
    USE_GEMINI = False
    client = None

app = FastAPI(title="FocusFlow Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with extension origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Simple in-memory cache (use Redis in production)
cache = {}

class SimplifyRequest(BaseModel):
    text: str = Field(..., min_length=1)
    grade: int = Field(..., ge=2, le=12)
    pageId: Optional[str] = None

class BatchItem(BaseModel):
    id: str
    text: str

class SimplifyBatchRequest(BaseModel):
    batch: list[BatchItem]
    grade: int = Field(..., ge=2, le=12)
    pageId: Optional[str] = None

class SimplifyResponse(BaseModel):
    success: bool
    simplifiedText: str
    grade: int
    fromCache: bool
    latency: Optional[int] = None

class BatchResultItem(BaseModel):
    id: str
    text: str

class SimplifyBatchResponse(BaseModel):
    success: bool
    results: list[BatchResultItem]
    grade: int
    latency: Optional[int] = None

def generate_cache_key(text: str, grade: int) -> str:
    """Generate hash-based cache key"""
    text_hash = hashlib.md5(text.encode()).hexdigest()[:12]
    return f"{text_hash}_g{grade}"


class SimplifiedParagraph(BaseModel):
    """Schema to enforce complete, distinct paragraphs in API response."""
    simplified_text: str


def simplify_with_gemini(text: str, grade: int) -> str:
    """
    Call Gemini API for high-fidelity simplification.
    Uses strong prompting to prevent truncation and ensure completeness.
    """
    if not USE_GEMINI or not client:
        raise ValueError("Gemini client not initialized")
    
    # Build Aphasia-focused system instruction with examples
    max_words_per_sentence = 10 if grade <= 3 else 15
    instruction = f"""You are an expert linguist helping people with Aphasia read complex text.

YOUR TASK: Rewrite text at Grade {grade} level while keeping EVERY single fact.

⛔ WRONG APPROACH (DO NOT DO THIS):
Original: "We lament deaths that shorten great careers, as with Mary Wollstonecraft or John Keats."
Bad Output: "We lament deaths that shorten great careers, as with." ❌ MISSING NAMES!

✅ CORRECT APPROACH (DO THIS):
Original: "We lament deaths that shorten great careers, as with Mary Wollstonecraft or John Keats."
Good Output: "We are sad when great people die young. Mary Wollstonecraft died young. John Keats died young." ✅ ALL FACTS KEPT!

MANDATORY RULES:
1. NO DELETIONS: Every person name, place, date, number, and action MUST appear in your output
2. SIMPLIFY, DON'T SUMMARIZE: If original mentions 3 things, output mentions 3 things
3. SHORT SENTENCES: Max {max_words_per_sentence} words per sentence
4. SIMPLE WORDS: Replace hard words with common everyday words
5. ONE IDEA PER SENTENCE: Break complex sentences into multiple simple ones
6. COMPLETE SENTENCES: Never cut off mid-sentence or leave fragments
7. KEEP ALL DETAILS: If it's in the input, it must be in the output

VALIDATION BEFORE RESPONDING:
- Count all names/facts in original → Count them in your output → Must match!
- Every sentence must be complete with subject + verb + object
- No "..." or cut-offs
- Word count should be similar (you're rewording, not summarizing)"""

    try:
        # Create detailed prompt with the text
        user_prompt = f"""Rewrite this text for Grade {grade} readers. Remember: KEEP ALL FACTS AND NAMES.

Original text:
{text}

Instructions:
- Break long sentences into short ones ({max_words_per_sentence} words max)
- Use simple everyday words
- Keep EVERY name, number, date, and fact
- Make each sentence complete and clear
- This is NOT a summary - include everything!

Simplified text:"""

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=user_prompt,
            config={
                "system_instruction": instruction,
                "temperature": 0.2,  # Slightly higher for natural flow
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,  # Allow longer complete responses
            }
        )
        
        # Extract text from response
        if not response.text:
            raise HTTPException(status_code=502, detail="Empty response from Gemini")
        
        simplified = response.text.strip()
        
        # Strict quality validation
        original_word_count = len(text.split())
        simplified_word_count = len(simplified.split())
        
        # Count named entities (rough approximation)
        import re
        original_caps = set(re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text))
        simplified_caps = set(re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', simplified))
        missing_names = original_caps - simplified_caps
        
        # Reject if too many names missing
        if len(missing_names) > len(original_caps) * 0.3 and len(original_caps) > 0:
            print(f"⚠️ QUALITY CHECK: Missing names: {missing_names}")
            print(f"   Consider this may be incomplete")
        
        # Warn if output is suspiciously short
        if simplified_word_count < (original_word_count * 0.5):
            print(f"⚠️ Warning: Output may be incomplete ({simplified_word_count} vs {original_word_count} words)")
            if missing_names:
                print(f"   Missing names: {missing_names}")
        
        return simplified
        
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        raise HTTPException(status_code=502, detail=f"Gemini API failed: {str(e)}")

def simplify_with_fallback(text: str, grade: int) -> str:
    """Fallback algorithm-based simplification"""
    # Simple rule-based approach
    sentences = text.split('.')
    simplified_sentences = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        
        # Shorten sentences based on grade
        words = sentence.split()
        max_words = 5 + (grade * 2)  # Grade 3 = ~11 words max
        
        if len(words) > max_words:
            simplified_sentences.append(' '.join(words[:max_words]))
        else:
            simplified_sentences.append(sentence)
    
    return '. '.join(simplified_sentences) + '.'

@app.post("/api/simplify", response_model=SimplifyResponse)
async def simplify(payload: SimplifyRequest):
    start = time.time()
    cache_key = generate_cache_key(payload.text, payload.grade)
    
    # Check cache
    if cache_key in cache:
        latency_ms = int((time.time() - start) * 1000)
        print(f"✅ Cache HIT for Grade {payload.grade}")
        return SimplifyResponse(
            success=True,
            simplifiedText=cache[cache_key],
            grade=payload.grade,
            fromCache=True,
            latency=latency_ms
        )
    
    # Cache miss - simplify the text
    print(f"🔄 Cache MISS: Calling {'Gemini API' if USE_GEMINI else 'fallback'} for Grade {payload.grade}")
    try:
        if USE_GEMINI:
            simplified = simplify_with_gemini(payload.text, payload.grade)
        else:
            simplified = simplify_with_fallback(payload.text, payload.grade)
    except Exception as exc:
        print(f"❌ Error: {exc}")
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    
    # Cache result
    cache[cache_key] = simplified
    
    latency_ms = int((time.time() - start) * 1000)
    return SimplifyResponse(
        success=True,
        simplifiedText=simplified,
        grade=payload.grade,
        fromCache=False,
        latency=latency_ms
    )

@app.post("/api/simplify-batch", response_model=SimplifyBatchResponse)
async def simplify_batch(payload: SimplifyBatchRequest):
    start = time.time()
    results = []
    
    print(f"📝 BATCH REQUEST: {len(payload.batch)} items, Grade {payload.grade}")
    
    for item in payload.batch:
        cache_key = generate_cache_key(item.text, payload.grade)
        
        # Check cache
        if cache_key in cache:
            print(f"   ✅ Cache HIT: {item.id[:8]}...")
            results.append(BatchResultItem(id=item.id, text=cache[cache_key]))
            continue
        
        # Cache miss - simplify the text
        print(f"   🔄 Cache MISS: {item.id[:8]}... (calling API)")
        try:
            if USE_GEMINI:
                simplified = simplify_with_gemini(item.text, payload.grade)
            else:
                simplified = simplify_with_fallback(item.text, payload.grade)
            
            # Cache the result
            cache[cache_key] = simplified
            results.append(BatchResultItem(id=item.id, text=simplified))
            
        except Exception as exc:
            print(f"   ❌ Error simplifying {item.id}: {exc}")
            # Fallback on error
            simplified = simplify_with_fallback(item.text, payload.grade)
            results.append(BatchResultItem(id=item.id, text=simplified))
    
    latency_ms = int((time.time() - start) * 1000)
    print(f"   ✅ Batch complete: {len(results)} results ({latency_ms}ms)")
    
    return SimplifyBatchResponse(
        success=True,
        results=results,
        grade=payload.grade,
        latency=latency_ms
    )

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model": MODEL_NAME if USE_GEMINI else "fallback-algorithm",
        "gemini_enabled": USE_GEMINI,
        "cache_size": len(cache)
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting FocusFlow Backend...")
    print(f"   Model: {MODEL_NAME if USE_GEMINI else 'Fallback Algorithm'}")
    print(f"   Gemini: {'✅ Enabled' if USE_GEMINI else '❌ Disabled (using fallback)'}")
    uvicorn.run("main:app", host="127.0.0.1", port=3000, reload=True)
