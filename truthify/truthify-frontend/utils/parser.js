import { GOOGLE_VISION_API_KEY } from './secrets';

export const scanProduct = async (base64Image) => {
    if (!GOOGLE_VISION_API_KEY || GOOGLE_VISION_API_KEY === "YOUR_GOOGLE_VISION_API_KEY") {
        console.warn("Missing Google Vision API Key");
        // Fallback for demo if key is missing
        return "Ingredients: Sugar, Sodium Benzoate, Artificial Flavor, Palm Oil, Citric Acid";
    }

    try {
        const body = {
            requests: [
                {
                    image: {
                        content: base64Image,
                    },
                    features: [
                        {
                            type: "TEXT_DETECTION",
                            maxResults: 1,
                        },
                    ],
                },
            ],
        };

        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        const result = await response.json();

        if (result.responses && result.responses[0].fullTextAnnotation) {
            return result.responses[0].fullTextAnnotation.text;
        } else {
            throw new Error("No text found");
        }
    } catch (error) {
        console.error("OCR Error:", error);
        alert("OCR Failed: " + error.message);
        return "";
    }
};

export const parseIngredients = (text) => {
    if (!text) return [];
    // Basic heuristic to find ingredients block
    // This is a simple parser; real world would be more complex regex
    return text.split(/,|;|\n/).map(item => item.trim()).filter(i => i.length > 0);
};
