import { VISION_API_KEY } from '../config/apiKeys';

export const extractTextFromImage = async (base64Image) => {
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;
    const body = {
        requests: [{
            image: { content: base64Image },
            features: [
                { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
                { type: 'TEXT_DETECTION', maxResults: 1 }
            ],
            imageContext: { languageHints: ['en', 'hi', 'mr', 'ta', 'te', 'bn'] }
        }]
    };
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.responses[0]?.fullTextAnnotation?.text ||
        data.responses[0]?.textAnnotations?.[0]?.description || '';
};
