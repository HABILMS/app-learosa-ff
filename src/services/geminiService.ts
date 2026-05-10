import { TranscriptSegment } from "../types";

export async function summarizeMeeting(transcript: TranscriptSegment[]): Promise<string | undefined> {
  const text = transcript.map(s => s.text).join(' ');
  
  try {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: 'pt-BR' })
    });
    
    if (!res.ok) {
      throw new Error(`Failed to summarize: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.summary;
  } catch (error) {
    console.error("Error summarizing meeting:", error);
    alert('Erro ao resumir. Verifique se as chaves de API estão configuradas (NVIDIA/GEMINI).');
    return undefined;
  }
}
