
import { ref } from 'vue';

const isListening = ref(false);
const transcript = ref('');
const interimResults = ref('');
const error = ref(null);
const language = ref(localStorage.getItem('speech_lang') || 'en-US');

let recognition = null;

const setLanguage = (lang) => {
    language.value = lang;
    localStorage.setItem('speech_lang', lang);
    if (recognition) {
        recognition.lang = lang;
        console.log('Speech language set to:', lang);
    }
};

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language.value;

    recognition.onstart = () => {
        isListening.value = true;
        error.value = null;
    };

    recognition.onresult = (event) => {
        let final = '';
        let interim = '';

        for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
            } else {
                interim += event.results[i][0].transcript;
            }
        }

        transcript.value = final;
        interimResults.value = interim;
    };

    recognition.onend = () => {
        isListening.value = false;
    };

    recognition.onerror = (event) => {
        error.value = event.error;
        isListening.value = false;
    };
} else {
    error.value = 'Speech Recognition API not supported in this browser.';
}

const startListening = () => {
    if (recognition && !isListening.value) {
        transcript.value = '';
        interimResults.value = '';
        recognition.start();
    }
};

const stopListening = () => {
    if (recognition && isListening.value) {
        recognition.stop();
    }
};

export function useSpeechRecognition() {
    return {
        isListening,
        transcript,
        interimResults,
        error,
        language,
        setLanguage,
        startListening,
        stopListening
    };
}
