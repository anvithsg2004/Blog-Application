// netlify/functions/gemini-summarize.js
import { getGeminiKey, corsHeaders, extractGeminiText } from './_utils.js';

const ORIGIN = 'https://aidenblog.netlify.app';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'; // fast & good for summaries

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
        const { inputs, parameters } = JSON.parse(event.body || '{}');
        if (!inputs || typeof inputs !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid inputs' }),
            };
        }

        const minLen = parameters?.min_length ?? 50;
        const maxLen = parameters?.max_length ?? 1000;

        const systemInstr =
            'You are a concise technical summarizer. Summarize the following blog post for a general developer audience. Keep it faithful, well-structured, and under the requested length.';

        const body = {
            contents: [
                { role: 'user', parts: [{ text: `${systemInstr}\n\nCONTENT:\n${inputs}` }] },
            ],
            generationConfig: {
                temperature: 0.3,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: Math.max(128, Math.min(2048, maxLen + 200)),
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

        const summary = extractGeminiText(json);
        if (!summary) {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: 'Empty response from Gemini' }),
            };
        }

        // Match your existing UI contract
        return {
            statusCode: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify([{ summary_text: summary }]),
        };
    } catch (e) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Summarization failed', detail: String(e) }),
        };
    }
};
