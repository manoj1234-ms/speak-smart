<template>
  <div class="app-container">
    <header class="main-header glass glass-panel" :class="{ 'menu-open': mobileMenuOpen }">
      <div class="header-top">
        <div class="logo-section">
          <div class="logo">
            <LogoIcon />
            <h1>SpeakSmart</h1>
          </div>
          <div class="streak-badge">
            🔥 {{ streak }} <span>Days</span>
          </div>
        </div>
        
        <div class="header-right">
          <button class="menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </button>
        </div>
      </div>
      
      <nav class="mode-switcher" @click="mobileMenuOpen = false">
        <button 
          class="nav-item" 
          :class="{ active: currentMode === 'english' }"
          @click="currentMode = 'english'"
        >
          🗣️ English
        </button>
        <button 
          class="nav-item" 
          :class="{ active: currentMode === 'coding' }"
          @click="currentMode = 'coding'"
        >
          💻 Coding
        </button>
      </nav>
    </header>

    <main class="content-area">
      <div v-if="!hasApiKey" class="api-key-modal glass-panel">
        <h2>Welcome to SpeakSmart</h2>
        <p>Enter keys for maximum uptime (auto-switching):</p>
        
        <div class="api-inputs">
          <div class="input-group">
             <label>Cloud Providers (Optional)</label>
             <input v-model="inputGemini" type="password" placeholder="Gemini API Key" class="api-input" />
             <div class="model-row" v-if="inputGemini.trim()">
               <select v-model="inputGeminiModel" class="api-input model-select">
               <option value="gemini-2.5-flash">Gemini 2.5 Flash (Stable Free)</option>
               <option value="gemini-2.5-pro">Gemini 2.5 Pro (Standard Stable)</option>
               <option value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</option>
               <option value="gemini-3-pro-preview">Gemini 3 Pro (Preview)</option>
               <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (New Preview)</option>
               </select>
             </div>
             <input v-model="inputOpenRouter" type="password" placeholder="OpenRouter Key" class="api-input" />
             <div class="model-row" v-if="inputOpenRouter.trim()">
                <select v-model="inputOpenRouterModel" class="api-input model-select">
                  <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (GPT-4 Level Free)</option>
                  <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash Free (Fastest)</option>
                  <option value="mistralai/devstral-2-7b-instruct:free">Devstral 2 (Coding Specialist)</option>
                  <option value="openrouter/free">Auto-Free Router (Intelligent Pick)</option>
                </select>
             </div>
          </div>
          
           <div class="input-group">
             <label>Local AI (Ollama)</label>
             <div class="row">
               <input v-model="inputOllamaUrl" type="text" placeholder="URL (Default: http://localhost:11434)" class="api-input" />
               <select v-model="inputOllamaModel" class="api-input model-select">
                 <!-- Live models from Ollama (when CORS works / on localhost) -->
                 <template v-if="availableOllamaModels.length > 0">
                   <option v-for="m in availableOllamaModels" :key="m.name" :value="m.name">
                     {{ m.name }} ({{ (m.size / (1024*1024*1024)).toFixed(1) }}GB)
                   </option>
                 </template>
                 <!-- Popular preset models (fallback when CORS blocks fetch) -->
                 <template v-else>
                   <optgroup label="⭐ Popular Models">
                     <option value="llama3.1:latest">llama3.1 (Latest)</option>
                     <option value="llama3:latest">llama3 (Stable)</option>
                     <option value="llama3.2:latest">llama3.2</option>
                     <option value="mistral:latest">Mistral 7B</option>
                     <option value="mistral-nemo:latest">Mistral Nemo</option>
                     <option value="gemma3:latest">Gemma 3</option>
                     <option value="gemma2:latest">Gemma 2</option>
                     <option value="phi4:latest">Phi-4</option>
                     <option value="phi3:latest">Phi-3</option>
                     <option value="qwen2.5:latest">Qwen 2.5</option>
                   </optgroup>
                   <optgroup label="💻 Coding Models">
                     <option value="deepseek-coder-v2:latest">DeepSeek Coder V2</option>
                     <option value="deepseek-coder:6.7b">DeepSeek Coder 6.7B</option>
                     <option value="codellama:latest">Code Llama</option>
                     <option value="codegemma:latest">Code Gemma</option>
                   </optgroup>
                 </template>
               </select>
             </div>
             <!-- Custom model name input -->
             <input 
               v-model="inputOllamaModel" 
               type="text" 
               placeholder="Or type model name: e.g. llama3.1:latest" 
               class="api-input" 
               style="margin-top: 0.35rem; font-size: 0.8rem;"
             />
             <p class="ollama-status" :class="{ online: ollamaOnline }">
               {{ ollamaOnline ? '✅ Ollama detected' : '❌ Ollama not found (Ensure it is running)' }}
             </p>
          </div>

        </div>

        <button class="btn btn-primary" @click="saveKey">Start Learning</button>
        
        <div class="links">
          <a href="https://aistudio.google.com" target="_blank">Get Gemini</a> |
          <a href="https://openrouter.ai/keys" target="_blank">Get OpenRouter</a> |
          <a href="https://ollama.com/" target="_blank">Download Ollama</a>
        </div>
      </div>

      <div v-else-if="showBriefing" class="briefing-overlay" @click="skipBriefing">
        <div class="briefing-content">
          <p class="typewriter">{{ currentBriefingLine }}</p>
          <div class="skip-hint">Click to skip</div>
        </div>
      </div>
      
      <template v-else>
        <EnglishMode v-if="currentMode === 'english'" />
        <CodingMode v-if="currentMode === 'coding'" />
      </template>
    </main>
  </div>
</template>

<script setup>

import { ref, onMounted, computed, watch } from 'vue';
import EnglishMode from './components/EnglishMode.vue';
import CodingMode from './components/CodingMode.vue';
import LogoIcon from './components/LogoIcon.vue';
import { useGemini } from './composables/useGemini';
import { useOpenRouter } from './composables/useOpenRouter';
import { useOllama } from './composables/useOllama';

const currentMode = ref('english');
const streak = ref(1); // Mock streak
const mobileMenuOpen = ref(false);

// API keys: priority = localStorage (user-entered) → Vercel env var → empty
// To pre-configure: add VITE_GEMINI_API_KEY and VITE_OPENROUTER_API_KEY in Vercel dashboard
const inputGemini = ref(
  localStorage.getItem('gemini_api_key') || 
  import.meta.env.VITE_GEMINI_API_KEY || 
  ''
);
const inputGeminiModel = ref(localStorage.getItem('gemini_model') || 'gemini-2.5-flash');
const inputOpenRouter = ref(
  localStorage.getItem('openrouter_api_key') || 
  import.meta.env.VITE_OPENROUTER_API_KEY || 
  ''
);
const inputOpenRouterModel = ref(localStorage.getItem('openrouter_model') || 'meta-llama/llama-3.3-70b-instruct:free');
const inputOllamaUrl = ref(localStorage.getItem('ollama_url') || 'http://localhost:11434');
const inputOllamaModel = ref(localStorage.getItem('ollama_model') || 'llama3');

const ollamaOnline = ref(false);
const availableOllamaModels = ref([]);

// AI Composables
const { setApiKey: setGeminiKey, apiKey: geminiKey, setGeminiModel } = useGemini();
const { setOpenRouterKey, apiKey: openRouterKey, setOpenRouterModel } = useOpenRouter();
const { setOllamaConfig, ollamaModel, checkOllamaStatus, getAvailableModels } = useOllama();

const hasApiKey = computed(() => {
  return !!geminiKey.value || !!openRouterKey.value || !!ollamaModel.value;
});

const refreshOllama = async () => {
  ollamaOnline.value = await checkOllamaStatus();
  if (ollamaOnline.value) {
    availableOllamaModels.value = await getAvailableModels();
    if (availableOllamaModels.value.length > 0 && inputOllamaModel.value === 'llama3') {
      inputOllamaModel.value = availableOllamaModels.value[0].name;
    }
  }
};

watch(inputOllamaUrl, refreshOllama);

onMounted(() => {
  refreshOllama();
});

const showBriefing = ref(false);
const briefingLines = [
  "Welcome, Operator.",
  "Your mission is to master the English language.",
  "Objectives: Build vocabulary, Fix grammar, Engage in scenarios.",
  "System Status: ONLINE.",
  "AI Assistant: READY."
];
const currentLineIndex = ref(0);
const currentBriefingLine = ref('');
let typingInterval = null;

const playBriefing = () => {
  showBriefing.value = true;
  currentLineIndex.value = 0;
  typeLine();
};

const typeLine = () => {
  const line = briefingLines[currentLineIndex.value];
  let charIndex = 0;
  currentBriefingLine.value = '';
  
  if (typingInterval) clearInterval(typingInterval);
  
  typingInterval = setInterval(() => {
    if (charIndex < line.length) {
      currentBriefingLine.value += line[charIndex];
      charIndex++;
    } else {
      clearInterval(typingInterval);
      setTimeout(() => {
        if (currentLineIndex.value < briefingLines.length - 1) {
          currentLineIndex.value++;
          typeLine();
        } else {
          setTimeout(() => {
             showBriefing.value = false;
          }, 2000);
        }
      }, 2000);
    }
  }, 50);
};

const skipBriefing = () => {
  clearInterval(typingInterval);
  showBriefing.value = false;
};

const saveKey = () => {
  let changed = false;
  
  if (inputGemini.value.trim()) { 
    setGeminiKey(inputGemini.value.trim()); 
    setGeminiModel(inputGeminiModel.value);
    changed = true; 
  }
  if (inputOpenRouter.value.trim()) { 
    setOpenRouterKey(inputOpenRouter.value.trim()); 
    setOpenRouterModel(inputOpenRouterModel.value);
    changed = true; 
  }
  
  setOllamaConfig(
    inputOllamaUrl.value.trim() || 'http://localhost:11434',
    inputOllamaModel.value.trim() || 'llama3'
  );
  changed = true;
  
  if (changed) playBriefing();
};

</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile */
  background-color: var(--color-bg);
  background-image: 
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0, transparent 50%), 
    radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.15) 0, transparent 50%);
  overflow: hidden; /* Prevent whole page scroll */
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem 1rem;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: auto;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.menu-toggle .bar {
  width: 20px;
  height: 2px;
  background: white;
  transition: all 0.3s;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1.5rem; /* Space between logo and streak */
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* More space between icon and text */
}

.logo h1 {
  font-size: 1.25rem;
  background: linear-gradient(135deg, #fff, #a5b4fc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.mode-switcher {
  display: flex;
  background: rgba(0,0,0,0.2);
  padding: 0.25rem;
  border-radius: var(--radius-full);
}

.nav-item {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  padding: 0.4rem 1.25rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-item.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
}

.streak-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-full);
  font-weight: bold;
  font-size: 0.8rem;
  color: white;
}

.content-area {
  flex: 1;
  overflow: hidden;
  padding: 0 1rem 1rem 1rem;
  display: flex;
  flex-direction: column;
}

.api-key-modal {
  margin: auto;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.api-input {
  text-align: center;
}

.api-inputs {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1rem;
  text-align: left;
}

.model-row {
  margin-top: -0.25rem;
  margin-bottom: 0.25rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 700;
  letter-spacing: 0.1em;
}

.api-inputs .row {
  display: flex;
  gap: 0.5rem;
}

.api-inputs .row .api-input {
  flex: 1;
}

.model-select {
  background: rgba(0,0,0,0.3) !important;
  cursor: pointer;
  color: white;
}

.model-select option {
  background: #1e293b;
  color: white;
}

.ollama-status {
  font-size: 0.7rem;
  margin-top: 0.25rem;
  font-weight: 600;
  color: var(--color-error);
}

.ollama-status.online {
  color: #10b981;
}

.links {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.links a {
  color: var(--color-primary);
  text-decoration: none;
}

/* Briefing Overlay */
.briefing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: black;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.briefing-overlay::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  z-index: 1001;
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
}

.briefing-content {
  text-align: center;
  padding: 2rem;
  max-width: 800px;
}

.typewriter {
  font-family: 'Courier New', Courier, monospace;
  font-size: 2.5rem;
  color: var(--color-primary);
  text-shadow: 0 0 20px var(--color-primary);
  margin: 0;
}

.skip-hint {
  margin-top: 3rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  opacity: 0.6;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    margin: 0;
    border-radius: 0;
    padding: 0.4rem 0.75rem;
    align-items: flex-start;
    border-bottom: 1px solid var(--glass-border);
  }

  .header-top {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-section {
    gap: 0.75rem;
  }

  .logo {
    gap: 0.4rem;
  }

  .logo .emoji { font-size: 1rem; }
  .logo h1 { font-size: 0.9rem; }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .streak-badge {
    position: static;
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    margin: 0;
  }
  
  .streak-badge span { display: none; }

  .menu-toggle {
    display: flex;
  }

  .mode-switcher {
    width: 100%;
    margin-top: 0.5rem;
    display: none;
    flex-direction: column;
    padding: 0.25rem;
    gap: 0.25rem;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .menu-open .mode-switcher {
    display: flex;
  }

  .nav-item {
    width: 100%;
    padding: 0.6rem;
    text-align: center;
    background: rgba(255,255,255,0.05);
    font-size: 0.8rem;
  }

  .content-area {
    padding: 0; /* Remove padding to fill screen */
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .api-key-modal {
    width: 95%;
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .typewriter {
    font-size: 1.5rem;
  }

  .api-inputs .row {
    flex-direction: column;
  }
}
</style>
