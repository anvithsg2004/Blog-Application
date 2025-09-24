export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { contentToSummarize } = JSON.parse(event.body);

        if (!contentToSummarize) {
            return { statusCode: 400, body: JSON.stringify({ error: 'No content provided for summarization.' }) };
        }

        const HF_API_KEY = process.env.VITE_HF_API_KEY;
        if (!HF_API_KEY) {
            throw new Error("Hugging Face API key is not configured.");
        }

        const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: contentToSummarize,
                parameters: { min_length: 50, max_length: 1000, do_sample: false },
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
            body: JSON.stringify({ error: error.message || 'Failed to fetch summary.' }),
        };
    }
};