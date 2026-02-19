import { ref } from 'vue';

const ollamaUrl = ref(localStorage.getItem('ollama_url') || 'http://localhost:11434');
const ollamaModel = ref(localStorage.getItem('ollama_model') || 'llama3');
const error = ref(null);
const loading = ref(false);

const setOllamaConfig = (url, model) => {
    ollamaUrl.value = url;
    ollamaModel.value = model;
    localStorage.setItem('ollama_url', url);
    localStorage.setItem('ollama_model', model);
};

// Try Ollama on any device — works on PC if OLLAMA_ORIGINS is set on Ollama
// Silently fails on mobile/remote devices without Ollama
const checkOllamaStatus = async () => {
    try {
        const response = await fetch(`${ollamaUrl.value}/api/tags`, { signal: AbortSignal.timeout(2000) });
        return response.ok;
    } catch {
        return false; // Silently fail — no CORS error shown
    }
};

const getAvailableModels = async () => {
    try {
        const response = await fetch(`${ollamaUrl.value}/api/tags`, { signal: AbortSignal.timeout(2000) });
        if (!response.ok) return [];
        const data = await response.json();
        return data.models || [];
    } catch {
        return []; // Silently fail — Ollama not available on this device
    }
};

const chatOllama = async (prompt, history = [], systemPrompt = '') => {
    loading.value = true;
    error.value = null;

    try {
        // Auto-check for models if not set
        if (!ollamaModel.value) {
            const models = await getAvailableModels();
            if (models.length > 0) {
                // Try to find llama3 or just pick the first one
                const preferred = models.find(m => m.name.includes('llama3')) || models[0];
                ollamaModel.value = preferred.name;
                localStorage.setItem('ollama_model', preferred.name);
            } else {
                throw new Error('Ollama is running but no models are downloaded. Run "ollama pull llama3"');
            }
        }

        const messages = [];

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }

        history.forEach(msg => {
            messages.push({
                role: msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            });
        });

        messages.push({ role: 'user', content: prompt });

        const response = await fetch(`${ollamaUrl.value}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: ollamaModel.value,
                messages: messages,
                stream: false
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Ollama Error (${response.status}): ${errText || response.statusText}`);
        }

        const data = await response.json();
        return data.message.content;

    } catch (err) {
        console.error('Ollama Error:', err);
        error.value = err.message;
        throw err;
    } finally {
        loading.value = false;
    }
};

export function useOllama() {
    return {
        ollamaUrl,
        ollamaModel,
        setOllamaConfig,
        checkOllamaStatus,
        getAvailableModels,
        error,
        loading,
        chatOllama
    };
}
