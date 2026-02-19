<template>
  <div v-if="corrections && corrections.length > 0" class="correction-card glass-panel">
    <div class="correction-header">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="var(--color-primary)" />
      </svg>
      <h3>Grammar Check</h3>
    </div>
    
    <div class="correction-content">
      <div v-for="(correction, index) in corrections" :key="index" class="correction-item">
        <p class="mistake-context">
          ...{{ getContextSnippet(correction) }}...
        </p>
        <div class="fix-box">
          <span class="bad-text">{{ getErrorText(correction) }}</span>
          <span class="arrow">→</span>
          <span class="good-text">{{ correction.replacements[0] || '?' }}</span>
        </div>
        <p class="explanation">{{ correction.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  originalText: { type: String, required: true },
  corrections: { type: Array, default: () => [] }
});

const getContextSnippet = (correction) => {
  // Simple snippet around the error
  const start = Math.max(0, correction.offset - 10);
  const end = Math.min(props.originalText.length, correction.offset + correction.length + 10);
  return props.originalText.slice(start, end);
};

const getErrorText = (correction) => {
  return props.originalText.slice(correction.offset, correction.offset + correction.length);
};
</script>

<style scoped>
.correction-card {
  margin-top: 1rem;
  border: 1px solid rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.05);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.correction-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--color-warning);
}

.correction-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--color-warning);
}

.correction-header h3 {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 800;
  margin: 0;
}

.correction-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.correction-item {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.mistake-context {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  margin-bottom: 0.5rem;
  opacity: 0.7;
}

.fix-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(0,0,0,0.3);
  border-radius: 6px;
}

.bad-text {
  color: #fb7185;
  text-decoration: underline wavy #f43f5e;
  font-weight: 700;
}

.arrow {
  color: var(--color-text-muted);
  font-size: 1.2rem;
}

.good-text {
  color: #34d399;
  font-weight: 800;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
  padding: 0.1rem 0.4rem;
  background: rgba(52, 211, 153, 0.1);
  border-radius: 4px;
}

.explanation {
  font-size: 0.85rem;
  color: var(--color-text);
  line-height: 1.4;
  margin-top: 0.5rem;
  padding-left: 0.25rem;
  border-left: 2px solid rgba(255,255,255,0.1);
}
</style>
