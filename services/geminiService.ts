
import { GoogleGenAI, Type } from "@google/genai";
import { DrugInfo } from "../types";

const API_KEY = process.env.API_KEY || '';

export const fetchFacilityData = async (drugName: string): Promise<DrugInfo> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Find all FDA-approved manufacturing facilities for the drug "${drugName}". 
    For each facility, provide the name, location (formatted exactly as: City, State/Province, Country), FEI number, the type of manufacturing they perform (e.g., Active Pharmaceutical Ingredient (API), Finished Dosage Form, or Packaging), 
    their most recent known FDA inspection status, a rough capacity estimate, and at least 2 interesting facts or history about that specific site.
    
    If the facility is in the United States, ensure the State is clearly provided (e.g., "Chicago, IL, USA").
    Format the response as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            manufacturer: { type: Type.STRING },
            approvalDate: { type: Type.STRING },
            drugClass: { type: Type.STRING },
            sites: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  siteName: { type: Type.STRING },
                  location: { type: Type.STRING },
                  type: { type: Type.STRING },
                  feiNumber: { type: Type.STRING },
                  inspectionStatus: { type: Type.STRING, enum: ['Acceptable', 'Needs Improvement', 'Critical', 'Unknown'] },
                  lastInspectionDate: { type: Type.STRING },
                  interestingFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  capacityEstimate: { type: Type.STRING }
                },
                required: ['siteName', 'location', 'type']
              }
            }
          },
          required: ['name', 'sites']
        }
      }
    });

    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr);
    
    // Extract sources from grounding metadata
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '#'
    })) || [];

    return { ...data, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch medicine manufacturing data. Please try again.");
  }
};
