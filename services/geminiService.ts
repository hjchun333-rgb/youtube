import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysis } from "../types";

const getApiKey = () => {
  return localStorage.getItem('gemini_api_key') || process.env.API_KEY || '';
};

const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 입력해주세요.');
  }
  return new GoogleGenAI({ apiKey });
};

// Model constants
const ANALYSIS_MODEL = "gemini-2.5-flash";
const WRITING_MODEL = "gemini-2.5-flash"; 

export const analyzeTranscript = async (transcript: string): Promise<ScriptAnalysis> => {
  if (!transcript) throw new Error("Transcript is required");
  
  const ai = getAI();

  const prompt = `
    You are an expert YouTube content strategist. Analyze the following video transcript deep down to its core DNA.
    
    I need you to extract the following information. **Provide all string values in Korean (한국어)**:
    1. The specific Hook Strategy used (how they grab attention in the first 30s).
    2. The Pacing (e.g., fast cuts, slow burn, storytelling).
    3. The Tone (e.g., authoritative, chaotic, empathetic, humorous).
    4. The Implied Target Audience.
    5. A breakdown of the Structure (outline key sections like Intro, Conflict, Climax, Payoff, CTA).
    6. Key Elements or stylistic quirks (e.g., rhetorical questions, breaking the fourth wall, data usage).

    Transcript:
    "${transcript.substring(0, 20000)}" 
  `;

  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hookStrategy: { type: Type.STRING },
          pacing: { type: Type.STRING },
          tone: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          structure: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sectionName: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
          },
          keyElements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["hookStrategy", "pacing", "tone", "targetAudience", "structure", "keyElements"],
      },
    },
  });

  if (!response.text) throw new Error("No response from AI");
  
  return JSON.parse(response.text) as ScriptAnalysis;
};

export const generateNewScript = async (analysis: ScriptAnalysis, topic: string): Promise<string> => {
  const ai = getAI();
  const analysisJson = JSON.stringify(analysis, null, 2);
  
  const prompt = `
    You are a world-class YouTube scriptwriter. 
    
    TASK: Write a BRAND NEW YouTube script in Korean (한국어) about the topic: "${topic}".
    
    CRITICAL CONSTRAINT: You must mimic the exact style, structure, and psychological triggers found in this reference analysis:
    ${analysisJson}

    GUIDELINES:
    1. Use the same Hook Strategy identified in the analysis.
    2. Match the Tone and Pacing.
    3. Follow the provided Structure outline step-by-step, adapting it to the new topic.
    4. Include the identified Key Elements.
    5. Do not output JSON. Output the script in clean Markdown format. 
    6. Use bolding for visual cues or emphasis. 
    7. Include [Visual Notes] in brackets to guide editing.
    8. **The entire script must be written in natural, engaging Korean.**

    Ready? Write the viral script now.
  `;

  const response = await ai.models.generateContent({
    model: WRITING_MODEL,
    contents: prompt,
  });

  if (!response.text) throw new Error("No script generated");
  return response.text;
};