"""Test script to validate inference fidelity"""
import os
from dotenv import load_dotenv

load_dotenv()

# Import after loading env
from google import genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

from pydantic import BaseModel

class SimplifiedParagraph(BaseModel):
    simplified_text: str

# Test text
test_text = """We lament deaths that shorten great careers, as with Mary Wollstonecraft or John Keats. We puzzle over decisions to abandon success. Shakespeare retired to Stratford at the height of his powers; Arthur Rimbaud abandoned poetry at 20 to become, at different times, a construction worker, a coffee grower, an arms trafficker. These stories may strike us as examples of promise lost, of vocations cut short."""

grade = 5
max_words = 15

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
3. SHORT SENTENCES: Max {max_words} words per sentence
4. SIMPLE WORDS: Replace hard words with common everyday words
5. ONE IDEA PER SENTENCE: Break complex sentences into multiple simple ones
6. COMPLETE SENTENCES: Never cut off mid-sentence or leave fragments
7. KEEP ALL DETAILS: If it's in the input, it must be in the output

VALIDATION BEFORE RESPONDING:
- Count all names/facts in original → Count them in your output → Must match!
- Every sentence must be complete with subject + verb + object
- No "..." or cut-offs
- Word count should be similar (you're rewording, not summarizing)"""

user_prompt = f"""Rewrite this text for Grade {grade} readers. Remember: KEEP ALL FACTS AND NAMES.

Original text:
{test_text}

Instructions:
- Break long sentences into short ones ({max_words} words max)
- Use simple everyday words
- Keep EVERY name, number, date, and fact
- Make each sentence complete and clear
- This is NOT a summary - include everything!"""

print("🧪 Testing inference fidelity...\n")
print(f"Original ({len(test_text.split())} words):")
print(test_text)
print("\n" + "="*80 + "\n")

# Try without structured output first
response = client.models.generate_content(
    model="gemini-2.0-flash-lite",
    contents=user_prompt,
    config={
        "system_instruction": instruction,
        "temperature": 0.2,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
    }
)

simplified = response.text.strip()

print(f"Simplified ({len(simplified.split())} words):")
print(simplified)
print("\n" + "="*80 + "\n")

# Check for name preservation
import re
original_names = set(re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', test_text))
simplified_names = set(re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', simplified))
missing = original_names - simplified_names

print(f"✅ Names in original: {original_names}")
print(f"✅ Names in simplified: {simplified_names}")
if missing:
    print(f"⚠️ MISSING NAMES: {missing}")
else:
    print("✅ All names preserved!")
