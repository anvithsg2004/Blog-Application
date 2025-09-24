// netlify/functions/_utils.js
export function getGeminiKey() {
    const k = process.env.GEMINI_API_KEY;
    return k && typeof k === 'string' ? k.trim() : '';
}

export function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin':
            process.env.NODE_ENV === 'production' ? origin : '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

// Extract plain text from Gemini REST generateContent response
export function extractGeminiText(json) {
    try {
        const parts = json?.candidates?.[0]?.content?.parts || [];
        const text = parts
            .map((p) => (typeof p.text === 'string' ? p.text : ''))
            .join('')
            .trim();
        return text || '';
    } catch {
        return '';
    }
}
