import { ref } from 'vue';

const isListening = ref(false);
const transcript = ref('');
const interimResults = ref('');
const error = ref(null);

let recognition = null;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

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
        startListening,
        stopListening
    };
}
