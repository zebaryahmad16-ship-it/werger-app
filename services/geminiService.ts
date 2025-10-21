import { GoogleGenerativeAI } from "@google/genai";

// === START OF CHANGE ===
// We changed process.env.API_KEY to import.meta.env.VITE_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// === END OF CHANGE ===

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenerativeAI({ apiKey: API_KEY });

const systemInstruction = "You are an expert translator. Your task is to translate the provided content from its source language (which will be either English or Arabic) into the Kurdish (Badini dialect). Provide only the translated text as your response, without any extra explanations or pleasantries.";

export const translateText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Corrected model name
      contents: [{ role: "user", parts: [{ text: Translate this text:\n\n---\n${text}\n--- }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    });
    return response.response.text(); // Correct way to get text
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate text. Please try again.");
  }
};

export const translateImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart = {
      text: "Extract and translate the text from this image."
    };

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Corrected model name
      contents: [{ role: "user", parts: [imagePart, textPart] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    });
    return response.response.text(); // Correct way to get text
  } catch (error) {
    console.error("Error translating image:", error);
    throw new Error("Failed to translate image. Please try again.");
  }
};

export const translatePdfText = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash', // Corrected model name
            contents: [{ role: "user", parts: [{ text: Translate the text extracted from this PDF document, preserving paragraphs and structure as much as possible:\n\n---\n${text}\n--- }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
        });
        return response.response.text(); // Correct way to get text
    } catch (error) {
        console.error("Error translating PDF text:", error);
        throw new Error("Failed to translate PDF. The document might be too large.");
    }
};