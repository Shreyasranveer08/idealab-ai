class LLMClient {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.openRouterKey = process.env.OPENROUTER_API_KEY;
    this.fallbackModels = [
      "openrouter/free", // Auto-routes to best free model
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemma-4-31b-it:free",
      "qwen/qwen3-next-80b-a3b-instruct:free",
      "nousresearch/hermes-3-llama-3.1-405b:free"
    ];
    if (process.env.OPENROUTER_MODEL) {
      this.fallbackModels.unshift(process.env.OPENROUTER_MODEL);
    }
  }

  async generateContent(prompt, expectJson = true) {
    let result = null;

    // 1. Try Gemini
    if (this.geminiKey && this.geminiKey !== 'REPLACE_WITH_YOUR_API_KEY') {
      try {
        result = await this._callGemini(prompt, expectJson);
        return result;
      } catch (error) {
        console.warn(`[LLM Router] Gemini failed (${error.message}). Falling back to OpenRouter...`);
      }
    } else {
      console.warn("[LLM Router] Gemini key not configured. Trying OpenRouter...");
    }

    // 2. Try OpenRouter Fallbacks
    if (this.openRouterKey && this.openRouterKey !== 'REPLACE_WITH_YOUR_OPENROUTER_KEY') {
      let lastError = null;
      for (const model of this.fallbackModels) {
        try {
          console.log(`[LLM Router] Trying OpenRouter model: ${model}`);
          result = await this._callOpenRouter(model, prompt, expectJson);
          return result;
        } catch (error) {
          console.warn(`[LLM Router] OpenRouter model ${model} failed: ${error.message}`);
          lastError = error;
        }
      }
      console.error(`[LLM Router] All OpenRouter fallbacks failed.`);
      throw new Error(`Both Gemini and OpenRouter failed. Last error: ${lastError?.message}`);
    } else {
      console.warn("[LLM Router] OpenRouter key not configured.");
      throw new Error("No available LLM providers configured or limits exceeded.");
    }
  }

  async _callGemini(prompt, expectJson) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + this.geminiKey;
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };
    
    if (expectJson) {
      body.generationConfig = { responseMimeType: "application/json" };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok || !data.candidates || !data.candidates[0]) {
      throw new Error(data.error?.message || "Invalid Gemini response format");
    }

    let text = data.candidates[0].content.parts[0].text;
    
    if (expectJson) {
      return this._parseJsonSafely(text);
    }
    return text;
  }

  async _callOpenRouter(modelId, prompt, expectJson) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.openRouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt + (expectJson ? " Respond ONLY with valid JSON." : "") }]
      })
    });

    const data = await response.json();

    if (!response.ok || !data.choices || !data.choices[0]) {
      throw new Error(data.error?.message || "Invalid OpenRouter response format");
    }

    let text = data.choices[0].message.content;

    if (expectJson) {
      return this._parseJsonSafely(text);
    }
    return text;
  }

  _parseJsonSafely(text) {
    try {
      // Sometimes LLMs return markdown code blocks, strip them if present
      let clean = text.trim();
      if (clean.startsWith('```json')) clean = clean.substring(7);
      if (clean.startsWith('```')) clean = clean.substring(3);
      if (clean.endsWith('```')) clean = clean.substring(0, clean.length - 3);
      return JSON.parse(clean.trim());
    } catch (e) {
      console.error("[LLM Router] JSON Parse Error on text:", text);
      throw new Error("Failed to parse JSON from AI response.");
    }
  }
}

module.exports = new LLMClient();
