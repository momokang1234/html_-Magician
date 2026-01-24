
import { GoogleGenAI } from "@google/genai";

export const improveCodeWithAI = async (currentCode: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Improve the following HTML/CSS code to make it look professional, modern, and aesthetic. Return ONLY the complete HTML code block. Do not include markdown formatting or explanations.\n\nCode:\n${currentCode}`,
    });
    
    const text = response.text;
    // Clean up markdown if AI includes it
    return text?.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim() || currentCode;
  } catch (error) {
    console.error("AI Improvement failed:", error);
    return currentCode;
  }
};
