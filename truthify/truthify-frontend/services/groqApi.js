import { GROQ_API_KEY } from '../config/apiKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'; // Use Llama 4 scout for Vision OCR
const CHAT_MODEL = 'llama-3.3-70b-versatile';

// ── Scan Cache ────────────────────────────────────────────────────────────────
const SCAN_CACHE_KEY = 'truthify_scan_cache';
const CACHE_MAX = 50;

// ── Scan Cache Key Generation ──────────────────────────────────────────────
// This function creates a "fingerprint" of the ingredient list that is 
// resilient to small OCR errors, different cropping, or leading/trailing text.
const makeCacheKey = (text) => {
    if (!text) return '';
    // 1. Lowercase and remove all non-alphanumeric noise
    // 2. Split into words and keep only meaningful ones (> 3 chars)
    // 3. Sort them alphabetically so order doesn't matter
    // 4. Use the first 40 stable terms as the key
    const stableWords = text.toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .sort();
    
    return stableWords.slice(0, 40).join('_');
};

const getCachedScan = async (key) => {
    try {
        const raw = await AsyncStorage.getItem(SCAN_CACHE_KEY);
        return raw ? (JSON.parse(raw)[key] || null) : null;
    } catch { return null; }
};

const cacheScan = async (key, result) => {
    try {
        const raw = await AsyncStorage.getItem(SCAN_CACHE_KEY);
        let cache = raw ? JSON.parse(raw) : {};
        const keys = Object.keys(cache);
        if (keys.length >= CACHE_MAX) delete cache[keys[0]];
        cache[key] = result;
        await AsyncStorage.setItem(SCAN_CACHE_KEY, JSON.stringify(cache));
    } catch (e) { console.warn('Cache write failed:', e.message); }
};

// ── Real-Time Weather Context ────────────────────────────────────────────────
const fetchWeatherContext = async () => {
    try {
        // Find rough IP location
        const locRes = await fetch('https://ipapi.co/json/');
        const locData = await locRes.json();
        
        if (locData.latitude && locData.longitude) {
            // Get hyper-local current temperature
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${locData.latitude}&longitude=${locData.longitude}&current=temperature_2m`);
            const wData = await wRes.json();
            const temp = wData.current?.temperature_2m;
            if (temp) {
                return `CURRENT WEATHER CONTEXT:
The user's current local temperature outside is ${temp}°C in ${locData.city}.
Use this insight ONLY IF RELEVANT to the product. For example: if it's very hot (>30°C) and they scanned a hydration drink, mention it's great right now. If it's hot and they scanned a heavy greasy food, warn them it might feel too heavy. If it's cold (<15°C) and they scanned soup/tea, praise it. Add this weather recommendation naturally inside the 'summary' and 'safetyTip' fields.`;
            }
        }
        return '';
    } catch (err) {
        return ''; // Fail silently if weather API fails, no big deal
    }
};

// ── Master System Prompt ──────────────────────────────────────────────────────
// This is the core knowledge base injected into every analysis call.
// It grounds the AI in real science, FSSAI rules, and Indian consumer context.
const MASTER_SYSTEM_PROMPT = `You are Truthify AI — India's most trusted food & product safety analyst.
You have deep expertise in:
- FSSAI (Food Safety and Standards Authority of India) regulations
- Indian packaged food market (Maggi, Lay's, Amul, Britannia, Patanjali, Nestle, ITC, PepsiCo India, etc.)
- Cosmetics: BIS standards, EU Cosmetics Regulation, EWG Skin Deep database
- Ayurvedic ingredients common in Indian products
- Nutritional science based on ICMR (Indian Council of Medical Research) dietary guidelines
- Common Indian dietary patterns: vegetarian, jain, diabetic-heavy population

INGREDIENT CLASSIFICATION RULES (apply these STRICTLY and CONSISTENTLY):
HIGH risk (always flag these):
- Refined sugar / sucrose / added sugars > 10g per 100g
- High Fructose Corn Syrup (HFCS) / Glucose-Fructose Syrup
- Trans fats / Partially Hydrogenated Vegetable Oil (PHVO)
- Monosodium Glutamate (MSG / E621) — flag in snacks/instant noodles
- Sodium Benzoate (E211) in acidic foods
- Potassium Bromate (banned in India but check)
- Artificial sweeteners: Acesulfame-K (E950), Aspartame (E951), Saccharin (E954) at high doses
- BHA (E320) / BHT (E321) — synthetic antioxidants (carcinogen concern)
- Carrageenan (E407) — gut irritant, flagged by WHO
- Red 40 / Yellow 5 / Yellow 6 / Blue 1 — synthetic dyes, banned in several countries
- Sodium Nitrate/Nitrite (E250/E251) — processed meat preservatives

MEDIUM risk (warn users):
- Refined flour (Maida) — high GI, gut health concern
- Palm oil — high saturated fat, sustainability concern
- Sodium > 500mg per 100g — high salt
- Caramel color (E150c/d) — 4-MEI concern
- Soy lecithin from GMO sources
- Titanium Dioxide (E171) — nano-particle concern
- Maltodextrin — high GI spike
- "Natural flavors" — vague, could be anything

SAFE / BENEFICIAL (always recognize these):
- Whole grains, oats, brown rice, quinoa, millets (ragi, jowar, bajra)
- Natural vitamins (Vitamin C/E/D/B12), minerals (Iron, Zinc, Calcium)
- Turmeric (curcumin) — anti-inflammatory
- Ginger, Ashwagandha, Amla, Tulsi — Ayurvedic benefits
- Fiber > 3g per 100g — good for digestion
- Probiotics (Lactobacillus, Bifidobacterium) — gut health
- Omega-3 fatty acids
- Natural preservatives: Vitamin E (tocopherol), rosemary extract

SCORING FORMULA (apply EXACTLY — same score for same product every time):
Start at 100.
Per HIGH severity red-flag ingredient: −20 points
Per MEDIUM severity ingredient: −10 points
Per LOW severity ingredient: −5 points
Per beneficial safe ingredient: +3 points (max +15 bonus)
Clamp final score: min 5, max 100.
scoreLabel: 80–100 = EXCELLENT, 60–79 = GOOD, 40–59 = MODERATE, 0–39 = POOR

SUITABILITY FLAGS (derive from ingredients — never guess):
diabetic: false → if contains: sugar, glucose, fructose, corn syrup, HFCS, maltose, dextrose, honey, jaggery, condensed milk, white flour/maida
vegan: false → if contains: milk, cream, butter, ghee, whey, casein, lactose, eggs, gelatin, honey, L-cysteine (E920), cochineal/carmine (E120), shellac (E904), beeswax
glutenFree: false → if contains: wheat, barley, rye, malt, oats (unless certified GF), semolina, atta, maida
lactoseFree: false → if contains: milk, cream, butter, ghee, whey, casein, lactose, cheese, yogurt, paneer
nutFree: false → if contains: peanut, almond, cashew, walnut, pistachios, hazelnut, pecan, macadamia, pine nut, or "may contain nuts"

ALTERNATIVES must be REAL Indian brands/products that are actually healthier:
- Instead of Lay's: Baked Kurkure Puffcorn, Makhana snacks, Roasted chana, Yogabar Munch
- Instead of Maggi: Saffola Masala Oats, Brown rice noodles, Bambino whole wheat vermicelli
- Instead of sugary juice: Raw Pressery cold press juice, B Natural juice (no added sugar)
- Instead of biscuits: Digestive Marie, McVitie's Digestive, Nutri Choice Hi-Fiber
- Instead of instant noodles: Hakka noodles with vegetables, Whole wheat pasta
- For cosmetics: suggest clinically tested, paraben-free Indian alternatives

OUTPUT LANGUAGE: The "summary", "whatIsItGoodFor", "whatToAvoid", "funFact", "safetyTip" must be written in plain, friendly language that a 16-year-old Indian user can understand. Avoid technical jargon. Use relatable comparisons (e.g., "This has as much sugar as 4 teaspoons").

CRITICAL RULES:
1. NEVER fabricate ingredients not visible on the label. 
2. NEVER score a product without reading its actual ingredient list.
3. If the image is blurry or unreadable, set productName = "Label Unreadable" and overallScore = 0.
4. CONSISTENCY IS PARAMOUNT: Focus specifically on the ingredient list block. Ignore dates, weights, or manufacturing details when categorizing.
5. ALWAYS be deterministic — same label = same JSON output every single time. 
6. Respond ONLY with valid JSON. No markdown, no explanation outside JSON.`;

// ── JSON Schema Template ──────────────────────────────────────────────────────
const JSON_SCHEMA = `{
  "productName": "exact brand name from label, e.g. 'Maggi 2-Minute Noodles Masala' or 'Label Unreadable'",
  "productCategory": "Food|Cosmetic|Supplement|Household|Beverage|Snack|Dairy|Personal Care",
  "brand": "brand name only, e.g. 'Nestle'",
  "overallScore": 0,
  "scoreLabel": "EXCELLENT|GOOD|MODERATE|POOR",
  "totalIngredients": 0,
  "extractedText": "full verbatim text read from the label",
  "comparisonSummary": null,
  "redFlagIngredients": [
    {
      "name": "common name, e.g. 'MSG'",
      "technicalName": "chemical/E-code name, e.g. 'Monosodium Glutamate (E621)'",
      "reason": "why exactly this is flagged in 1 sentence",
      "severity": "HIGH|MEDIUM|LOW",
      "healthEffect": "specific health effect, e.g. 'Can trigger headaches, sweating, and chest pain in sensitive individuals'",
      "expandedDetail": "2-3 sentences with scientific context. Include which country has banned or restricted it if applicable."
    }
  ],
  "warningIngredients": [
    {
      "name": "ingredient name",
      "reason": "brief concern in plain language",
      "severity": "MEDIUM|LOW"
    }
  ],
  "safeIngredients": [
    {
      "name": "ingredient name",
      "benefit": "specific health benefit, e.g. 'Oats provide 4g of beta-glucan fiber per serving, which reduces LDL cholesterol'"
    }
  ],
  "greenwashingAlerts": [
    {
      "claim": "exact claim from front label, e.g. 'No Added Sugar'",
      "reality": "what the ingredients actually show",
      "isDeceptive": true
    }
  ],
  "suitableFor": {
    "diabetic": true,
    "vegan": true,
    "glutenFree": true,
    "lactoseFree": true,
    "nutFree": true
  },
  "nutritionHighlights": "1-2 sentence summary of the most important nutrition numbers visible on the label (calories, sugar, sodium, protein, fat per serving). If nutrition table not visible, say 'Nutrition table not visible on label.'",
  "whatIsItGoodFor": "Tell the user specifically what this product is good for in plain language. List real benefits with context. E.g. 'Rich in iron — good for preventing anaemia, especially for women. Has Vitamin B12 which most vegetarians lack. Good source of calcium for bone strength.' If nothing beneficial, say 'This product has no significant nutritional benefits.'",
  "whatToAvoid": "Tell the user specifically why they should limit or avoid this product. Be direct. E.g. 'Very high in sodium — one serving contains 40% of your daily salt limit. Contains refined flour (maida) which spikes blood sugar quickly. Not suitable for daily consumption.' If safe, say 'No major concerns for healthy adults in moderate amounts.'",
  "summary": "2-3 sentence honest verdict in friendly language an Indian teenager would understand. Be specific — mention the product name and its key risk/benefit. No vague statements.",
  "alternatives": [
    "Specific real Indian product name + why it's better, e.g. 'Saffola Masala Oats — same convenience but with oats, much lower sodium'",
    "Another real alternative"
  ],
  "funFact": "One genuinely interesting, verifiable, India-relevant fact about a key ingredient. E.g. 'Turmeric in this product contains curcumin, which has been used in Ayurveda for 4,000 years. Modern studies show it reduces inflammation as effectively as ibuprofen in some cases.'",
  "safetyTip": "One specific, actionable tip for the user. Not generic. E.g. 'If you eat this daily, pair it with a glass of buttermilk — the probiotics help counter the preservatives effects on your gut.'",
  "regionalExplanations": {
    "Hinglish": "2 sentence verdict in Hinglish — natural mix of Hindi + English as Indian youth speak. E.g. 'Yeh product mein bahut zyada MSG hai bhai, jo headaches aur bloating cause kar sakta hai. Kabhi kabhi theek hai, but daily mat khao.'",
    "Hindi": "2 sentence verdict in proper Hindi",
    "Bengali": "2 sentence verdict in Bengali",
    "Telugu": "2 sentence verdict in Telugu",
    "Marathi": "2 sentence verdict in Marathi",
    "Tamil": "2 sentence verdict in Tamil",
    "Gujarati": "2 sentence verdict in Gujarati",
    "Kannada": "2 sentence verdict in Kannada",
    "Malayalam": "2 sentence verdict in Malayalam"
  }
}`;

// ── Vision Analysis (main entry point) ───────────────────────────────────────
export const analyzeImageWithGroq = async (
    base64Image,
    userProfile,
    language = 'English',
    frontLabelBase64 = null
) => {
    const profileStr = userProfile?.filters
        ? `User health profile: ${JSON.stringify(userProfile.filters)}. Flag any ingredients that conflict with these filters specifically.`
        : 'No specific health filters set.';

    const comparisonMode = frontLabelBase64
        ? `TWO images provided: Image 1 = FRONT LABEL (claims/marketing). Image 2 = BACK LABEL (actual ingredients list). You MUST compare both and detect any greenwashing or misleading claims.`
        : `ONE image provided: product label with ingredients list.`;

    const weatherContext = await fetchWeatherContext();

    const systemPrompt = `${MASTER_SYSTEM_PROMPT}

${profileStr}
${comparisonMode}
${weatherContext}`;

    const userContent = [
        {
            type: 'text',
            text: `CRITICAL INSTRUCTION: You MUST carefully extract all the text from the image label, especially the INGREDIENTS list. Do not be lazy. Read it word by word. If you skip the ingredients, the analysis will fail. 

After reading the label, return ONLY this JSON (no other text, no explanations):
${JSON_SCHEMA}`
        },
        {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }
    ];

    if (frontLabelBase64) {
        userContent.push({
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${frontLabelBase64}` }
        });
    }

    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: VISION_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
            ],
            temperature: 0, // Set to 0 for absolute determinism in analysis
            seed: 42,
            max_tokens: 4096
        })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

    const content = data.choices?.[0]?.message?.content || '';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Better JSON extraction to avoid strict matching failures
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) {
        throw new Error('AI failed to read image clearly. Try zooming in on the ingredients and ensure good lighting.');
    }

    const result = JSON.parse(cleaned.substring(startIndex, endIndex + 1));

    // Cache by extracted text fingerprint for next scan of same product
    if (result.extractedText && result.productName !== 'Label Unreadable') {
        const key = makeCacheKey(result.extractedText);
        await cacheScan(key, result);
    }

    return result;
};

// ── Text-only Analysis (fallback) ─────────────────────────────────────────────
export const analyzeIngredients = async (
    extractedText,
    userProfile,
    language = 'English',
    frontLabelText = null
) => {
    // Check cache first
    const key = makeCacheKey(extractedText);
    const cached = await getCachedScan(key);
    if (cached) {
        console.log('⚡ Cache hit:', cached.productName);
        return cached;
    }

    const profileStr = userProfile?.filters
        ? `User health profile: ${JSON.stringify(userProfile.filters)}`
        : 'No specific health profile.';

    const labelText = frontLabelText
        ? `FRONT LABEL CLAIMS:\n"${frontLabelText}"\n\nBACK LABEL INGREDIENTS:\n"${extractedText}"\n\nCompare both for greenwashing.`
        : `INGREDIENTS TEXT:\n"${extractedText}"`;

    const weatherContext = await fetchWeatherContext();

    const userPrompt = `Analyze this Indian product label:

${labelText}

${profileStr}
Response Language: ${language}
${weatherContext}

Apply the MASTER_SYSTEM_PROMPT rules precisely. Return ONLY this JSON:
${JSON_SCHEMA}`;

    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: CHAT_MODEL,
            messages: [
                { role: 'system', content: MASTER_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0,
            seed: 42,
            max_tokens: 4096
        })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const content = data.choices?.[0]?.message?.content || '';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Better JSON extraction
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) {
        throw new Error('AI analysis failed. Please try again.');
    }

    const result = JSON.parse(cleaned.substring(startIndex, endIndex + 1));

    await cacheScan(key, result);
    return result;
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const sendChatMessage = async (messages, productContext, language = 'English') => {
    const { extractedText, regionalExplanations, ...lightContext } = productContext || {};

    const langNote = language === 'Hinglish'
        ? `Respond in Hinglish — natural mix of Hindi + English the way Indian youth talk. Be warm, friendly, and use "bhai/yaar" occasionally.`
        : `Always respond in ${language}.`;

    const systemPrompt = `You are Truthify AI — a friendly, knowledgeable product safety expert for Indian consumers.
You have already analyzed this product. Use this data to answer questions:
${JSON.stringify(lightContext, null, 2)}

Rules:
- Be specific and factual — never make up data not in the product context above.
- Use relatable Indian examples and comparisons.
- ${langNote}
- Keep answers concise but complete. Use bullet points for lists.
- If asked something not related to the product, politely redirect.
- Use emojis sparingly to make it friendly.`;

    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: CHAT_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.slice(-12)
            ],
            temperature: 0.5,
            max_tokens: 800
        })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || 'Sorry, I could not respond.';
};

// ── Quick Ingredient Lookup ────────────────────────────────────────────────────
export const lookupIngredient = async (ingredientName) => {
    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: CHAT_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are a food science expert specializing in Indian food products and FSSAI regulations.
Give concise, factual, India-relevant ingredient information.
Always mention: 1) what it is, 2) why it's used, 3) any health concerns, 4) FSSAI/global regulatory status.`
                },
                {
                    role: 'user',
                    content: `Explain the ingredient "${ingredientName}" in 4-5 sentences. Is it safe? Is it banned anywhere? What does it do to your body? Be direct and factual.`
                }
            ],
            temperature: 0,
            max_tokens: 350
        })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || '';
};
