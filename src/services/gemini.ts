import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const gemini = {
  async translate(text: string): Promise<string> {
    if (!text || text.length < 5) return text;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Traduza o seguinte texto de RPG (D&D 5e) para o Português do Brasil. Mantenha os termos técnicos padrão (como Armor Class -> Classe de Armadura, Hit Points -> Pontos de Vida, etc). Retorne APENAS o texto traduzido em Markdown:\n\n${text}`,
      });
      return response.text || text;
    } catch (error) {
      console.error("Translation failed", error);
      return text;
    }
  }
};
