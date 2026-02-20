# TRUTHIFY — Full Workflow Documentation
> End-to-end explanation of what happens from app launch to results

---

## 🗺️ High-Level Flow

```
App Launch → Onboarding (once) → Login → Scan Screen
    → Pick Image → Processing Screen → Groq Vision AI
    → Results Screen → Chat Screen
```

---

## PHASE 1 — App Launch (`App.js`)

```
App boots
    ↓
Reads AsyncStorage:
  ├── No onboarding flag?  → Show OnboardingScreen (3 slides, never shown again)
  ├── Valid session < 7 days?  → Skip login, go directly to app
  └── No session / expired?  → Show LoginScreen
```

---

## PHASE 2 — Authentication (`LoginScreen.js`)

```
User enters: Name + 4-digit PIN
    ↓
Register:  Saves { name, pin } to AsyncStorage
Login:     Reads stored pin, compares with input
    ↓
Success:
  • Saves session { loginTime } to AsyncStorage
  • Navigates to main app (bottom tab navigator)
```

> **No server. No database. 100% local on-device storage.**

---

## PHASE 3 — Scan Screen (`ScanScreen.js`)

```
User sees home screen with:
  • Greeting ("Hey, Rahul 👋")
  • Quick stats (total scans, avg score)
  • Two scan modes:

  ┌──────────────────┬──────────────────────┐
  │   SINGLE SCAN    │    COMPARE MODE      │
  │  (back label)    │  (front + back)      │
  └──────────────────┴──────────────────────┘

Single Scan:
  → Camera or gallery → 1 image
  → Go to ProcessingScreen { imageUri, mode: 'single' }

Compare Mode:
  → Pick FRONT label (marketing claims)
  → Pick BACK label (actual ingredients)
  → Go to ProcessingScreen { imageUri: backUri, frontBase64, mode: 'compare' }
```

---

## PHASE 4 — Processing Screen (`ProcessingScreen.js`)

The core pipeline. Runs automatically on arrival.

```
Step 1: 📸  Image captured
            └─ UI acknowledgment

Step 2: 🔍  Preparing image for AI
            └─ expo-image-manipulator:
               • Resize to 1200px wide
               • Compress to 85% JPEG
               • Convert to base64 string
               (Keeps image under Groq's 4MB limit)

Step 3: 🧠  Sending to Groq Vision AI
            └─ Load user health profile from AsyncStorage

Step 4-5: ⚗️  Analyzing ingredients
            └─ ONE API call to Groq:

               POST https://api.groq.com/openai/v1/chat/completions
               Model: meta-llama/llama-4-scout-17b-16e-instruct
               Payload: {
                 messages: [
                   { role: "system", content: "You are Truthify AI..." },
                   { role: "user", content: [
                     { type: "text",      value: "Analyze this label, return JSON..." },
                     { type: "image_url", url: "data:image/jpeg;base64,<base64>" },
                     // Compare mode: second image added here
                   ]}
                 ],
                 temperature: 0.1,   ← low = consistent, factual
                 max_tokens: 4000
               }

Step 6: 🔎  Checking for greenwashing
            └─ Waiting for Groq response

Step 7: 🌍  Generating regional explanations
            └─ Groq returns full JSON

Step 8: ✨  Analysis complete!
            └─ Navigate to ResultsScreen
```

---

## PHASE 5 — What Groq AI Does Internally

The `llama-4-scout-17b` vision model receives the image and:

| Step | What AI Does |
|------|-------------|
| 1 | **Reads the image** — performs OCR internally (no separate OCR service) |
| 2 | **Identifies product** — name, category (Food / Cosmetic / Supplement) |
| 3 | **Parses ingredients** — extracts every ingredient from the label text |
| 4 | **Scores each ingredient** — against known harmful additives, preservatives, chemicals |
| 5 | **Calculates overall score** — 0–100 based on severity + count of red flags |
| 6 | **Detects greenwashing** — compares front label claims vs actual ingredients |
| 7 | **Checks suitability** — against user's health profile (diabetic, vegan, nut allergy, etc.) |
| 8 | **Generates 8 language explanations** — Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam |
| 9 | **Suggests alternatives** — healthier product options |

### JSON Response Structure

```json
{
  "productName": "Maggi Noodles",
  "productCategory": "Food",
  "overallScore": 42,
  "scoreLabel": "MODERATE",
  "totalIngredients": 18,
  "extractedText": "INGREDIENTS: Wheat flour, salt, MSG...",

  "redFlagIngredients": [
    {
      "name": "MSG",
      "technicalName": "Monosodium Glutamate",
      "reason": "Linked to headaches and obesity",
      "severity": "MEDIUM",
      "healthEffect": "Excitotoxin, may cause neurological effects",
      "expandedDetail": "..."
    }
  ],
  "warningIngredients": [ ... ],
  "safeIngredients": [ ... ],

  "greenwashingAlerts": [
    {
      "claim": "No Added MSG",
      "reality": "Contains Hydrolyzed Vegetable Protein which releases free glutamate",
      "isDeceptive": true
    }
  ],

  "suitableFor": {
    "diabetic": false,
    "vegan": true,
    "glutenFree": false,
    "lactoseFree": true,
    "nutFree": true
  },

  "summary": "This product contains several concerning additives...",
  "funFact": "MSG was first isolated from seaweed in 1908 by Japanese chemist Kikunae Ikeda.",
  "safetyTip": "Limit to once a week and pair with fresh vegetables to offset sodium.",
  "alternatives": ["Whole wheat pasta", "Homemade noodles", "Oats upma"],

  "regionalExplanations": {
    "Hindi": "यह उत्पाद स्वास्थ्य के लिए मध्यम जोखिम वाला है...",
    "Bengali": "এই পণ্যটি স্বাস্থ্যের জন্য মাঝারি ঝুঁকিপূর্ণ...",
    "Telugu": "...", "Marathi": "...", "Tamil": "...",
    "Gujarati": "...", "Kannada": "...", "Malayalam": "..."
  },

  "comparisonSummary": null
}
```

---

## PHASE 6 — Results Screen (`ResultsScreen.js`)

```
Displays the JSON visually:

  🎯 Score Gauge       → SVG circle animates from 0 → score over 1.5s
                          Color: Green (≥70) / Amber (≥40) / Red (<40)

  🚨 Greenwashing       → CLAIM card vs REALITY card, DECEPTION DETECTED stamp

  ⚖️ Label vs Ingredients → Compare mode: mismatch summary

  ⚠️ Red Flag Ingredients → Expandable cards (tap to see health effects)

  ✅ Safe Ingredients   → Collapsible list (show 3, expand for more)

  👤 Suitability Chips  → ✓ Diabetic Friendly  ✗ Not Vegan  etc.

  🤖 Truthify Says      → AI-generated 2-3 sentence verdict

  🗣️ Regional Languages → 8 language tabs, tap to switch

  💡 Did You Know?      → Fun fact about a key ingredient (amber card)

  🛡️ Safety Tip         → Personalized actionable advice (cyan card)

  📄 Extracted Text     → Raw OCR output in monospace

  💡 Alternatives       → Healthier product suggestions

  💬 Ask Truthify       → Opens Chat screen with product context loaded

Auto-saves scan to AsyncStorage history
```

---

## PHASE 7 — Chat Screen (`ChatScreen.js`)

```
Opens with product context pre-loaded in AI memory
    ↓
User asks: "Is this safe for my diabetic father?"
    ↓
API call to Groq:
  Model: llama3-70b-8192  ← text model (faster + cheaper for conversation)
  System prompt: includes full product analysis JSON
  History: last 20 messages kept in context
  Language: user's selected language (English / Hindi / Hinglish / etc.)
    ↓
AI responds with markdown-formatted answer
```

---

## PHASE 8 — Other Screens

| Screen | What it shows |
|--------|--------------|
| **History** | All past scans, searchable, filterable (All / This Week / High Risk / Safe), long-press to delete |
| **Dashboard** | SVG bar chart of score trends, safety distribution (Safe/Warning/Danger counts), top red flag ingredients, achievement badges |
| **Profile** | Health filter toggles (diabetic, vegan, gluten-free, etc.), default language, editable name, logout |

---

## Data Storage — All Local (`utils/storage.js`)

```
AsyncStorage Keys:
  truthify_scans      → Array of all scan result JSONs
  truthify_profile    → { name, filters, language, memberSince }
  truthify_auth       → { name, pin }
  truthify_session    → { loginTime }
  truthify_onboarded  → "true"
```

> No cloud. No account. No data leaves the device (except to Groq API for analysis).

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React Native + Expo SDK 54 | Cross-platform mobile app |
| Navigation | React Navigation v7 | Bottom tabs + stack screens |
| AI Vision + OCR | Groq `llama-4-scout-17b-16e-instruct` | Reads image + analyzes ingredients |
| AI Chat | Groq `llama3-70b-8192` | Conversational Q&A about product |
| Image Processing | `expo-image-manipulator` | Resize + compress before API call |
| Local Storage | `@react-native-async-storage/async-storage` | Scan history, profile, auth |
| Animations | React Native `Animated` API | Score gauge, step transitions |
| Charts | `react-native-svg` | Score gauge, bar charts |
| Icons | `@expo/vector-icons` (Ionicons) | UI icons throughout |
| Gradients | `expo-linear-gradient` | Buttons, backgrounds |
| Camera/Gallery | `expo-camera`, `expo-image-picker` | Image capture |

---

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| **No backend server** | Simpler deployment, no hosting cost, privacy-first |
| **Single API call** for OCR + analysis | Faster, cheaper, vision model does both simultaneously |
| **Temperature 0.1** | Low randomness = consistent, factual ingredient analysis |
| **JSON-only AI responses** | Reliably parseable, no prose to strip |
| **4000 max tokens** | Enough for full ingredient list + 8 language explanations |
| **Image compressed to 1200px** | Under Groq's 4MB base64 limit, text still readable |
| **llama3-70b for chat** | Faster inference for conversational responses |
| **llama-4-scout for vision** | Only Groq model that accepts image inputs |
