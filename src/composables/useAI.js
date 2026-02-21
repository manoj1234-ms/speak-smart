
import { ref, computed } from 'vue';
import { useGemini } from './useGemini';
import { useOpenRouter } from './useOpenRouter';
import { useOllama } from './useOllama';
import { useSarvam } from './useSarvam';

export function useAI() {
    const { chat: chatGemini, evaluateCode: evalGemini, apiKey: geminiKey, geminiModel, setGeminiModel } = useGemini();
    const { chatOpenRouter, apiKey: openRouterKey } = useOpenRouter();
    const { chatOllama, ollamaModel } = useOllama();
    const { chat: chatSarvam, apiKey: sarvamKey } = useSarvam();

    const preferredProvider = ref(localStorage.getItem('preferred_ai_provider') || 'auto');

    const setPreferredProvider = (provider) => {
        preferredProvider.value = provider;
        localStorage.setItem('preferred_ai_provider', provider);
    };

    const activeProvider = computed(() => {
        if (preferredProvider.value !== 'auto') return preferredProvider.value;
        const available = [];
        if (geminiKey.value) available.push('Gemini');
        if (sarvamKey.value) available.push('Sarvam');
        if (openRouterKey.value) available.push('OpenRouter');
        available.push('Ollama');
        return 'Auto (' + (available[0] || 'None') + ')';
    });

    const chat = async (prompt, history = [], systemPrompt = '') => {
        let lastError = null;

        // 1. Try Preferred first if set
        if (preferredProvider.value === 'Gemini' && geminiKey.value) {
            try { return await chatGemini(prompt, history, systemPrompt); } catch (e) { lastError = e; }
        } else if (preferredProvider.value === 'Sarvam' && sarvamKey.value) {
            try { return await chatSarvam(prompt, history, systemPrompt); } catch (e) { lastError = e; }
        } else if (preferredProvider.value === 'Ollama' && ollamaModel.value) {
            try { return await chatOllama(prompt, history, systemPrompt); } catch (e) { lastError = e; }
        } else if (preferredProvider.value === 'OpenRouter' && openRouterKey.value) {
            try { return await chatOpenRouter(prompt, history, systemPrompt); } catch (e) { lastError = e; }
        }

        // 2. Fallback / Auto-Logic
        if (geminiKey.value) {
            try {
                const response = await chatGemini(prompt, history, systemPrompt);
                if (response) return response;
            } catch (e) {
                lastError = e;
                // Gemini Flash Fallback
                if (e.status === 429 && geminiModel.value !== 'gemini-2.5-flash') {
                    const originalModel = geminiModel.value;
                    setGeminiModel('gemini-2.5-flash');
                    try {
                        const res = await chatGemini(prompt, history, systemPrompt);
                        setGeminiModel(originalModel);
                        return res;
                    } catch (e2) {
                        setGeminiModel(originalModel);
                        lastError = e2;
                    }
                }
            }
        }

        if (sarvamKey.value) {
            try {
                const response = await chatSarvam(prompt, history, systemPrompt);
                if (response) return response;
            } catch (e) {
                lastError = e;
            }
        }

        try {
            const response = await chatOllama(prompt, history, systemPrompt);
            if (response) return response;
        } catch (e) {
            lastError = e;
        }

        if (openRouterKey.value) {
            try {
                const response = await chatOpenRouter(prompt, history, systemPrompt);
                if (response) return response;
            } catch (e) {
                lastError = e;
            }
        }

        const providerMsg = lastError ? `(${lastError.message})` : '(No active keys)';
        throw new Error(`AI Offline: ${providerMsg}`);
    };

    const evaluateCode = async (code, explanation, problemDescription, mode = 'friendly') => {
        // Priority: Gemini -> OpenRouter -> Bytez
        let lastError = null;

        if (geminiKey.value) {
            try {
                return await evalGemini(code, explanation, problemDescription, mode);
            } catch (e) {
                console.warn('Gemini eval failed, falling back to chat...', e);
                lastError = e;
            }
        }

        const isInterview = mode === 'interview';
        const personality = isInterview
            ? "You are a senior technical interviewer at a FAANG company. Be rigorous, professional, and slightly critical. Focus on edge cases and deep optimization."
            : "You are a friendly coding tutor. Be encouraging and clear.";

        const prompt = `
      ${personality}
      I am solving a coding problem: ${problemDescription}
      Here is my code:
      ${code}
      
      Here is my verbal explanation of the approach:
      "${explanation}"
      
      Please evaluate:
      1. Correctness of code.
      2. Clarity of explanation.
      3. Any improvements or bugs.
      4. Complexity analysis.
      
      Structure your response with markdown.
    `;

        try {
            return await chat(prompt, []);
        } catch (e) {
            throw new Error('Evaluation failed across all providers: ' + e.message);
        }
    };

    const fixCode = async (code, error, problemDescription) => {
        const prompt = `
      I am solving a coding problem: ${problemDescription}
      
      My code:
      ${code}
      
      The execution error:
      ${error}
      
      Please fix the code to resolve the error. 
      Return ONLY the fixed code block. No explanation.
    `;
        try {
            const response = await chat(prompt, []);
            // Extract code block if wrapped
            const match = response.match(/```(?:\w+)?\n([\s\S]*?)```/);
            return match ? match[1].trim() : response.trim();
        } catch (e) {
            throw new Error('Fix failed: ' + e.message);
        }
    };

    return {
        chat,
        evaluateCode,
        fixCode,
        activeProvider,
        preferredProvider,
        setPreferredProvider
    };
}
