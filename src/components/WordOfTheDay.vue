<template>
  <div class="word-of-day-card glass-panel" v-if="wordData">
    <div class="card-header">
      <span class="label">Word of the Day</span>
      <span class="icon">✨</span>
    </div>
    <div class="word-content">
      <h3 class="word">{{ wordData.word }}</h3>
      <span class="phonetic">/{{ wordData.phonetic }}/</span>
      <p class="definition">{{ wordData.definition }}</p>
      <div class="example">"{{ wordData.example }}"</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const wordData = ref(null);

const words = [
  {
    word: "Eloquence",
    phonetic: "ˈeləkwəns",
    definition: "Fluent or persuasive speaking or writing.",
    example: "She spoke with such eloquence that everyone was convinced."
  },
  {
    word: "Pragmatic",
    phonetic: "praɡˈmadik",
    definition: "Dealing with things sensibly and realistically.",
    example: "A pragmatic approach to politics is often better than an idealistic one."
  },
  {
    word: "Resilient",
    phonetic: "rəˈzil-yənt",
    definition: "Able to withstand or recover quickly from difficult conditions.",
    example: "The economy is surprisingly resilient despite the inflation."
  },
  {
    word: "Articulate",
    phonetic: "ärˈtikyələt",
    definition: "Having or showing the ability to speak fluently and coherently.",
    example: "An articulate account of their experiences."
  }
];

onMounted(() => {
  // Select a word based on current date so it changes daily
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  wordData.value = words[dayOfYear % words.length];
});
</script>

<style scoped>
.word-of-day-card {
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeIn 0.5s ease-out;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
}

.word {
  color: var(--color-primary);
  margin: 0.25rem 0;
  font-size: 1.2rem;
}

.phonetic {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.definition {
  font-size: 0.85rem;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.example {
  font-size: 0.8rem;
  border-left: 2px solid var(--color-accent);
  padding-left: 0.5rem;
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
