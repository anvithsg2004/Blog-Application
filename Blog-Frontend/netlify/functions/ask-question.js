export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { question, context } = JSON.parse(event.body);

        if (!question || !context) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Question and context are required.' }) };
        }

        // Securely access the API key
        const HF_API_KEY = process.env.VITE_HF_API_KEY;
        if (!HF_API_KEY) {
            throw new Error("Hugging Face API key is not configured.");
        }

        const response = await fetch('https://api-inference.huggingface.co/models/deepset/roberta-base-squad2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: {
                    question: question,
                    context: context,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Hugging Face API Error:', errorData);
            return { statusCode: response.status, body: errorData };
        }

        const result = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };

    } catch (error) {
        console.error('Proxy Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Failed to process the question.' }),
        };
    }
};