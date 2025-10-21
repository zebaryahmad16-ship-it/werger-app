
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// FIX: Use systemInstruction for persona and task definition.
const systemInstruction = "You are an expert translator. Your task is to translate the provided content from its source language (which will be either English or Arabic) into the Kurdish (Badini dialect). Provide only the translated text as your response, without any extra explanations or pleasantries.";

export const translateText = async (text: string): Promise<string> => {
  try {
    // FIX: Call ai.models.generateContent directly and use systemInstruction.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate this text:\n\n---\n${text}\n---`,
      config: {
        systemInstruction,
      },
    });
    return response.text;
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
      text: `Extract and translate the text from this image.`
    };

    // FIX: Call ai.models.generateContent directly and use systemInstruction.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error translating image:", error);
    throw new Error("Failed to translate image. Please try again.");
  }
};

export const translatePdfText = async (text: string): Promise<string> => {
    try {
        // For very large texts, we might need to chunk it, but for now we send it all.
        // FIX: Call ai.models.generateContent directly and use systemInstruction.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the text extracted from this PDF document, preserving paragraphs and structure as much as possible:\n\n---\n${text}\n---`,
            config: {
                systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error translating PDF text:", error);
        throw new Error("Failed to translate PDF. The document might be too large.");
    }
};
