import { ref } from 'vue';

const apiKey = ref(import.meta.env.VITE_BYTEZ_API_KEY || localStorage.getItem('bytez_api_key') || '');
const error = ref(null);
const loading = ref(false);

const setBytezKey = (key) => {
    apiKey.value = key;
    localStorage.setItem('bytez_api_key', key);
};

const chatBytez = async (prompt, history = []) => {
    if (!apiKey.value) {
        error.value = 'Bytez API Key is missing';
        return null;
    }
    loading.value = true;
    error.value = null;

    try {
        // Using standard OpenAI compatible endpoint
        const response = await fetch('https://api.bytez.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey.value}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3-8b-instruct", // Providing a sensible default
                "messages": [
                    ...history.map(msg => ({
                        role: msg.role === 'model' ? 'assistant' : msg.role,
                        content: msg.content
                    })),
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Bytez API Error');
        }

        const data = await response.json();
        const text = data.choices[0]?.message?.content || '';
        return text;

    } catch (err) {
        error.value = err.message;
        return null;
    } finally {
        loading.value = false;
    }
};

export function useBytez() {
    return {
        apiKey,
        setBytezKey,
        error,
        loading,
        chatBytez
    };
}
