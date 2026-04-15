import "server-only";

import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Export the model directly - cast to LanguageModel for compatibility
export const baseModel = groq("llama-3.3-70b-versatile") as unknown as LanguageModel;
export const themeGenerationModel = groq("llama-3.3-70b-versatile") as unknown as LanguageModel;
export const promptEnhancementModel = groq("llama-3.3-70b-versatile") as unknown as LanguageModel;

// For backward compatibility
export const myProvider = {
  languageModel: (id: string) => {
    switch (id) {
      case "base":
        return baseModel;
      case "theme-generation":
        return themeGenerationModel;
      case "prompt-enhancement":
        return promptEnhancementModel;
      default:
        return baseModel;
    }
  },
};
