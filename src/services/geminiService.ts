import { GoogleGenAI } from "@google/genai";
import { TranscriptSegment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function summarizeMeeting(transcript: TranscriptSegment[]): Promise<string | undefined> {
  const text = transcript.map(s => s.text).join(' ');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Resuma a seguinte reunião transcrita de forma executiva, destacando os pontos principais e ações a serem tomadas. Use markdown para formatação. Idioma: Português.\n\nTranscrição: ${text}`,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error summarizing meeting:", error);
    return undefined;
  }
}
