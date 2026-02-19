<template>
  <button 
    class="mic-button btn" 
    :class="{ 'listening': isListening, 'minimal': minimal }"
    @click="$emit('toggle')"
    :title="isListening ? 'Stop Listening' : 'Start Listening'"
  >
    <div class="mic-icon">
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
        <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Z"/>
      </svg>
    </div>
    <span v-if="!minimal">{{ isListening ? 'Listening...' : 'Speak' }}</span>
    <div v-if="isListening" class="pulse-ring"></div>
  </button>
</template>

<script setup>
defineProps({
  isListening: Boolean,
  minimal: Boolean
});
defineEmits(['toggle']);
</script>

<style scoped>
.mic-button {
  background: var(--color-primary);
  border: none;
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.mic-button.minimal {
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  justify-content: center;
  box-shadow: none;
}

.mic-button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5);
}

.mic-button.listening {
  background: var(--color-error);
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: inherit;
  border: 4px solid rgba(255, 255, 255, 0.3);
  animation: pulse 1.5s infinite;
  pointer-events: none;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}
</style>
