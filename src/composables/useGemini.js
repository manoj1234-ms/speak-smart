import { ref } from 'vue';

const apiKey = ref(import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '');
const geminiModel = ref(localStorage.getItem('gemini_model') || 'gemini-2.5-flash');
const error = ref(null);
const loading = ref(false);
const lastStatus = ref(200);

const setApiKey = (key) => {
  apiKey.value = key;
  localStorage.setItem('gemini_api_key', key);
};

const setGeminiModel = (model) => {
  geminiModel.value = model;
  localStorage.setItem('gemini_model', model);
};

const chat = async (prompt, history = [], systemPrompt = '') => {
  if (!apiKey.value) {
    error.value = 'API Key is missing';
    return null;
  }
  loading.value = true;
  error.value = null;

  try {
    // Gemini 1.5 requires alternating 'user' and 'model' roles.
    // It MUST start with a 'user' message.
    let contents = history.map(msg => ({
      role: (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user',
      parts: [{ text: msg.content || '' }]
    }));

    // 1. Merge consecutive identical roles (Gemini requirement)
    const processedContents = [];
    for (const msg of contents) {
      if (processedContents.length > 0 && processedContents[processedContents.length - 1].role === msg.role) {
        processedContents[processedContents.length - 1].parts[0].text += "\n" + (msg.parts[0].text || '');
      } else {
        processedContents.push(msg);
      }
    }

    // 2. Add current prompt, merging if necessary
    if (processedContents.length > 0 && processedContents[processedContents.length - 1].role === 'user') {
      processedContents[processedContents.length - 1].parts[0].text += "\n" + prompt;
    } else {
      processedContents.push({ role: 'user', parts: [{ text: prompt }] });
    }

    // 3. Ensure conversation starts with 'user'
    if (processedContents.length > 0 && processedContents[0].role === 'model') {
      processedContents.unshift({ role: 'user', parts: [{ text: 'Hi! Let\'s begin our session.' }] });
    }

    // 4. SUPER-STABLE INSTRUCTION: 
    // Instead of using the buggy system_instruction field, prepend the prompt to the first user message.
    if (systemPrompt && processedContents.length > 0) {
      processedContents[0].parts[0].text = `[SYSTEM INSTRUCTION: ${systemPrompt}]\n\n` + processedContents[0].parts[0].text;
    }

    const body = {
      contents: processedContents
    };

    // Use v1 for 2.5 stable, v1beta for 3.0 previews
    const apiVersion = geminiModel.value.includes('3') ? 'v1beta' : 'v1';
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${geminiModel.value}:generateContent?key=${apiKey.value}`;
    console.log('GEMINI REQUEST URL:', url);
    console.log('GEMINI REQUEST BODY:', JSON.stringify(body, null, 2));

    const response = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    lastStatus.value = response.status;

    if (data.error) {
      console.error('FULL GEMINI ERROR:', data.error);
      const msg = data.error.message || JSON.stringify(data.error);
      const err = new Error(`Gemini Error: ${msg}`);
      err.status = response.status;
      throw err;
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.warn('Gemini returned no candidates. Safety block?', data);
      throw new Error('AI response was blocked or empty.');
    }

    const text = data.candidates[0].content?.parts?.[0]?.text || '';
    if (!text) {
      // Check for safety ratings
      const safety = data.candidates[0].safetyRatings;
      console.warn('Empty response from Gemini. Safety ratings:', safety);
      throw new Error('AI refused to answer (Safety Filter).');
    }
    return text;
  } catch (err) {
    error.value = err.message;
    return null;
  } finally {
    loading.value = false;
  }
};

const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
  try {
    const response = await fetch(url, options);

    // If rate limited (429) or server error (503), retry
    if ((response.status === 429 || response.status === 503) && retries > 0) {
      console.warn(`Hit rate limit. Retrying in ${backoff}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }

    return response;
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
};

const evaluateCode = async (code, explanation, problemDescription, mode = 'friendly') => {
  const isInterview = mode === 'interview';
  const systemPrompt = isInterview
    ? "You are a senior technical interviewer at a top tech company (FAANG style). Be professional, rigorous, and slightly demanding. Challenge the candidate on edge cases and efficiency. Ask a follow-up question at the end."
    : "You are a helpful and encouraging coding tutor. Explain concepts clearly and stay positive.";

  const prompt = `
    I am solving a coding problem: ${problemDescription}
    Here is my code:
    ${code}
    
    Here is my verbal explanation of the approach:
    "${explanation}"
    
    Please evaluate:
    1. Correctness of code.
    2. Clarity of the explanation.
    3. Any improvements or bugs.
    4. Time/Space complexity analysis.
    
    Structure your feedback with clear headings.
  `;
  return await chat(prompt, [], systemPrompt);
};

export function useGemini() {
  return {
    apiKey,
    setApiKey,
    geminiModel,
    setGeminiModel,
    error,
    loading,
    lastStatus,
    chat,
    evaluateCode
  };
}
