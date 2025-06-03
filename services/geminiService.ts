
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, GEMINI_SYSTEM_PROMPT } from '../constants';
import type { AnalysisResult, GeminiAnalysisResponse } from '../types';

export const getApiKey = (): string | undefined => {
  // In a real Vite/Create React App setup, this would be import.meta.env.VITE_API_KEY or process.env.REACT_APP_API_KEY
  // For this specific environment, we directly use process.env.API_KEY
  return process.env.API_KEY;
};

// Removed global 'ai' instance:
// const ai = new GoogleGenAI({ apiKey: getApiKey() || "MISSING_API_KEY" }); 

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // Get only base64 part
    reader.onerror = error => reject(error);
  });
};

export const analyzeBrokenObject = async (
  imageBase64: string,
  mimeType: string,
  apiKey: string // This apiKey is passed from App.tsx and should be valid.
): Promise<AnalysisResult> => {
  // The App.tsx component should ensure apiKey is valid before calling this.
  // However, a check here can provide a safeguard.
  if (!apiKey) { 
    console.warn("analyzeBrokenObject called with an empty or missing API key. This should ideally be prevented by the calling UI component.");
    return { isFixable: null, error: "API Key is missing. Analysis cannot proceed." };
  }
  
  // Always create a new GoogleGenAI instance with the provided apiKey.
  // This resolves the 'ai.options.apiKey' error because we no longer use a global 'ai' instance
  // or attempt to inspect its internal configuration in an unsupported way.
  const geminiAI = new GoogleGenAI({ apiKey });

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: imageBase64,
    },
  };

  const textPart = {
    text: "Analyze the broken object in the provided image according to the system instructions.",
  };

  try {
    const response: GenerateContentResponse = await geminiAI.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: [{ role: "user", parts: [imagePart, textPart] }],
      config: {
        systemInstruction: GEMINI_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    // Regex to remove potential markdown code fences (```json ... ``` or ``` ... ```)
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    try {
      const parsedData = JSON.parse(jsonStr) as GeminiAnalysisResponse;
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError, "Raw response text:", response.text);
      return {
        isFixable: null,
        error: "AI response was not in the expected JSON format. Raw: " + response.text.substring(0, 100) + "...",
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "Failed to get analysis from AI.";
    if (error instanceof Error) {
      errorMessage += ` ${error.message}`;
    }
    
    // More robust check for API key related error messages from the Gemini API
    if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
        const lowerCaseErrorMessage = error.message.toLowerCase();
        if (
            lowerCaseErrorMessage.includes('api key not valid') || 
            lowerCaseErrorMessage.includes('permission denied') || 
            lowerCaseErrorMessage.includes('api_key_invalid') ||
            lowerCaseErrorMessage.includes('api key is invalid') ||
            lowerCaseErrorMessage.includes('invalid api key')
        ) {
            errorMessage = "API Key is invalid or has insufficient permissions. Please check your API_KEY environment variable.";
        }
    }
    return { isFixable: null, error: errorMessage };
  }
};
