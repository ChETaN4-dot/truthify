# TRUTHIFY — AI-Powered Product Transparency Engine

> Scan any product label. Groq AI decodes every ingredient. Know what you're really consuming.

---

## 🚀 Quick Start

```bash
# 1. Navigate to the project
cd truthify

# 2. Install all dependencies
npm install

# 3. Start the dev server
npx expo start --clear
```

Scan the QR code with **Expo Go** (iOS / Android) or press `w` for web.

---

## ⚙️ Configuration

Edit `config/apiKeys.js` — **only ONE key needed:**

```js
export const GROQ_API_KEY = "YOUR_GROQ_API_KEY";
```

| Key | Where to get it |
|-----|----------------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys → Create |

> ✅ **No Google Vision API needed!** Groq's `llama-4-scout-17b` vision model handles OCR + analysis in a **single API call**. Free tier has very generous limits.

---

## 📦 Dependencies

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.0 | Managed workflow runtime |
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.5 | Mobile framework |

### Navigation
| Package | Purpose |
|---------|---------|
| `@react-navigation/native` | Navigation container |
| `@react-navigation/bottom-tabs` | Bottom tab bar |
| `@react-navigation/native-stack` | Stack navigator |
| `@react-navigation/stack` | Stack navigator (legacy) |
| `react-native-screens` | Native screen optimization |
| `react-native-safe-area-context` | Safe area insets |
| `react-native-gesture-handler` | Gesture support |

### Expo Modules
| Package | Purpose |
|---------|---------|
| `expo-camera` | Camera access for scanning |
| `expo-image-picker` | Gallery image selection |
| `expo-image-manipulator` | Resize + compress images for OCR |
| `expo-linear-gradient` | Gradient backgrounds and buttons |
| `expo-blur` | Glassmorphism blur effects |
| `expo-haptics` | Tactile feedback on interactions |
| `expo-status-bar` | Status bar styling |

### UI & Graphics
| Package | Purpose |
|---------|---------|
| `react-native-svg` | SVG score gauge + bar charts |
| `@expo/vector-icons` | Ionicons icon set |
| `react-native-reanimated` | Smooth animations |
| `react-native-markdown-display` | Markdown rendering in chat |

### Data
| Package | Purpose |
|---------|---------|
| `@react-native-async-storage/async-storage` | Local persistence (scans, profile, auth) |

---

## 📥 Install Commands

### All at once (recommended)
```bash
npm install
npx expo install react-native-svg expo-haptics expo-blur @expo/vector-icons \
  @react-native-async-storage/async-storage react-native-markdown-display
```

### Individual packages
```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler

# Expo modules
npx expo install expo-camera expo-image-picker expo-image-manipulator expo-linear-gradient expo-blur expo-haptics

# UI
npx expo install react-native-svg
npm install @expo/vector-icons react-native-markdown-display

# Storage
npx expo install @react-native-async-storage/async-storage
```

---

## 🛠️ Available Scripts

```bash
npx expo start           # Start dev server (interactive)
npx expo start --clear   # Start with cleared cache (use after changes)
npx expo start --android # Open on Android emulator
npx expo start --ios     # Open on iOS simulator (macOS only)
npx expo start --web     # Open in browser
```

---

## 📁 Project Structure

```
truthify/
├── App.js                        ← Root: onboarding → login → app
├── config/
│   └── apiKeys.js                ← 🔑 API keys (Vision + Groq)
├── constants/
│   └── colors.js                 ← Design system (dark palette)
├── navigation/
│   └── AppNavigator.js           ← Bottom tabs + scan stack
├── screens/
│   ├── OnboardingScreen.js       ← 3-slide intro (shown once)
│   ├── LoginScreen.js            ← Name + PIN auth
│   ├── ScanScreen.js             ← Home: scan / compare modes
│   ├── ProcessingScreen.js       ← Terminal-style OCR + AI steps
│   ├── ResultsScreen.js          ← Score gauge, ingredients, chat CTA
│   ├── ChatScreen.js             ← AI chatbot with language switcher
│   ├── HistoryScreen.js          ← Scan history with search + filters
│   ├── ProfileScreen.js          ← Health profile + language preference
│   └── DashboardScreen.js        ← Analytics, charts, achievements
├── components/
│   ├── ScoreGauge.js             ← Animated SVG circular gauge
│   ├── IngredientCard.js         ← Expandable ingredient card
│   ├── ChatBubble.js             ← Chat message bubble
│   └── GradientButton.js         ← Reusable gradient CTA button
├── services/
│   ├── visionApi.js              ← Google Cloud Vision OCR
│   └── groqApi.js                ← Groq AI analysis + chat
└── utils/
    ├── storage.js                ← AsyncStorage CRUD (scans, profile, auth)
    └── imageProcessor.js         ← Resize + base64 encode for OCR
```

---

## ✨ Features

- **OCR Scanning** — Google Vision API reads ingredient labels in English, Hindi, Marathi, Tamil, Telugu, Bengali
- **AI Analysis** — Groq `llama3-70b-8192` scores ingredients 0–100, detects red flags and greenwashing
- **Compare Mode** — Upload front label (claims) + back label (ingredients) to detect deceptive marketing
- **AI Chat** — Ask anything about the product in 6 languages (English, Hindi, Hinglish, Marathi, Bengali, Tamil)
- **8 Regional Languages** — Explanations in Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam
- **Health Profile** — Personalized filters: diabetic, vegan, gluten-free, nut allergy, etc.
- **History** — All scans saved locally with search and filter
- **Dashboard** — Score trends, toxin tracker, safety distribution, achievements
- **Onboarding** — 3-slide intro shown only on first launch
- **Session Auth** — Name + PIN login, 7-day session persistence

---

## 🔑 API Keys Setup (Detailed)

### Google Cloud Vision API
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or select existing)
3. Go to **APIs & Services → Library**
4. Search and enable **Cloud Vision API**
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Copy the key into `config/apiKeys.js`

### Groq API
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / log in
3. Go to **API Keys → Create API Key**
4. Copy the key into `config/apiKeys.js`

> Both APIs have generous free tiers. Vision API: 1,000 units/month free. Groq: very high rate limits on free tier.

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `Metro bundler error` | Run `npx expo start --clear` |
| `Cannot find module 'react-native-svg'` | Run `npx expo install react-native-svg` |
| `Cannot find module '@expo/vector-icons'` | Run `npm install @expo/vector-icons` |
| Camera not working on web | Web camera support is limited — use Expo Go on mobile |
| OCR returns empty text | Ensure good lighting, hold camera steady, label must be in frame |
| Groq API error | Check your API key in `config/apiKeys.js` |
| Port 8081 in use | Press `r` in the existing terminal, or run `npx expo start --port 8082` |

---

## 📄 License

MIT — built for educational and demonstration purposes.
