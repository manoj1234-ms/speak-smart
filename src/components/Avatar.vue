<template>
  <div class="avatar-container glass-panel">
    <svg viewBox="0 0 200 200" class="avatar-svg" :class="{ 'speaking': isSpeaking }">
      <!-- Glow Filter -->
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
      </defs>

      <!-- Pulse Effect when Listening -->
      <circle v-if="status === 'listening'" cx="100" cy="100" r="90" fill="none" stroke="#6366f1" stroke-width="2" opacity="0.5">
        <animate attributeName="r" from="80" to="95" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
      </circle>

      <!-- Face Base -->
      <circle cx="100" cy="100" r="80" fill="url(#faceGradient)" filter="url(#glow)" />

      <!-- Scanning Beam -->
      <rect v-if="status === 'thinking' || status === 'evaluating'" x="20" y="20" width="160" height="2" fill="#6366f1" opacity="0.8" class="scan-beam" />
      
      <!-- Eyes Group -->
      <g class="eyes">
        <g class="eye left" transform="translate(70, 90)">
          <!-- Sclera -->
          <ellipse cx="0" cy="0" rx="12" ry="14" fill="white" />
          <!-- Pupil -->
          <circle cx="0" cy="0" r="5" fill="#1e293b">
            <animate v-if="status === 'thinking'" attributeName="cy" values="0;-3;0;3;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <!-- Eyelid (Blink) -->
          <rect x="-15" y="-15" width="30" height="30" fill="#4f46e5" class="eyelid" />
        </g>
        <g class="eye right" transform="translate(130, 90)">
          <ellipse cx="0" cy="0" rx="12" ry="14" fill="white" />
          <circle cx="0" cy="0" r="5" fill="#1e293b">
            <animate v-if="status === 'thinking'" attributeName="cy" values="0;-3;0;3;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <rect x="-15" y="-15" width="30" height="30" fill="#4f46e5" class="eyelid" />
        </g>
      </g>

      <!-- Mouth -->
      <path :d="mouthPath" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" class="mouth">
        <animate v-if="isSpeaking" attributeName="d" 
          values="M 70 145 Q 100 155 130 145; M 70 140 Q 100 170 130 140; M 70 145 Q 100 155 130 145" 
          dur="0.4s" repeatCount="indefinite" />
      </path>
    </svg>
    <div class="status-indicator" :class="status">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: 'idle', // idle, listening, thinking, correct, incorrect
    required: true
  },
  isSpeaking: {
    type: Boolean,
    default: false
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'listening': return 'Listening...';
    case 'thinking': return 'Thinking...';
    case 'correct': return 'Great Job!';
    case 'incorrect': return 'Try Again';
    default: return 'Ready';
  }
});

const mouthPath = computed(() => {
  if (props.isSpeaking) {
    // Animate via CSS or just return open shape
    // Wait, simple computed logic for mouth shape
    return "M 70 140 Q 100 160 130 140"; // Open Smile
  }
  
  switch (props.status) {
    case 'correct':
      return "M 60 140 Q 100 170 140 140"; // Big Smile
    case 'incorrect':
      return "M 70 150 Q 100 140 130 150"; // Frown
    case 'thinking':
      return "M 80 150 Q 100 150 120 150"; // Flat line (O shape if small)
    case 'listening':
      return "M 70 145 Q 100 155 130 145"; // Soft Smile
    default: // idle
      return "M 70 145 Q 100 155 130 145";
  }
});

</script>

<style scoped>
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  width: 300px;
  max-width: 100%;
  transition: transform 0.3s ease;
}

.avatar-svg {
  width: 200px;
  height: 200px;
  filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.3));
}

.eyelid {
  animation: blink 4s infinite;
  transform-origin: center;
  transform: scaleY(0); /* Default open */
}

@keyframes blink {
  0%, 90%, 100% { height: 0; y: 0; }
  95% { height: 30px; y: -15px; }
}

.scan-beam {
  filter: drop-shadow(0 0 5px #6366f1);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { y: 30; }
  100% { y: 170; }
}

.status-indicator {
  margin-top: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  opacity: 0.8;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(0,0,0,0.2);
}

.status-indicator.listening { color: var(--color-primary); border: 1px solid var(--color-primary); }
.status-indicator.thinking { color: var(--color-warning); border: 1px solid var(--color-warning); }
.status-indicator.correct { color: var(--color-success); border: 1px solid var(--color-success); }
.status-indicator.incorrect { color: var(--color-error); border: 1px solid var(--color-error); }

</style>
