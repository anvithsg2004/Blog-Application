// netlify/functions/qa.js
export const handler = async (event) => {
    const ALLOWED_ORIGIN =
        process.env.NODE_ENV === 'production' ? 'https://aidenblog.netlify.app' : '*';

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const { question, context } = JSON.parse(event.body || '{}');
        if (!question || !context) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
                body: JSON.stringify({ error: 'Missing question or context' }),
            };
        }

        const payload = {
            inputs: { question, context },
            options: { wait_for_model: true },
        };

        const maxAttempts = 3;
        let attempt = 0;
        let lastText = '';
        while (attempt < maxAttempts) {
            const resp = await fetch(
                'https://api-inference.huggingface.co/models/deepset/roberta-base-squad2',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.HF_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            const text = await resp.text();
            lastText = text;

            if (resp.ok) {
                return {
                    statusCode: resp.status,
                    headers: {
                        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
                        'Content-Type': 'application/json',
                    },
                    body: text,
                };
            }

            if (resp.status === 503 || resp.status === 504) {
                let waitMs = 4000;
                try {
                    const j = JSON.parse(text);
                    if (j.estimated_time && Number.isFinite(j.estimated_time)) {
                        waitMs = Math.min(15000, Math.ceil(j.estimated_time * 1000));
                    }
                } catch { }
                await new Promise((r) => setTimeout(r, waitMs));
                attempt += 1;
                continue;
            }

            return {
                statusCode: resp.status,
                headers: {
                    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
                    'Content-Type': 'application/json',
                },
                body: text || JSON.stringify({ error: 'Upstream error' }),
            };
        }

        return {
            statusCode: 503,
            headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
            body: lastText || JSON.stringify({ error: 'Model loading timed out' }),
        };
    } catch (e) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
            body: JSON.stringify({ error: 'Q&A failed', detail: String(e) }),
        };
    }
};
