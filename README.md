# 🎙️ SpeakSmart — AI-Powered English & Coding Tutor

<p align="center">
  <img src="public/favicon.svg" alt="SpeakSmart Logo" width="80" />
</p>

<p align="center">
  <b>Practice English speaking & coding skills with AI — anytime, anywhere.</b><br>
  Built with Vue 3 + Vite. Works on mobile. 100% free AI models available.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Multi--Provider-6366f1" />
  <img src="https://img.shields.io/badge/Mobile-Responsive-10b981" />
</p>

---

## ✨ Features

### 🗣️ English Mode
- **Real-time Speech Recognition** — Speak into your mic, SpeakSmart transcribes it instantly. Supports 10+ Indian languages (Hindi, Bengali, etc.) for cross-language practice.
- **AI Conversation Partner** — Practice with an AI tutor that responds naturally and corrects your grammar.
- **Multilingual Support** — Speak in your native language (Hindi, etc.) and let AI translate and teach you the English equivalent.
- **Grammar Correction Cards** — See exactly what you said wrong and how to fix it.
- **Scenario-Based Practice** — Choose topics like Job Interview, Travel, Business Meeting, and more.
- **AI Tone Control** — Switch between Friendly, Professional, and Tough coaching styles.
- **Word Bank** — Save new vocabulary from conversations for later review.
- **Session Reports** — Get a detailed performance report after each practice session.
- **Text-to-Speech** — Hear the AI read responses aloud. Supports natural Indic voices (Hindi, Tamil, etc.) via Sarvam AI.
- **Word of the Day** — Learn a new word every time you open the app.

### 💻 Coding Mode
- **Code Editor** — Write code in JavaScript, Python, or C++ with syntax highlighting.
- **AI Code Review** — Get instant feedback, bug detection, and optimization tips from AI.
- **Run Code** — Execute your code right in the browser (JavaScript).

### 🤖 Multi-Provider AI Engine
SpeakSmart supports **multiple AI backends** with intelligent auto-switching:

| Provider | Models | Cost | Best For |
|----------|--------|------|----------|
| **Gemini** | 2.5 Flash, 2.5 Pro, 3.0 Flash/Pro, 3.1 Pro | Free tier | Primary (recommended) |
| **Sarvam AI** | **Sarvam-M (Free)**, Bulbul (TTS), Mayura (Translation) | **Free tokens** & Paid | Indic languages & Multilingual |
| **OpenRouter** | Llama 3.3 70B, Gemini 2.0 Flash, Devstral 2 | Free models | Fallback & variety |
| **Ollama** | Any local model (llama3, mistral, etc.) | Free (local) | Offline / privacy |

> **Auto-Smart Mode**: When enabled, SpeakSmart automatically picks the best available provider. It now includes Sarvam-M as a high-performance free alternative for Indic reasoning.

---

## 📱 Mobile Support

SpeakSmart is **fully responsive** and designed mobile-first:

- **Dynamic Viewport** (`100dvh`) — Adapts to mobile browser bars and keyboards.
- **Double-Deck Scroll** — Upper (config) and lower (chat) panels scroll independently.
- **Touch-Optimized** — All buttons, selects, and inputs are sized for comfortable tapping.
- **Compact Header** — Logo, streak, and menu collapse into a slim status bar.
- **PWA-Ready Structure** — Can be added to your home screen for an app-like experience.

### 📲 How to Use on Mobile
1. Open the hosted URL in your mobile browser.
2. **For Voice Support**:
   - **iOS (iPhone/iPad)**: Use **Safari** for full microphone support.
   - **Android**: Chrome or Firefox work perfectly.
3. Tap the **microphone** icon 🎙️ in the status area or chat footer.
4. If you speak in an Indian language (e.g., Hindi), SpeakSmart will automatically translate it to English and respond!
5. Swipe up/down in the chat area to review your history.

> **Tip:** On Android Chrome, tap `⋮ → Add to Home Screen` for a native app feel.  
> **Tip:** On iOS Safari, tap `Share → Add to Home Screen`.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed
- A free API key from at least one provider:
  - [Google AI Studio](https://aistudio.google.com/) (Gemini — recommended)
  - [OpenRouter](https://openrouter.ai/keys) (free models available)
  - [Ollama](https://ollama.com/) (local, no key needed)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/SpeakSmart.git
cd SpeakSmart

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### First Launch
1. Open the app in your browser.
2. Enter your API key(s) in the setup modal.
3. Select your preferred AI model.
4. Click **"Start Learning"** — you're ready to practice!

---

## 🌐 Hosting (Deploy for Free)

### Option 1: Vercel (Recommended — Easiest)

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **"New Project"** → Import your SpeakSmart repo.
4. Vercel auto-detects Vite. Click **Deploy**.
5. Your app is live at `https://speaksmart.vercel.app` (or custom domain).

```bash
# Or deploy via CLI
npm i -g vercel
vercel --prod
```

### Option 2: Netlify

1. Push your code to GitHub.
2. Go to [netlify.com](https://netlify.com) → **"Add new site"** → Import from Git.
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Click **Deploy**.

### Option 3: GitHub Pages

```bash
# Build the production bundle
npm run build

# The output is in the /dist folder
# Push the dist folder to the gh-pages branch
npx gh-pages -d dist
```

Then enable GitHub Pages in your repo settings → Source: `gh-pages` branch.

> **Note for GitHub Pages:** Add a `vite.config.js` base path:
> ```js
> export default defineConfig({
>   base: '/SpeakSmart/',
>   plugins: [vue()]
> })
> ```

### Option 4: Render

1. Go to [render.com](https://render.com) → New **Static Site**.
2. Connect your GitHub repo.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Create Static Site**.

---

## 🏗️ Project Structure

```
SpeakSmart/
├── public/
│   └── favicon.svg          # Custom SpeakSmart logo (browser tab)
├── src/
│   ├── components/
│   │   ├── Avatar.vue        # Animated AI tutor avatar
│   │   ├── CodingMode.vue    # Full coding practice interface
│   │   ├── CorrectionCard.vue # Grammar correction display
│   │   ├── EnglishMode.vue   # Main English practice interface
│   │   ├── LogoIcon.vue      # Animated SVG logo component
│   │   ├── MicButton.vue     # Microphone toggle button
│   │   ├── SoundVisualizer.vue # Audio waveform visualizer
│   │   └── WordOfTheDay.vue  # Daily vocabulary widget
│   ├── composables/
│   │   ├── useAI.js          # Core AI orchestration logic
│   │   ├── useGemini.js      # Google Gemini API integration
│   │   ├── useOpenRouter.js  # OpenRouter API integration
│   │   ├── useOllama.js      # Local Ollama integration
│   │   ├── useGrammarCheck.js # Grammar analysis engine
│   │   ├── useSpeechRecognition.js # Browser speech-to-text
│   │   ├── useTextToSpeech.js     # Browser text-to-speech
│   │   └── useCodeRunner.js  # In-browser code execution
│   ├── data/
│   │   └── scenarios.json    # Practice scenario definitions
│   ├── App.vue               # Root application component
│   ├── main.js               # App entry point
│   └── style.css             # Global design system
├── index.html                # HTML entry with SEO meta
├── package.json
└── vite.config.js
```

---

## 🎨 Design System

SpeakSmart uses a premium **Glassmorphism** design language:

- **Dark Mode** — Easy on the eyes during long practice sessions.
- **Indigo Gradient** — `#4f46e5` → `#818cf8` as the primary accent.
- **Glass Panels** — Semi-transparent containers with backdrop blur.
- **Micro-Animations** — Pulsing avatar, typing indicators, smooth transitions.
- **Custom Scrollbars** — Branded indigo scrollbars for premium feel.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send typed message |
| Click 🎙️ | Start/stop voice recording |
| Click 🎯 Finish | Generate session report |
| Click 📚 Word Bank | View saved vocabulary |

---

## 🔒 Privacy & Security

- **No server-side storage** — All API keys are stored locally in your browser's `localStorage`.
- **Direct API calls** — Your messages go directly to Gemini/OpenRouter/Ollama. No middleman.
- **Ollama option** — Run AI completely locally for full privacy.
- **No tracking** — Zero analytics, zero cookies, zero data collection.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vue 3** | Reactive UI framework |
| **Vite 7** | Lightning-fast dev server & bundler |
| **Web Speech API** | Browser-native speech recognition & synthesis |
| **CodeMirror 6** | Advanced code editor with syntax highlighting |
| **Marked** | Markdown rendering for AI responses |
| **CSS Variables** | Themeable design system |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for learners everywhere.<br>
  <b>SpeakSmart</b> — Speak Smarter, Code Better.
</p>
