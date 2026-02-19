import { ref, onUnmounted } from 'vue';

export function useAudioVisualizer() {
    const audioContext = ref(null);
    const analyser = ref(null);
    const dataArray = ref(null);
    const animationId = ref(null);
    const isActive = ref(false);

    const startAnalysis = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
            analyser.value = audioContext.value.createAnalyser();
            const source = audioContext.value.createMediaStreamSource(stream);

            source.connect(analyser.value);
            analyser.value.fftSize = 256;

            const bufferLength = analyser.value.frequencyBinCount;
            dataArray.value = new Uint8Array(bufferLength);
            isActive.value = true;

            return dataArray.value;
        } catch (err) {
            console.error('Error accessing microphone:', err);
            return null;
        }
    };

    const stopAnalysis = () => {
        isActive.value = false;
        if (animationId.value) {
            cancelAnimationFrame(animationId.value);
        }
        if (audioContext.value) {
            audioContext.value.close();
        }
    };

    onUnmounted(() => {
        stopAnalysis();
    });

    return {
        startAnalysis,
        stopAnalysis,
        analyser,
        dataArray,
        isActive
    };
}
