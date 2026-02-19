import { ref } from 'vue';

const apiKey = ref(import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('openrouter_api_key') || '');
const openRouterModel = ref(localStorage.getItem('openrouter_model') || 'meta-llama/llama-3.3-70b-instruct:free');
const error = ref(null);
const loading = ref(false);

const setOpenRouterKey = (key) => {
    apiKey.value = key;
    localStorage.setItem('openrouter_api_key', key);
};

const setOpenRouterModel = (model) => {
    openRouterModel.value = model;
    localStorage.setItem('openrouter_model', model);
};

const chatOpenRouter = async (prompt, history = [], systemPrompt = '') => {
    if (!apiKey.value) {
        error.value = 'OpenRouter API Key is missing';
        return null;
    }
    loading.value = true;
    error.value = null;

    try {
        const messages = [
            ...history.map(msg => ({
                role: msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            })),
            { role: "user", content: prompt }
        ];

        // Prepend system prompt if provided
        if (systemPrompt) {
            messages.unshift({ role: "system", content: systemPrompt });
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey.value}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'SpeakSmart',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": openRouterModel.value,
                "messages": messages
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `OpenRouter Error ${response.status}`);
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

export function useOpenRouter() {
    return {
        apiKey,
        setOpenRouterKey,
        openRouterModel,
        setOpenRouterModel,
        error,
        loading,
        chatOpenRouter
    };
}
