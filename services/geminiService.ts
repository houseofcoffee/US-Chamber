import { GoogleGenAI, Type } from "@google/genai";
import { Member } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSampleMembers = async (): Promise<Member[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate 3 realistic business professional profiles for a directory. They should have diverse specialties from this list: Agriculture, Consulting, E-Commerce, Financial Services, Healthcare, Landscaping, Marketing, Media, Retail, Technology. Ensure phone numbers and emails look realistic but are fictional.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              photoUrl: { type: Type.STRING },
              name: { type: Type.STRING },
              phoneNumber: { type: Type.STRING },
              email: { type: Type.STRING },
              businessWebsite: { type: Type.STRING },
              businessName: { type: Type.STRING },
              businessAddress: { type: Type.STRING },
              specialties: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "name", "phoneNumber", "email", "businessName", "specialties"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const rawData = JSON.parse(jsonText);
    
    // Post-processing to ensure types match and images exist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawData.map((item: any, index: number) => ({
      ...item,
      id: crypto.randomUUID(),
      // Override with reliable placeholder images if the AI generates generic URLs
      photoUrl: `https://picsum.photos/seed/${item.name.replace(/\s/g, '')}${index}/400/300`,
      // Ensure specialties are valid (GenAI usually follows instructions but good to be safe)
      specialties: item.specialties.slice(0, 2) // Enforce max 2 just in case
    }));

  } catch (error) {
    console.error("Failed to generate members:", error);
    throw error;
  }
};
