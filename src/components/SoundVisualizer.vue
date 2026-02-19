<template>
  <div class="visualizer-container" :class="{ 'active': isListening }">
    <canvas ref="canvasRef" width="300" height="60" class="visualizer-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useAudioVisualizer } from '../composables/useAudioVisualizer';

const props = defineProps({
  isListening: Boolean
});

const canvasRef = ref(null);
const { startAnalysis, stopAnalysis, analyser, dataArray, isActive } = useAudioVisualizer();
let animationId = null;

const draw = () => {
  if (!isActive.value || !canvasRef.value) return;
  
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  analyser.value.getByteFrequencyData(dataArray.value);
  
  ctx.clearRect(0, 0, width, height);
  
  const barWidth = (width / dataArray.value.length) * 2.5;
  let barHeight;
  let x = 0;
  
  for (let i = 0; i < dataArray.value.length; i++) {
    barHeight = (dataArray.value[i] / 255) * height;
    
    // Create a gradient for each bar
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#ec4899');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    
    x += barWidth + 1;
  }
  
  animationId = requestAnimationFrame(draw);
};

watch(() => props.isListening, async (val) => {
  if (val) {
    await startAnalysis();
    draw();
  } else {
    stopAnalysis();
    if (animationId) cancelAnimationFrame(animationId);
    // Clear canvas
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    }
  }
});

onUnmounted(() => {
  stopAnalysis();
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<style scoped>
.visualizer-container {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  margin: 1rem 0;
}

.visualizer-container.active {
  opacity: 1;
}

.visualizer-canvas {
  width: 100%;
  height: 100%;
}
</style>
