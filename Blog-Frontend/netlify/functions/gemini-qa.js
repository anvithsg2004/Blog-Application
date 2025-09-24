// netlify/functions/gemini-qa.js
import { getGeminiKey, corsHeaders, extractGeminiText } from './_utils.js';

const ORIGIN = 'https://aidenblog.netlify.app';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

export const handler = async (event) => {
    const headers = corsHeaders(ORIGIN);

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    const API_KEY = getGeminiKey();
    if (!API_KEY) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'GEMINI_API_KEY missing',
                hint: 'Set GEMINI_API_KEY in Netlify env vars (Functions scope) and redeploy.',
            }),
        };
    }

    try {
        const { question, context } = JSON.parse(event.body || '{}');
        if (!question || !context) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing question or context' }),
            };
        }

        const sys =
            'Answer the user question strictly and only from the provided context text. If the answer is not present in the context, reply exactly: "Not found in blog." Keep the answer concise.';

        const body = {
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `${sys}\n\nCONTEXT:\n${context}\n\nQUESTION:\n${question}`,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.2,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 512,
            },
        };

        const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': API_KEY,
                },
                body: JSON.stringify(body),
            }
        );

        const text = await resp.text();
        let json = {};
        try {
            json = JSON.parse(text);
        } catch { }

        if (!resp.ok) {
            const code = json?.error?.code || resp.status;
            const msg = json?.error?.message || 'Upstream error';
            if (code === 401 || code === 403) {
                return {
                    statusCode: code,
                    headers,
                    body: JSON.stringify({
                        error: 'Unauthorized with Gemini',
                        detail: msg,
                        hint: 'Verify GEMINI_API_KEY and API access in Google AI Studio.',
                    }),
                };
            }
            if (code === 429) {
                return {
                    statusCode: 429,
                    headers,
                    body: JSON.stringify({
                        error: 'Rate limit reached',
                        detail: msg,
                    }),
                };
            }
            return {
                statusCode: code,
                headers,
                body: JSON.stringify({ error: msg }),
            };
        }

        const answer = extractGeminiText(json) || 'Not found in blog.';
        return {
            statusCode: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer }),
        };
    } catch (e) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Q&A failed', detail: String(e) }),
        };
    }
};
