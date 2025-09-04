
import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available. In a real app, you'd have a more robust way to handle this.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROSE_CHUNK_PROMPT = `
You are an expert social media content editor. Your task is to split a long piece of prose into smaller, readable chunks, with each chunk suitable for a single Instagram carousel slide.

Rules:
1.  Each chunk should be no more than 280 characters.
2.  Try to break the text at natural points, like the end of sentences or paragraphs. Avoid splitting sentences in the middle if possible.
3.  Do not add any extra commentary, greetings, or explanations.
4.  The output must be a JSON array of strings, where each string is a chunk of text for a slide.

Here is the prose:
`;

export async function chunkProseForCarousel(prose: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${PROSE_CHUNK_PROMPT}\n\n"${prose}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A chunk of prose for a single carousel slide.",
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const chunks = JSON.parse(jsonString);

    if (!Array.isArray(chunks) || !chunks.every(item => typeof item === 'string')) {
        throw new Error("AI returned data in an unexpected format.");
    }

    return chunks;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to process prose with the Gemini API.");
  }
}
