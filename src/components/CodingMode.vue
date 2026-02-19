<template>
  <div class="coding-mode">
    <!-- Main Content: Split View -->
    <div class="main-split">
      <!-- Left: Problem Description -->
      <div class="problem-pane glass-panel">
        <div class="pane-content" v-if="currentProblem">
          <div class="problem-controls">
             <select v-model="selectedDifficulty" class="difficulty-select">
               <option value="All">All Levels</option>
               <option value="Easy">Beginner (Easy)</option>
               <option value="Medium">Intermediate (Medium)</option>
               <option value="Hard">Advanced (Hard)</option>
             </select>
             
             <div class="nav-buttons">
               <button class="btn-xs" @click="currentProblemIndex > 0 ? currentProblemIndex-- : null" :disabled="currentProblemIndex === 0">Prev</button>
               <span>{{ currentProblemIndex + 1 }} / {{ filteredQuestions.length }}</span>
               <button class="btn-xs" @click="currentProblemIndex < filteredQuestions.length - 1 ? currentProblemIndex++ : null" :disabled="currentProblemIndex === filteredQuestions.length - 1">Next</button>
             </div>
          </div>
          
          <h2>{{ currentProblem.title }}</h2>
          <span class="badge" :class="currentProblem.difficulty.toLowerCase()">{{ currentProblem.difficulty }}</span>
          <div class="description">
            <p>{{ currentProblem.description }}</p>
          </div>
          <div class="examples" v-if="currentProblem.examples">
            <div v-for="(ex, i) in currentProblem.examples" :key="i" class="example-card">
              <strong>Example {{ i + 1 }}</strong>
              <div class="code-block">
                <span>Input: {{ ex.input }}</span>
                <span>Output: {{ ex.output }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="pane-content empty-search">
            <h3>No Questions Found</h3>
            <p>Try selecting a different difficulty.</p>
             <button class="btn btn-sm btn-secondary" @click="selectedDifficulty = 'All'">Reset Filters</button>
        </div>
      </div>

      <!-- Right: Code Editor -->
      <div class="editor-pane glass-panel">
        <div class="editor-header">
          <div class="lang-selector">
            <select v-model="language" class="language-select">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div class="actions">
            <button class="btn btn-sm btn-secondary" @click="runCodeInPiston" :disabled="isRunning">
              <span v-if="isRunning">Running...</span>
              <span v-else>▶ Run Code</span>
            </button>
            <button class="btn btn-sm btn-accent" @click="fixCodeWithAI" :disabled="isFixing || !code">
               <span v-if="isFixing">Fixing...</span>
               <span v-else>✨ Auto Fix</span>
            </button>
          </div>
        </div>
        
        <div ref="editorRef" class="editor-container"></div>
        
        <div class="output-console" :class="{ 'has-content': consoleOutput || consoleError }">
          <div class="console-label">Console Output</div>
          <pre v-if="consoleOutput !== null" class="output-success">{{ consoleOutput || 'Program executed successfully (no output).' }}</pre>
          <pre v-if="consoleError" class="output-error">{{ consoleError }}</pre>
          <div v-if="consoleOutput === null && !consoleError" class="output-placeholder">
            <span v-if="isRunning">Executing code...</span>
            <span v-else>Run code to see output, then Auto Fix if needed...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Drawer: Interaction Pane -->
    <div class="interaction-drawer glass-panel" :class="{ expanded: isDrawerExpanded }">
      <!-- Drawer Handle / Header -->
      <div class="drawer-header" @click="toggleDrawer">
        <div class="drawer-title">
          <span class="emoji">🎙️</span> 
          <span>AI Interview Assistant</span>
        </div>
        <div class="drawer-status">
           <span v-if="isEvaluating">Evaluating...</span>
           <span v-else-if="isListening">Listening...</span>
           <span v-else>{{ isDrawerExpanded ? 'Click to collapse' : 'Click to speak & evaluate' }}</span>
        </div>
        <div class="drawer-toggle-icon">
          {{ isDrawerExpanded ? '▼' : '▲' }}
        </div>
      </div>

      <!-- Drawer Content -->
      <div class="drawer-content">
        <div class="avatar-container">
           <Avatar :status="avatarStatus" :isSpeaking="isSpeaking" />
        </div>
        
        <div class="controls-container">
          <div class="controls-header">
            <h4>Verbal Explanation</h4>
            <div class="evaluation-mode-toggle">
              <label :class="{ active: evaluationMode === 'friendly' }">
                <input type="radio" v-model="evaluationMode" value="friendly"> Practice
              </label>
              <label :class="{ active: evaluationMode === 'interview' }">
                <input type="radio" v-model="evaluationMode" value="interview"> Mock Interview
              </label>
            </div>
          </div>
          <div class="mic-controls">
            <MicButton :isListening="isListening" @toggle="toggleMic" />
            <div class="transcript-box">
              <p v-if="transcript">{{ transcript }}</p>
              <p v-else class="placeholder">Explain your code logic here...</p>
            </div>
          </div>
          <div v-if="speechError" class="error-text">🎤 {{ speechError }}</div>
          
          <div class="action-row">
            <button class="btn btn-primary" @click="evaluateSubmission" :disabled="(!transcript && !code) || isEvaluating">
              {{ isEvaluating ? 'Evaluating...' : 'Submit Explanation & Code' }}
            </button>
            <p v-if="submissionError" class="error-text small">{{ submissionError }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Modal (Overlay) -->
    <div v-if="feedback" class="feedback-overlay">
      <div class="feedback-card glass-panel">
        <div class="feedback-header">
          <h3>AI Feedback</h3>
          <button class="btn-close" @click="feedback = null">×</button>
        </div>
        <div class="feedback-body" v-html="formattedFeedback"></div>
        <div class="feedback-footer">
          <button class="btn btn-primary" @click="feedback = null">Back to Code</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { EditorState } from '@codemirror/state';
import { marked } from 'marked';
import Avatar from './Avatar.vue';
import MicButton from './MicButton.vue';
import { useSpeechRecognition } from '../composables/useSpeechRecognition';
import { useCodeRunner } from '../composables/useCodeRunner';
import { useAI } from '../composables/useAI';
import codingQuestions from '../data/coding-questions.json';
import { useTextToSpeech } from '../composables/useTextToSpeech';

const allQuestions = ref(codingQuestions || []);
const selectedDifficulty = ref('All');
const language = ref('javascript');
const editorRef = ref(null);
let editorView = null;

const filteredQuestions = computed(() => {
  if (selectedDifficulty.value === 'All') return allQuestions.value;
  return allQuestions.value.filter(q => q.difficulty === selectedDifficulty.value);
});

const currentProblemIndex = ref(0);
const currentProblem = computed(() => {
  if (!filteredQuestions.value || filteredQuestions.value.length === 0) return null;
  return filteredQuestions.value[currentProblemIndex.value] || filteredQuestions.value[0];
});

watch(selectedDifficulty, () => {
  currentProblemIndex.value = 0;
});

const { isListening, transcript, startListening, stopListening, error: speechError } = useSpeechRecognition();
const { runCode, output: runnerOutput, error: runnerError, loading: isRunning } = useCodeRunner();
const { evaluateCode: evaluateAI, fixCode: fixCodeAI } = useAI();
const { speak, isSpeaking } = useTextToSpeech();

const code = ref('');
const consoleOutput = ref(null);
const consoleError = ref(null);

function getCodeForProblem(problem, lang) {
  if (!problem) return '// No problem selected';
  if (typeof problem.starterCode === 'object') {
     return problem.starterCode[lang] || problem.starterCode['javascript'] || `// No starter code for ${lang}`;
  }
  return problem.starterCode || '// Write your code here';
}

// Init code with safeguards
if (currentProblem.value) {
   code.value = getCodeForProblem(currentProblem.value, language.value);
}

// Watch for problem change or language change to update code
watch([currentProblem, language], ([newProblem, newLang]) => {
  if (newProblem) {
    code.value = getCodeForProblem(newProblem, newLang);
    
    if (editorView) {
      editorView.dispatch({
        changes: {from: 0, to: editorView.state.doc.length, insert: code.value}
      });
    }
  }
});
const feedback = ref(null);
const avatarStatus = ref('idle');
const submissionError = ref(null);
const isEvaluating = ref(false);
const isDrawerExpanded = ref(false);
const isFixing = ref(false);
const evaluationMode = ref('friendly');

const toggleDrawer = () => {
  isDrawerExpanded.value = !isDrawerExpanded.value;
};

// ... watch listeners ...
watch(isListening, (val) => { if (val) isDrawerExpanded.value = true; });
watch(isEvaluating, (val) => { if (val) isDrawerExpanded.value = true; });
watch(isFixing, (val) => { if (val) isDrawerExpanded.value = true; });

// Initialize Editor
onMounted(() => {
  if (editorRef.value) {
    try {
      const myTheme = EditorView.theme({
        "&": {
          color: "#e5e7eb",
          backgroundColor: "#1e1e1e",
          height: "100%",
          fontSize: "14px"
        },
        ".cm-content": {
          caretColor: "#aeafad"
        },
        ".cm-gutters": {
          backgroundColor: "#1e1e1e",
          color: "#6b7280",
          border: "none"
        },
        ".cm-activeLineGutter": {
          backgroundColor: "rgba(255, 255, 255, 0.1)"
        },
        ".cm-scroller": { overflow: "auto" }
      }, {dark: true});

      const startState = EditorState.create({
        doc: code.value,
        extensions: [
          basicSetup,
          getLanguageExtension(language.value),
          myTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              code.value = update.state.doc.toString();
            }
          })
        ]
      });

      editorView = new EditorView({
        state: startState,
        parent: editorRef.value
      });
    } catch (e) {
      console.error("Editor init failed", e);
    }
  }
});

const hasRun = ref(false);

const runCodeInPiston = async () => {
  submissionError.value = null;
  consoleOutput.value = null;
  consoleError.value = null;
  hasRun.value = false;
  
  if (!code.value || code.value.trim() === '') {
     submissionError.value = "Code editor is empty!";
     return;
  }
  
  try {
     const result = await runCode(code.value, language.value);
     hasRun.value = true;
     
     if (result) {
        consoleOutput.value = result.stdout;
        consoleError.value = result.stderr;
     } else {
        if (runnerError.value) {
           consoleError.value = runnerError.value;
        } else {
           consoleError.value = "Execution finished with no output returned.";
        }
     }
  } catch(e) {
     console.error("Run failed:", e);
     consoleError.value = "Run failed: " + e.message;
  }
};

const fixCodeWithAI = async () => {
  submissionError.value = null;
  isFixing.value = true;
  avatarStatus.value = 'thinking';
  
  const ctxError = consoleError.value || consoleOutput.value || "No execution output. Review code logic.";
  
  try {
    const fixed = await fixCodeAI(code.value, ctxError, currentProblem.value?.description || 'General coding problem');
    
    if (fixed && fixed.length > 5) {
        code.value = fixed;
        if (editorView) {
          editorView.dispatch({
            changes: {from: 0, to: editorView.state.doc.length, insert: fixed}
          });
        }
        avatarStatus.value = 'correct'; 
        speak("I've applied a fix. Try running it again.");
    } else {
        throw new Error("AI returned empty fix.");
    }
  } catch (err) {
    submissionError.value = "Fix failed: " + err.message;
    avatarStatus.value = 'incorrect';
  } finally {
    isFixing.value = false;
  }
};
// ... rest ...

const evaluateSubmission = async () => {
  submissionError.value = null;
  isEvaluating.value = true;
  avatarStatus.value = 'thinking';
  
  const explanation = transcript.value || "No verbal explanation provided.";
  
  try {
    const response = await evaluateAI(code.value, explanation, currentProblem.value?.description || 'Code provided.', evaluationMode.value);
    feedback.value = response;
    avatarStatus.value = 'speaking';
    speak(response.split('.')[0]); 
  } catch (err) {
    console.error(err);
    submissionError.value = "Evaluation failed: " + err.message;
    avatarStatus.value = 'incorrect';
  } finally {
    isEvaluating.value = false;
  }
};

const formattedFeedback = ref('');
watch(feedback, async (val) => {
  if (val) formattedFeedback.value = await marked.parse(val);
});

function getLanguageExtension(lang) {
  switch (lang) {
    case 'javascript': return javascript();
    case 'python': return python();
    // case 'cpp': return cpp();
    default: return javascript();
  }
}
</script>


<style scoped>
/* Scoped overrides or additions */
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-xs {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--glass-border);
  color: var(--color-text);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}
.btn-xs:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.problem-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.difficulty-select {
  padding: 0.25rem;
  font-size: 0.85rem;
  background: rgba(0,0,0,0.3);
  color: var(--color-text);
  border: 1px solid var(--glass-border);
  border-radius: 4px;
}

.nav-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.btn-accent {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
}
.btn-accent:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 0 10px rgba(16,185,129,0.3);
}

.coding-mode {
  display: flex;
  flex-direction: column;
  height: 100%; /* Occupy full available space from parent */
  position: relative;
  overflow: hidden;
}

.main-split {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1rem;
  padding-bottom: 60px; /* Space for drawer header */
}

/* Problem Pane */
.problem-pane {
  flex: 0 0 40%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-radius: 0; /* Align with edges maybe? Or keep rounded */
  border-top-left-radius: var(--radius-lg);
  border-bottom-left-radius: var(--radius-lg);
}

.pane-content {
  padding: 1rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.badge.easy { background: rgba(16, 185, 129, 0.2); color: var(--color-success); }
.badge.medium { background: rgba(245, 158, 11, 0.2); color: var(--color-warning); }
.badge.hard { background: rgba(239, 68, 68, 0.2); color: var(--color-error); }

.example-card {
  background: rgba(0,0,0,0.2);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-top: 1rem;
  font-size: 0.9rem;
}

.code-block {
  font-family: monospace;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--color-text-muted);
}

/* Editor Pane */
.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
  border-top-right-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

.editor-header {
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid var(--glass-border);
}

.language-select {
  padding: 0.25rem 0.5rem;
  width: auto;
  font-size: 0.9rem;
}

.editor-container {
  flex: 1;
  overflow: hidden;
  background: #1e1e1e;
}

.output-console {
  height: 30%; /* Fixed height for console */
  max-height: 200px;
  border-top: 1px solid var(--glass-border);
  background: #0f172a;
  display: flex;
  flex-direction: column;
}

.console-label {
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: rgba(255,255,255,0.05);
}

.output-success, .output-error, .output-placeholder {
  padding: 0.5rem;
  font-family: monospace;
  font-size: 0.9rem;
  overflow: auto;
  flex: 1;
  margin: 0;
}

.output-success { color: #10b981; }
.output-error { color: #ef4444; }
.output-placeholder { color: #64748b; font-style: italic; }

/* Interaction Drawer */
.interaction-drawer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 1rem; /* Margins for floating effect */
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  transform: translateY(calc(100% - 50px)); /* Show only header */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 0; /* Reset glass-panel padding */
  max-height: 80vh;
}

.interaction-drawer.expanded {
  transform: translateY(0);
}

.drawer-header {
  height: 50px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid var(--glass-border);
}

.drawer-header:hover {
  background: rgba(255,255,255,0.1);
}

.drawer-title {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.drawer-status {
  flex: 1;
  text-align: right;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.drawer-toggle-icon {
  margin-left: 1rem;
  color: var(--color-text-muted);
}

.drawer-content {
  padding: 1rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.avatar-container {
  flex: 0 0 120px;
}

.controls-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.evaluation-mode-toggle {
  display: flex;
  background: rgba(0,0,0,0.3);
  padding: 0.2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.evaluation-mode-toggle label {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-muted);
}

.evaluation-mode-toggle label.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.evaluation-mode-toggle input {
  display: none;
}

.mic-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.transcript-box {
  flex: 1;
  background: rgba(0,0,0,0.2);
  padding: 1rem;
  border-radius: var(--radius-md);
  min-height: 80px;
  max-height: 120px;
  overflow-y: auto;
  font-size: 0.95rem;
}

.transcript-box .placeholder {
  color: var(--color-text-muted);
  font-style: italic;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Feedback Overlay */
.feedback-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 2rem;
}

.feedback-card {
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.btn-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.feedback-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 0;
  line-height: 1.7;
}

.feedback-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
  text-align: right;
}

.empty-search {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--color-text-muted);
  text-align: center;
}
.empty-search h3 {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}
.empty-search button {
  margin-top: 1rem;
}
</style>
