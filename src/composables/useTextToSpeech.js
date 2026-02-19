import { ref } from 'vue';

const isSpeaking = ref(false);
const voices = ref([]);
const selectedVoice = ref(null);

const loadVoices = () => {
    voices.value = window.speechSynthesis.getVoices();
    if (voices.value.length > 0 && !selectedVoice.value) {
        // Prefer English voices
        selectedVoice.value = voices.value.find(v => v.lang.startsWith('en')) || voices.value[0];
    }
};

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

const speak = (text) => {
    if (!text) return;

    // Cancel current speech if any
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice.value) {
        utterance.voice = selectedVoice.value;
    }

    utterance.onstart = () => {
        isSpeaking.value = true;
    };

    utterance.onend = () => {
        isSpeaking.value = false;
    };

    utterance.onerror = (event) => {
        console.error('TTS Error:', event);
        isSpeaking.value = false;
    };

    window.speechSynthesis.speak(utterance);
};

const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
};

export function useTextToSpeech() {
    return {
        isSpeaking,
        speak,
        stopSpeaking,
        voices,
        selectedVoice
    };
}
