import { ref } from 'vue';

const loading = ref(false);
const error = ref(null);

const checkGrammar = async (text) => {
    if (!text) return [];
    loading.value = true;
    error.value = null;

    try {
        const params = new URLSearchParams({
            text: text,
            language: 'en-US'
        });

        // Using the public API endpoint - be aware of rate limits
        const response = await fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) throw new Error('Grammar check failed');

        const data = await response.json();
        loading.value = false;

        // Filter matches to just relevant corrections
        return data.matches.map(match => ({
            message: match.message,
            replacements: match.replacements.map(r => r.value).slice(0, 3) || [],
            offset: match.offset,
            length: match.length,
            context: match.context
        }));
    } catch (err) {
        console.error('Grammar check error:', err);
        error.value = err.message;
        loading.value = false;
        return [];
    }
};

export function useGrammarCheck() {
    return {
        checkGrammar,
        loading,
        error
    };
}
