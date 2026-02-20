import { GROQ_API_KEY } from '../config/apiKeys';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'; // Groq vision model
const CHAT_MODEL = 'llama-3.3-70b-versatile';

// ── Vision OCR + Analysis (single call) ───────────────────────
export const analyzeImageWithGroq = async (base64Image, userProfile, language = 'English', frontLabelBase64 = null) => {
    const profileStr = JSON.stringify(userProfile?.filters || {});
    const langNote = language !== 'English' ? `Respond in ${language}.` : '';

    const comparisonInstruction = frontLabelBase64
        ? `You are given TWO images. Image 1 is the FRONT LABEL (marketing claims). Image 2 is the BACK LABEL (actual ingredients). Compare them carefully for greenwashing and deceptive claims.`
        : `You are given ONE image of a product label with ingredients.`;

    const systemPrompt = `You are Truthify AI — an expert product safety analyst. ${comparisonInstruction}
Extract ALL text from the label image(s), then analyze every ingredient for health risks, greenwashing, and suitability.
User health profile: ${profileStr}
${langNote}
CRITICAL: Respond with ONLY valid JSON. No markdown fences, no explanation outside JSON.`;

    const userContent = [
        {
            type: 'text',
            text: `Analyze this product label image and return ONLY this exact JSON structure:
{
  "productName": "string or 'Unknown Product'",
  "productCategory": "Food|Cosmetic|Supplement|Household",
  "overallScore": 75,
  "scoreLabel": "EXCELLENT|GOOD|MODERATE|POOR",
  "totalIngredients": 12,
  "extractedText": "the full raw text you read from the label",
  "comparisonSummary": "if two images provided: explain mismatches between front claims and actual ingredients, else null",
  "redFlagIngredients": [
    {"name":"","technicalName":"","reason":"","severity":"HIGH|MEDIUM|LOW","healthEffect":"","expandedDetail":""}
  ],
  "warningIngredients": [{"name":"","reason":"","severity":"MEDIUM"}],
  "safeIngredients": [{"name":"","benefit":""}],
  "greenwashingAlerts": [{"claim":"","reality":"","isDeceptive":true}],
  "suitableFor": {"diabetic":true,"vegan":false,"glutenFree":true,"lactoseFree":true,"nutFree":false},
  "summary": "2-3 sentence plain English verdict",
  "alternatives": ["string","string"],
  "funFact": "one interesting or surprising fact about a key ingredient",
  "safetyTip": "one actionable tip for the user based on this product",
  "regionalExplanations": {
    "Hinglish": "2 sentence explanation in colloquial Hinglish (Hindi + English mix, e.g., 'Yeh product health ke liye theek nahi hai')",
    "Hindi": "2 sentence explanation in Hindi",
    "Bengali": "2 sentence explanation in Bengali",
    "Telugu": "2 sentence explanation in Telugu",
    "Marathi": "2 sentence explanation in Marathi",
    "Tamil": "2 sentence explanation in Tamil",
    "Gujarati": "2 sentence explanation in Gujarati",
    "Kannada": "2 sentence explanation in Kannada",
    "Malayalam": "2 sentence explanation in Malayalam"
  }
}`
        },
        {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        }
    ];

    // If compare mode, add front label image too
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
            temperature: 0.1,
            max_tokens: 4000
        })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

    const content = data.choices?.[0]?.message?.content || '';
    // Strip any accidental markdown fences
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI returned invalid response. Please try again.');
    return JSON.parse(jsonMatch[0]);
};

// ── Text-only analysis (fallback if image is too large) ────────
export const analyzeIngredients = async (extractedText, userProfile, language = 'English', frontLabelText = null) => {
    const comparisonNote = frontLabelText
        ? `\nFRONT LABEL CLAIMS: "${frontLabelText}"\nBACK INGREDIENTS: "${extractedText}"\nCompare carefully for greenwashing.`
        : `\nINGREDIENTS TEXT: "${extractedText}"`;

    const userPrompt = `Analyze this product label:${comparisonNote}

User Health Profile: ${JSON.stringify(userProfile?.filters || {})}
Response Language: ${language}

Return ONLY this JSON:
{
  "productName": "string",
  "productCategory": "Food|Cosmetic|Supplement|Household",
  "overallScore": 75,
  "scoreLabel": "GOOD",
  "totalIngredients": 12,
  "extractedText": "${extractedText.slice(0, 200)}",
  "comparisonSummary": null,
  "redFlagIngredients": [{"name":"","technicalName":"","reason":"","severity":"HIGH|MEDIUM|LOW","healthEffect":"","expandedDetail":""}],
  "warningIngredients": [{"name":"","reason":"","severity":"MEDIUM"}],
  "safeIngredients": [{"name":"","benefit":""}],
  "greenwashingAlerts": [{"claim":"","reality":"","isDeceptive":true}],
  "suitableFor": {"diabetic":true,"vegan":false,"glutenFree":true,"lactoseFree":true,"nutFree":false},
  "summary": "2-3 sentence verdict",
  "alternatives": ["string"],
  "funFact": "one interesting fact about a key ingredient",
  "safetyTip": "one actionable tip",
  "regionalExplanations": {
    "Hinglish":"","Hindi":"","Bengali":"","Telugu":"","Marathi":"","Tamil":"","Gujarati":"","Kannada":"","Malayalam":""
  }
}`;

    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: CHAT_MODEL,
            messages: [
                { role: 'system', content: 'You are Truthify AI. Analyze ingredient lists. Respond ONLY with valid JSON.' },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 3500
        })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const content = data.choices?.[0]?.message?.content || '';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
};

// ── Chat ───────────────────────────────────────────────────────
export const sendChatMessage = async (messages, productContext, language = 'English') => {
    // Strip heavy fields to save tokens — keep core analysis fields only
    const { extractedText, regionalExplanations, ...lightContext } = productContext || {};

    const hinglishNote = language === 'Hinglish'
        ? `If the user asks in any language, respond in Hinglish — naturally mix Hindi and English (e.g., 'Yeh product health ke liye acha nahi hai, kyunki isme ${lightContext.redFlagIngredients?.[0]?.name || 'harmful ingredients'} hain').`
        : `Always respond in ${language}.`;

    const systemPrompt = `You are Truthify AI, a friendly and knowledgeable product safety expert.
Product analysis context: ${JSON.stringify(lightContext)}
Answer questions about this product's ingredients, health impacts, and alternatives.
Be conversational, helpful, and honest. Use emojis occasionally. ${hinglishNote}
Format with markdown where helpful (bold important terms, bullet points for lists).
If asked about ingredients not in this product, say so clearly.`;

    // Keep last 12 messages for context window efficiency
    const trimmed = messages.slice(-12);

    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: CHAT_MODEL,
            messages: [{ role: 'system', content: systemPrompt }, ...trimmed],
            temperature: 0.7,
            max_tokens: 800
        })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || 'Sorry, I could not respond.';
};

// ── Quick ingredient lookup ────────────────────────────────────
export const lookupIngredient = async (ingredientName) => {
    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: CHAT_MODEL,
            messages: [
                { role: 'system', content: 'You are a food science expert. Give concise, factual ingredient information.' },
                { role: 'user', content: `Tell me about the ingredient "${ingredientName}" in 3-4 sentences: what it is, common uses, and any health concerns. Be direct and factual.` }
            ],
            temperature: 0.3,
            max_tokens: 300
        })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || '';
};
