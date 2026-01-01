
import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion, Resume, ResumeScore } from "../types";

// Always use the environment variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImageWithGemini = async (base64ImageData: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodedString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodedString}`;
        }
      }
    }
    
    throw new Error("Gemini did not return an image part.");
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};

export const generateResumeSuggestions = async (
  jobTitle: string,
  currentSection: 'summary' | 'experience' | 'education',
  context: string = '',
  options: { targetJob?: string; industry?: string; tone?: string } = {}
): Promise<Suggestion[]> => {
  try {
    let prompt = `You are an expert resume writer. `;
    
    if (currentSection === 'summary') {
      prompt += `Generate 3 professional summary variations for a ${jobTitle}. 
      Current draft: "${context}". 
      Focus on impact, skills, and carrier trajectory.`;
    } else if (currentSection === 'experience') {
      prompt += `Generate 3 professional accomplishment bullet points for the role of ${jobTitle}. 
      Current input: "${context}". 
      Use strong action verbs, quantify results if possible, and focus on achievements rather than just duties.`;
    } else if (currentSection === 'education') {
      prompt += `Generate 3 variations for the "Achievements and Coursework" section of a resume entry. 
      Degree context: "${context}". 
      Include mentions of relevant coursework, honors, GPA if high, or academic projects.`;
    }

    if (options.targetJob) {
      prompt += ` Target Job: ${options.targetJob}.`;
    }

    prompt += ` Return exactly 3 distinct, concise suggestions in JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              suggestion: { type: Type.STRING }
            },
            required: ["suggestion"]
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
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    config: {
      systemInstruction: `You are 'SmartBot', the dedicated AI assistant for 'Smart Resume Builder'. 
Your ONLY purpose is to help users with the Smart Resume Builder application, including its features (templates, AI suggestions, scoring, saving drafts), navigation, profile settings, or user issues within the app.

STRICT TOPIC FILTERING: 
If the user asks about ANYTHING unrelated to the Smart Resume Builder application (e.g., general knowledge, coding help, entertainment, news, math, recipes), you MUST politely decline and respond EXACTLY with this phrase:
"I'm here to help you with the Smart Resume Builder only. For questions outside this app, please refer to another source. How can I assist you with your resume today?"

Do not provide information on external topics under any circumstances. Always remain professional, focused, and friendly within the context of the application.`
    }
  });

  return await chat.sendMessageStream({ message: newMessage });
};

export const analyzeResume = async (resume: Resume): Promise<ResumeScore> => {
  const prompt = `Critique this resume JSON for ATS compatibility and impact. Return score (0-100) and 3 specific tips.
  Resume: ${JSON.stringify(resume)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall: { type: Type.INTEGER },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                quality: { type: Type.INTEGER },
                relevance: { type: Type.INTEGER },
                skills: { type: Type.INTEGER },
                clarity: { type: Type.INTEGER },
                ats: { type: Type.INTEGER },
              }
            },
            feedback: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}') as ResumeScore;
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    return {
      overall: 0,
      breakdown: { quality: 0, relevance: 0, skills: 0, clarity: 0, ats: 0 },
      feedback: ["Analysis error. Please try again."]
    };
  }
};
