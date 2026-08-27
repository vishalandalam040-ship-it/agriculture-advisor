import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const getAdvisory = async (promptText: string) => {
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: promptText,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};
