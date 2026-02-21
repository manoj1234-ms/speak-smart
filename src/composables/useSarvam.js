
import { ref, computed } from 'vue';

const apiKey = ref(localStorage.getItem('sarvam_api_key') || import.meta.env.VITE_SARVAM_API_KEY || '');

export function useSarvam() {
    const isTranslating = ref(false);
    const isSpeaking = ref(false);

    const setApiKey = (key) => {
        apiKey.value = key;
        localStorage.setItem('sarvam_api_key', key);
    };

    /**
     * Translate text to/from Indic languages
     * @param {string} text 
     * @param {string} sourceLanguageCode (e.g., 'en-IN', 'hi-IN')
     * @param {string} targetLanguageCode (e.g., 'hi-IN', 'en-IN')
     */
    const translate = async (text, sourceLanguageCode = 'en-IN', targetLanguageCode = 'hi-IN') => {
        if (!apiKey.value) throw new Error('Sarvam API key not set');

        isTranslating.value = true;
        try {
            const response = await fetch('https://api.sarvam.ai/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': apiKey.value
                },
                body: JSON.stringify({
                    input: text,
                    source_language_code: sourceLanguageCode,
                    target_language_code: targetLanguageCode,
                    speaker_gender: 'Female', // Default
                    mode: 'formal'
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Translation failed');
            }

            const data = await response.json();
            return data.translated_text;
        } finally {
            isTranslating.value = false;
        }
    };

    /**
     * Convert text to speech using Sarvam (Bulbul)
     * @param {string} text 
     * @param {string} languageCode (e.g., 'hi-IN')
     */
    const textToSpeech = async (text, languageCode = 'hi-IN') => {
        if (!apiKey.value) throw new Error('Sarvam API key not set');

        isSpeaking.value = true;
        try {
            const response = await fetch('https://api.sarvam.ai/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': apiKey.value
                },
                body: JSON.stringify({
                    inputs: [text],
                    target_language_code: languageCode,
                    speaker: 'meera', // Popular female voice
                    pitch: 0,
                    pace: 1.0,
                    loudness: 1.5,
                    speech_sample_rate: 8000,
                    enable_preprocessing: true,
                    model: 'bulbul:v1'
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'TTS failed');
            }

            const data = await response.json();
            if (data.audios && data.audios.length > 0) {
                const audioBase64 = data.audios[0];
                const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
                audio.onended = () => { isSpeaking.value = false; };
                audio.play();
                return audio;
            }
        } catch (e) {
            isSpeaking.value = false;
            throw e;
        }
    };

    const chat = async (prompt, history = [], systemPrompt = '') => {
        if (!apiKey.value) throw new Error('Sarvam API key not set');

        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        history.forEach(m => messages.push({ role: m.role, content: m.content }));
        messages.push({ role: 'user', content: prompt });

        try {
            const response = await fetch('https://api.sarvam.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': apiKey.value
                },
                body: JSON.stringify({
                    model: 'sarvam-m',
                    messages: messages
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Chat failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (e) {
            console.error("Sarvam Chat Error:", e);
            throw e;
        }
    };

    return {
        apiKey,
        setApiKey,
        chat,
        translate,
        textToSpeech,
        isTranslating,
        isSpeaking
    };
}
