import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion } from "../types";

// NOTE: In a real app, this key should be secured. 
// For this demo, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateResumeSuggestions = async (
  jobTitle: string,
  currentSection: 'summary' | 'experience',
  context: string = ''
): Promise<Suggestion[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini");
    return [
      { id: '1', text: "Mock suggestion: Strong leader with 5 years experience..." },
      { id: '2', text: "Mock suggestion: Proven track record in project management..." },
    ];
  }

  try {
    // Using gemini-2.5-flash for reliability and standard text tasks
    const prompt = `You are a professional resume writer. 
    Generate 3 distinct, professional ${currentSection} suggestions for a ${jobTitle}.
    Context: ${context}.
    Keep them concise and impactful. Return JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              suggestion: { type: Type.STRING }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data.map((item: any, index: number) => ({
      id: `sug-${index}-${Date.now()}`,
      text: item.suggestion
    }));

  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
};

export const getChatResponseStream = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string
) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  // Using gemini-2.5-flash for the smart chatbot
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    config: {
      systemInstruction: "You are a helpful expert resume consultant named 'SmartBot'. Help users improve their resumes, cover letters, and career advice. Be concise and encouraging."
    }
  });

  return await chat.sendMessageStream({ message: newMessage });
};