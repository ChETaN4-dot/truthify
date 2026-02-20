import { GROQ_API_KEY } from './secrets';

export const analyzeProduct = async (claim, ingredientsList) => {
    // ingredientsList is an array of strings
    const ingredientsText = ingredientsList.join(", ");

    if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY") {
        console.warn("Missing Groq API Key, using mock fallback logic.");
        // ... insert fallback logic or just error ...
        // For this refactor, I will copy the previous logic as fallback, 
        // but the request is for REAL AI.
        return mockAnalyze(claim, ingredientsList);
    }

    const prompt = `
    You are a food safety expert. Analyze the following product ingredients and front label claim.
    
    Product Claim: "${claim}"
    Ingredients: "${ingredientsText}"
    
    Task:
    1. Identify harmful ingredients (Risk: High/Moderate/Environmental).
    2. Detect greenwashing (mismatch between claim and ingredients).
    3. Provide a health score (0-100).
    4. Provide explanation in English and Hindi.
    5. Suggest a cleaner alternative if score < 60.

    Return ONLY a JSON object with this structure:
    {
      "flagged": [
        { "name": "Ingredient Name", "data": { "risk": "Level", "reason": "Reason", "category": "Category" } }
      ],
      "deceptionAlert": boolean,
      "deceptionReason": "Reason",
      "explanationEn": "English explanation",
      "explanationHi": "Hindi explanation",
      "score": number
    }
  `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                model: "llama3-70b-8192",
                temperature: 0.5,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result;

    } catch (error) {
        console.error("AI Error:", error);
        return mockAnalyze(claim, ingredientsList);
    }
};

// Fallback Mock Logic
const mockAnalyze = (claim, ingredients) => {
    // Re-importing hardcoded data if needed, but for now just simple logic
    // Copying previous logic for safety
    const flagged = [];
    let deceptionAlert = false;
    let deceptionReason = "";

    // Simple mock detection for demo continuity if API fails
    const mockRisks = {
        "Sugar": { risk: "High", reason: "Diabetes risk", category: "Sweetener" },
        "Palm Oil": { risk: "Environmental", reason: "Deforestation", category: "Oil" },
        "Sodium Benzoate": { risk: "Moderate", reason: "Hyperactivity", category: "Preservative" }
    };

    ingredients.forEach(ing => {
        const key = Object.keys(mockRisks).find(k => ing.toLowerCase().includes(k.toLowerCase()));
        if (key) {
            flagged.push({ name: ing, data: mockRisks[key] });
        }
    });

    if (claim.toLowerCase().includes('natural') && flagged.length > 0) {
        deceptionAlert = true;
        deceptionReason = "Claim says natural but contains additives.";
    }

    return {
        flagged,
        deceptionAlert,
        deceptionReason,
        explanationEn: "Fallback analysis (API Error). Ingredients checked against local list.",
        explanationHi: "API Error. Ye fallback analysis hai.",
        score: Math.max(0, 100 - (flagged.length * 20))
    };
};
