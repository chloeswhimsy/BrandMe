import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, PersonalBrandResult, InspirationSnippet, InspirationData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateInspiration(jobFunction: string, industry: string): Promise<InspirationData> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate 5 realistic LinkedIn summary snippets for professionals in the ${industry} industry working in ${jobFunction}. 
    Also provide a list of 15-20 trending keywords/skills for this specific role and industry with a "size" weight (1-10) for a word cloud.
    Format as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          snippets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                summarySentence: { type: Type.STRING }
              },
              required: ["name", "role", "summarySentence"]
            }
          },
          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                size: { type: Type.NUMBER }
              },
              required: ["text", "size"]
            }
          }
        },
        required: ["snippets", "keywords"]
      }
    }
  });

  return JSON.parse(response.text || '{"snippets":[], "keywords":[]}');
}

export async function generateFinalBrand(profile: UserProfile): Promise<PersonalBrandResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Based on the following user data, generate three distinct styles of personal brand identity:
    
    Questionnaire: ${JSON.stringify(profile.questionnaireAnswers)}
    Documents Provided: ${Object.keys(profile.uploadedDocs).join(", ")}
    Industry/Role: ${profile.industry} / ${profile.jobFunction}
    Resume/LinkedIn: ${profile.resumeText} ${profile.linkedinUrl}
    Personal Nuance/Fun Facts: ${profile.personalNuance || "None provided"}
    
    Generate content for these 3 styles: "Professional", "Natural/Authentic", and "Witty/Creative".
    For each style, provide:
    1. A short example snippet to help the user choose.
    2. What distinguishes them from their peers (1 sentence).
    3. A one-sentence brand summary.
    4. A 200-word LinkedIn summary.
    5. Top 5 strengths.
    6. Top 5 values.
    7. 5 key words about them.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          styles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                styleName: { type: Type.STRING },
                exampleSnippet: { type: Type.STRING },
                distinction: { type: Type.STRING },
                oneSentenceSummary: { type: Type.STRING },
                longSummary: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                values: { type: Type.ARRAY, items: { type: Type.STRING } },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["styleName", "exampleSnippet", "distinction", "oneSentenceSummary", "longSummary", "strengths", "values", "keywords"]
            }
          }
        },
        required: ["styles"]
      }
    }
  });

  return JSON.parse(response.text || '{"styles":[]}');
}
