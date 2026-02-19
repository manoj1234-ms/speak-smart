<template>
  <div class="english-mode">
    <div class="split-layout">
      <!-- Left Panel: Host & Live Feedback -->
      <div class="host-panel glass-panel">
        <div class="panel-inner">
          <div class="avatar-container">
            <Avatar :status="avatarStatus" :isSpeaking="isSpeaking" />
            <SoundVisualizer :isListening="isListening" />
          </div>
          
          <div class="live-status">
            <div class="config-card glass-panel">
              <div class="config-header">
                <span class="icon">⚙️</span>
                <h4>Mission Config</h4>
              </div>
              <div class="selectors-row">
                <div class="scenario-selector">
                  <label>Scenario</label>
                  <select v-model="selectedScenarioId" class="scenario-select">
                    <option v-for="s in scenarios" :key="s.id" :value="s.id">
                      {{ s.icon }} {{ s.title }}
                    </option>
                  </select>
                </div>

                <div class="tone-selector">
                  <label>AI Tone</label>
                  <select v-model="selectedTone" class="scenario-select">
                    <option value="friendly">😊 Friendly</option>
                    <option value="professional">💼 Professional</option>
                    <option value="tough">🔥 Tough</option>
                  </select>
                </div>
              </div>

              <div class="selectors-row second-row">
                <div class="provider-selector">
                  <label>AI Brain</label>
                  <select v-model="preferredProvider" class="scenario-select">
                    <option value="auto">🤖 Auto-Smart</option>
                    <option value="Gemini">💎 Gemini</option>
                    <option value="Ollama">🏠 Ollama</option>
                    <option value="OpenRouter">🌐 OpenRouter</option>
                  </select>
                </div>
                
                <div class="model-selector" v-if="preferredProvider === 'Ollama' || preferredProvider === 'auto'">
                  <label>Ollama Model</label>
                  <select v-model="ollamaModel" class="scenario-select">
                    <option v-for="m in availableOllamaModels" :key="m.name" :value="m.name">
                      {{ m.name.split(':')[0] }}
                    </option>
                    <option v-if="availableOllamaModels.length === 0" value="llama3">llama3</option>
                  </select>
                </div>

                <div class="model-selector" v-if="preferredProvider === 'Gemini'">
                  <label>Gemini Model</label>
                  <select v-model="geminiModel" class="scenario-select">
                    <option value="gemini-2.5-flash">2.5 Flash (Stable)</option>
                    <option value="gemini-2.5-pro">2.5 Pro (Stable)</option>
                    <option value="gemini-3-flash-preview">3.0 Flash</option>
                    <option value="gemini-3-pro-preview">3.0 Pro</option>
                    <option value="gemini-3.1-pro-preview">3.1 Pro</option>
                  </select>
                </div>

                <div class="model-selector" v-if="preferredProvider === 'OpenRouter'">
                  <label>OR Model</label>
                  <select v-model="openRouterModel" class="scenario-select">
                    <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (GPT-4 Free)</option>
                    <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free)</option>
                    <option value="mistralai/devstral-2-7b-instruct:free">Devstral 2 (Coding)</option>
                    <option value="openrouter/free">Auto-Free</option>
                  </select>
                </div>
              </div>

              <div class="ollama-status-tiny" :class="{ online: ollamaOnline }">
                <span class="status-dot"></span>
                {{ activeProvider }}
              </div>
            </div>

            <div class="status-indicator" :class="avatarStatus">
              <span class="dot"></span>
              {{ statusMessage }}
            </div>
            
            <div v-if="isListening || (transcript && transcript.length > 0)" class="live-transcript">
               <p class="transcript-label">I'm listening...</p>
               <div class="transcript-box">
                 <p class="transcript-text">{{ transcript || '...' }}</p>
               </div>
            </div>
            
            <WordOfTheDay />

            <div v-if="speechError" class="error-msg">
              <span class="emoji">⚠️</span> {{ speechError }}
            </div>
          </div>

          <div class="mic-controls">
            <div class="mic-row">
              <MicButton :isListening="isListening" @toggle="toggleListening" minimal />
              <div class="mic-texts">
                <span class="mic-label">{{ isListening ? 'Listening...' : 'Ready to Speak' }}</span>
                <p class="mic-hint">{{ isListening ? 'Click to finish' : 'Tap to start' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Conversation History & Corrections -->
      <div class="chat-panel glass-panel">
        <div class="panel-header">
          <div class="header-left">
            <span class="icon">💬</span>
            <h3>Practice History</h3>
          </div>
          <div class="header-actions">
            <button @click="generateSessionReport" class="btn-finish" v-if="messages.length > 3">
              🎯 Finish
            </button>
            <button @click="showWordBank = !showWordBank" class="btn-wordbank">
              📚 Word Bank ({{ savedWords.length }})
            </button>
            <button @click="clearHistory" class="btn-clear" v-if="messages.length > 0">
              Clear
            </button>
          </div>
        </div>

        <div v-if="sessionReport" class="report-overlay">
          <div class="report-card glass-panel">
            <div class="report-header">
              <h3>Practice Mission Report</h3>
              <button @click="sessionReport = null" class="btn-close">×</button>
            </div>
            <div class="report-body" v-html="formattedReport"></div>
            <div class="report-footer">
               <button class="btn btn-primary" @click="sessionReport = null; clearHistory()">New Mission</button>
            </div>
          </div>
        </div>

        <div v-if="showWordBank" class="wordbank-overlay glass-panel">
           <div class="wordbank-header">
             <h3>My Word Bank</h3>
             <button @click="showWordBank = false" class="btn-close">×</button>
           </div>
           <div class="wordbank-list">
             <div v-if="savedWords.length === 0" class="empty-words">No words saved yet. Click the 🔖 on AI messages!</div>
             <div v-for="(word, i) in savedWords" :key="i" class="word-item">
               <span>{{ word }}</span>
               <button @click="removeWord(i)" class="btn-remove">×</button>
             </div>
           </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="hero-icon">🗣️</div>
            <h3>Ready to practice?</h3>
            <p>Tap the microphone or type below to start. I'll listen, reply, and help you with your grammar!</p>
            <button class="btn btn-primary start-btn" @click="toggleListening">
              <span class="emoji">🎙️</span> Start Speaking
            </button>
          </div>
          
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            class="message-wrapper" 
            :class="msg.role"
          >
            <div class="message-bubble">
              {{ msg.content }}
              <button 
                v-if="msg.role === 'assistant'" 
                class="btn-save-word" 
                @click="saveWord(msg.content)"
                title="Save to Word Bank"
              >
                🔖
              </button>
            </div>
            
            <CorrectionCard 
              v-if="msg.role === 'user' && msg.corrections && msg.corrections.length" 
              :originalText="msg.content" 
              :corrections="msg.corrections" 
              class="correction-card"
            />
          </div>
          
          <div v-if="loading" class="message-wrapper assistant loading">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Chat Input Area -->
        <div class="chat-footer">
          <div class="input-container">
            <input 
              v-model="userInputText" 
              type="text" 
              placeholder="Type your message here..." 
              @keyup.enter="submitText"
              class="chat-input"
            />
            <div class="input-actions">
              <MicButton :isListening="isListening" @toggle="toggleListening" minimal />
              <button @click="submitText" class="btn-send" :disabled="!userInputText.trim()">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { marked } from 'marked';
import Avatar from './Avatar.vue';
import MicButton from './MicButton.vue';
import SoundVisualizer from './SoundVisualizer.vue';
import WordOfTheDay from './WordOfTheDay.vue';
import CorrectionCard from './CorrectionCard.vue';
import { useSpeechRecognition } from '../composables/useSpeechRecognition';
import { useAI } from '../composables/useAI';
import { useTextToSpeech } from '../composables/useTextToSpeech';
import { useGrammarCheck } from '../composables/useGrammarCheck';
import { useOllama } from '../composables/useOllama';
import { useGemini } from '../composables/useGemini';
import { useOpenRouter } from '../composables/useOpenRouter';
import scenariosData from '../data/scenarios.json';

const { isListening, transcript, startListening, stopListening, error: speechError } = useSpeechRecognition();
const { chat, preferredProvider, activeProvider } = useAI();
const { speak, isSpeaking, stopSpeaking } = useTextToSpeech();
const { checkGrammar } = useGrammarCheck();

const { geminiModel } = useGemini();
const { openRouterModel } = useOpenRouter();

const scenarios = ref(scenariosData);
const selectedScenarioId = ref('general');
const selectedTone = ref('friendly');
const currentScenario = computed(() => scenarios.value.find(s => s.id === selectedScenarioId.value));

const { ollamaModel, checkOllamaStatus, getAvailableModels } = useOllama();
const ollamaOnline = ref(false);
const availableOllamaModels = ref([]);

const refreshOllamaStatus = async () => {
  ollamaOnline.value = await checkOllamaStatus();
  if (ollamaOnline.value) {
    availableOllamaModels.value = await getAvailableModels();
  }
};

onMounted(() => {
  refreshOllamaStatus();
});

const systemPrompt = computed(() => {
  if (!currentScenario.value) return "You are a friendly AI English tutor.";
  
  const base = currentScenario.value.prompt;
  let toneInstruction = '';
  if (selectedTone.value === 'professional') {
    toneInstruction = " Use a formal, professional tone.";
  } else if (selectedTone.value === 'tough') {
    toneInstruction = " Use a tough, critical tone. Focus on correcting mistakes strictly.";
  } else {
    toneInstruction = " Use a friendly, encouraging tone.";
  }
  return base + toneInstruction;
});

// Word Bank Logic
const showWordBank = ref(false);
const savedWords = ref(JSON.parse(localStorage.getItem('speaksmart_wordbank') || '[]'));

const saveWord = (text) => {
  if (!savedWords.value.includes(text)) {
    savedWords.value.push(text);
    localStorage.setItem('speaksmart_wordbank', JSON.stringify(savedWords.value));
    alert('Added to Word Bank!');
  }
};

const removeWord = (index) => {
  savedWords.value.splice(index, 1);
  localStorage.setItem('speaksmart_wordbank', JSON.stringify(savedWords.value));
};

// Session Report Logic
const sessionReport = ref(null);
const formattedReport = ref('');

const generateSessionReport = async () => {
  loading.value = true;
  avatarStatus.value = 'thinking';
  
  const historyText = messages.value
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');
    
  const prompt = `
    Please provide a "Practice Mission Report" for the following conversation:
    ${historyText}
    
    The report should include:
    1. **Overview**: How the conversation went.
    2. **Strengths**: What the user did well.
    3. **Areas for Improvement**: Specific grammar or vocabulary tips.
    4. **Vocabulary Boost**: 3 new words they could have used.
    
    Keep it encouraging and use markdown formatting.
  `;
  
  try {
    const response = await chat(prompt, [], "You are a specialized English proficiency analyzer.");
    if (response) {
      sessionReport.value = response;
      formattedReport.value = await marked.parse(response);
    }
  } catch (err) {
    alert("Report generation failed: " + err.message);
  } finally {
    loading.value = false;
    avatarStatus.value = 'idle';
  }
};

// Load messages from local storage if available
const savedMessages = localStorage.getItem('speaksmart_history');
const messages = ref(savedMessages ? JSON.parse(savedMessages) : []);
const avatarStatus = ref('idle');
const messagesContainer = ref(null);
const loading = ref(false);

const userInputText = ref('');

const submitText = () => {
  if (userInputText.value.trim()) {
    stopSpeaking();
    handleUserInput(userInputText.value);
    userInputText.value = '';
  }
};

const statusMessage = ref('Press the mic to start conversation.');

// Watchers and Logic
watch(messages, (newVal) => {
  localStorage.setItem('speaksmart_history', JSON.stringify(newVal));
  scrollToBottom();
}, { deep: true });

watch(isListening, (newVal) => {
  if (newVal) {
    statusMessage.value = 'Listening...';
    avatarStatus.value = 'listening';
    stopSpeaking(); 
  } else {
    if (transcript.value.trim()) {
      handleUserInput(transcript.value);
    } else {
      statusMessage.value = 'Waiting for you...';
      avatarStatus.value = 'idle';
    }
  }
});

watch(isSpeaking, (newVal) => {
  if (!newVal && !isListening.value) {
    avatarStatus.value = 'idle';
  }
});

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const handleUserInput = async (text) => {
  loading.value = true;
  statusMessage.value = 'Thinking...';
  avatarStatus.value = 'thinking';
  
  const corrections = await checkGrammar(text);
  
  messages.value.push({
    role: 'user',
    content: text,
    corrections: corrections
  });
  scrollToBottom();

  try {
    const response = await chat(text, messages.value.slice(0, -1), systemPrompt.value);
    if (response) {
      messages.value.push({
        role: 'assistant',
        content: response
      });
      avatarStatus.value = 'speaking';
      speak(response);
      statusMessage.value = 'I am speaking...';
    }
  } catch (err) {
    statusMessage.value = 'Error: ' + err.message;
    avatarStatus.value = 'incorrect';
  } finally {
    loading.value = false;
    if (avatarStatus.value === 'thinking') avatarStatus.value = 'idle';
  }
  
  scrollToBottom();
};

const toggleListening = () => {
  if (isListening.value) {
    stopListening();
  } else {
    transcript.value = ''; 
    startListening();
  }
};

const clearHistory = () => {
  if (confirm('Clear conversation history?')) {
    messages.value = [];
    localStorage.removeItem('speaksmart_history');
    greet();
  }
};

const greet = () => {
  if (messages.value.length === 0) {
    const msg = "Hi there! I'm your English practice assistant. How can I help you improve your speaking today?";
    messages.value.push({
      role: 'assistant',
      content: msg
    });
    speak(msg);
    avatarStatus.value = 'speaking';
  }
};

onMounted(() => {
  scrollToBottom();
  setTimeout(greet, 1000);
});
</script>

<style scoped>
.english-mode {
  height: 100%; /* Fill the flex container */
  display: flex;
  flex-direction: column;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden; 
}

.split-layout {
  display: grid;
  grid-template-columns: 320px 1fr; /* Slimmer left panel */
  gap: 1rem;
  height: 100%;
  overflow: hidden; /* Ensure layout itself doesn't overflow */
}

/* Host Panel */
.host-panel {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--glass-border);
  overflow-y: auto; /* Allow scrolling if content exceeds height */
}

.panel-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.avatar-container {
  margin-top: 0.25rem;
  flex-shrink: 0;
  transform: scale(0.9); /* Slightly smaller avatar */
}

.live-status {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}

.config-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.config-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 0.5rem;
  margin-bottom: 0.25rem;
}

.config-header h4 {
  margin: 0;
  font-weight: 700;
}

.selectors-row {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.scenario-selector, .tone-selector {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.scenario-selector label, .tone-selector label {
  font-size: 0.6rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.scenario-select {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid var(--glass-border);
  color: white;
  padding: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.second-row {
  margin-top: 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 0.5rem;
}

.provider-selector, .model-selector {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.provider-selector label, .model-selector label {
  font-size: 0.6rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.ollama-status-tiny {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.6rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 1rem;
}

.ollama-status-tiny .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
}

.ollama-status-tiny.online {
  color: #10b981;
}

.ollama-status-tiny.online .status-dot {
  background: #10b981;
  box-shadow: 0 0 5px #10b981;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-muted);
  justify-content: center;
  flex-shrink: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
}

.status-indicator.listening .dot { background: var(--color-error); box-shadow: 0 0 10px var(--color-error); }
.status-indicator.speaking .dot { background: var(--color-primary); box-shadow: 0 0 10px var(--color-primary); }
.status-indicator.thinking .dot { background: var(--color-accent); animation: pulse 1s infinite; }

.live-transcript {
  background: rgba(0,0,0,0.3);
  border-radius: var(--radius-lg);
  padding: 1rem;
  width: 100%;
  border: 1px solid rgba(255,255,255,0.05);
  overflow-y: auto;
  max-height: 180px; /* More compact */
  flex-shrink: 0;
}

.transcript-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.transcript-text {
  font-size: 1rem;
  line-height: 1.4;
  color: white;
  min-height: 3rem;
  font-style: italic;
}

.mic-controls {
  margin-top: auto;
  padding: 0.75rem;
  width: 100%;
  background: rgba(99, 102, 241, 0.1);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.mic-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mic-texts {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.mic-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
}

.mic-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* Chat Panel */
.chat-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.2);
}

.panel-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* Prevent header from shrinking */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon { font-size: 1.25rem; }

.btn-clear {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.btn-clear:hover { color: var(--color-error); }

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  /* Premium Scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 10px;
  border: 2px solid transparent;
}

.message-wrapper {
  max-width: 85%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-wrapper.user { align-self: flex-end; align-items: flex-end; }
.message-wrapper.assistant { align-self: flex-start; align-items: flex-start; }

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.user .message-bubble {
  background: var(--color-primary);
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.assistant .message-bubble {
  background: var(--color-bg-secondary);
  border: 1px solid var(--glass-border);
  border-bottom-left-radius: 0.25rem;
}

.correction-card {
  width: 100%;
}

.empty-state {
  margin: auto;
  text-align: center;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.hero-icon { font-size: 4rem; opacity: 0.5; }

.start-btn {
  margin-top: 1rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: var(--radius-full);
}

.chat-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--glass-border);
  background: rgba(15, 23, 42, 0.3);
  flex-shrink: 0; /* Prevent footer from shrinking */
}

.input-container {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-lg);
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--glass-border);
  gap: 0.75rem;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 0.5rem;
}

.chat-input:focus {
  outline: none;
  box-shadow: none;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-send {
  background: var(--color-primary);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-send:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: scale(1.05);
}

.btn-send:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 1rem 1.25rem;
  background: var(--color-bg-secondary);
  border-radius: 1.25rem;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--color-text-muted);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

/* Word Bank Styles */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-finish {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  transition: all 0.2s;
}

.btn-finish:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

.btn-wordbank {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-wordbank:hover {
  background: rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

.wordbank-overlay {
  position: absolute;
  top: 60px;
  right: 1.25rem;
  width: 280px;
  max-height: 400px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  padding: 1rem;
  border: 1px solid var(--color-primary);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.wordbank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.5rem;
}

.wordbank-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-words {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: center;
  padding: 1rem 0;
}

.word-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.3);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.btn-remove {
  background: transparent;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.btn-save-word {
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  font-size: 1.1rem;
}

.message-wrapper.assistant:hover .btn-save-word {
  opacity: 1;
  right: -25px;
}

.message-bubble {
  position: relative;
}
/* Report Overlay */
.report-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.report-card {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid var(--color-primary);
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.3);
  display: flex;
  flex-direction: column;
  padding: 0;
}

.report-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-body {
  padding: 2rem;
  overflow-y: auto;
  line-height: 1.6;
  font-size: 1rem;
}

.report-body h1, .report-body h2, .report-body h3 {
  color: var(--color-primary);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.report-body p {
  margin-bottom: 1rem;
  color: var(--color-text);
}

.report-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
  display: flex;
  justify-content: center;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}
@media (max-width: 768px) {
  .english-mode {
    height: 100%;
    padding: 0.25rem;
  }

  .split-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  
  .host-panel { 
    flex-shrink: 0;
    padding: 0.5rem; 
    border-bottom: 1px solid var(--glass-border);
    max-height: 35vh; /* Never take more than 35% of the screen */
    overflow-y: auto; /* Internal scroll for config if needed */
    background: rgba(15, 23, 42, 0.95);
    z-index: 10;
    /* Mini scrollbar for config */
    scrollbar-width: thin;
  }
  .host-panel::-webkit-scrollbar { width: 3px; }
  .host-panel::-webkit-scrollbar-thumb { background: var(--color-primary); }

  .chat-panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .panel-inner {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    justify-content: flex-start;
  }

  .avatar-container { 
    margin: 0;
    width: 70px;
    height: 70px;
    flex-shrink: 0;
    padding: 0.2rem;
  }

  /* Make sure the actual Avatar inside doesn't overflow */
  .avatar-container :deep(svg) {
    width: 60px;
    height: 60px;
  }

  .live-status {
    flex: 1;
    min-width: 0;
    gap: 0.3rem;
  }

  .config-card {
    padding: 0.3rem;
    gap: 0.2rem;
    background: rgba(255,255,255,0.03);
  }

  .config-header { display: none; }

  .selectors-row {
    flex-direction: row;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .selectors-row.second-row {
    margin: 0;
    padding: 0;
    border: none;
  }

  .scenario-selector, .tone-selector, .provider-selector, .model-selector {
    flex: 1;
    min-width: 0; /* Allow them to shrink as needed */
  }

  .scenario-select {
    padding: 0.2rem;
    font-size: 0.7rem;
    height: 30px;
  }

  .selectors-row label {
    font-size: 0.5rem;
    margin-bottom: 0.1rem;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto !important; /* Force scrollable */
    padding: 0.75rem 0.5rem;
    scrollbar-width: thin;
    scrollbar-color: var(--color-primary) rgba(255,255,255,0.05);
  }

  /* More visible scrollbar for mobile */
  .messages-container::-webkit-scrollbar {
    width: 5px;
    display: block !important;
  }
  .messages-container::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
  }
  .messages-container::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.02);
  }

  .mic-controls { display: none; }
  .message-wrapper { max-width: 92%; }
  .btn-wordbank, .btn-finish { font-size: 0.6rem; padding: 0.15rem 0.3rem; }

  .chat-footer {
    padding: 0.5rem 0.75rem;
    background: rgba(10, 15, 30, 0.95);
    border-top: 1px solid var(--glass-border);
  }

  .input-container {
    padding: 0.3rem 0.5rem;
    gap: 0.4rem;
  }

  .chat-input {
    font-size: 0.85rem;
    padding: 0.3rem;
  }

  .btn-send {
    width: 35px;
    height: 35px;
  }
}
</style>
