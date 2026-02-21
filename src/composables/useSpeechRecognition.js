
import { ref } from 'vue';

const isListening = ref(false);
const transcript = ref('');
const interimResults = ref('');
const error = ref(null);
const language = ref(localStorage.getItem('speech_lang') || 'en-US');

let recognition = null;

// Detect mobile for better compatibility settings
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

const initRecognition = () => {
    if (recognition) return recognition;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        // Settings for mobile reliability
        recognition.continuous = !isMobile;
        recognition.interimResults = true;
        recognition.lang = language.value;

        recognition.onstart = () => {
            isListening.value = true;
            error.value = null;
            console.log('Recognition Started');
        };

        recognition.onresult = (event) => {
            let final = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                transcript.value = (transcript.value + ' ' + final).trim();
            }
            interimResults.value = interim;
        };

        recognition.onerror = (event) => {
            console.error('Recognition Error:', event.error);
            if (event.error === 'no-speech') {
                // Ignore no-speech error on mobile
                return;
            }
            error.value = event.error;
            isListening.value = false;
        };

        recognition.onend = () => {
            console.log('Recognition Ended');
            isListening.value = false;
        };

        return recognition;
    } else {
        error.value = 'Speech recognition not supported';
        return null;
    }
};

const setLanguage = (lang) => {
    language.value = lang;
    localStorage.setItem('speech_lang', lang);
    if (recognition) {
        recognition.lang = lang;
    }
};

const startListening = () => {
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        error.value = 'Mic requires HTTPS';
        return;
    }

    const reco = initRecognition();
    if (reco && !isListening.value) {
        transcript.value = '';
        interimResults.value = '';

        // Re-apply current language right before starting
        reco.lang = language.value;

        try {
            reco.start();
        } catch (e) {
            console.error('Start failed:', e);
            // If already started, just ignore
            if (e.name !== 'InvalidStateError') {
                error.value = 'Mic failed to start';
            }
        }
    }
};

const stopListening = () => {
    if (recognition) {
        recognition.stop();
        isListening.value = false;
    }
};

export function useSpeechRecognition() {
    return {
        isListening,
        transcript,
        interimResults,
        error,
        language,
        isIOS,
        setLanguage,
        startListening,
        stopListening
    };
}
