import { ScriptAnalysis } from "../types";

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'custom';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  apiUrl?: string;
  model?: string;
}

const getConfig = (): AIConfig => {
  const provider = (localStorage.getItem('ai_provider') || 'openai') as AIProvider;
  const apiKey = localStorage.getItem('ai_api_key') || '';
  const apiUrl = localStorage.getItem('ai_api_url') || '';
  const model = localStorage.getItem('ai_model') || '';

  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 입력해주세요.');
  }

  return { provider, apiKey, apiUrl, model };
};

const callOpenAI = async (messages: any[], config: AIConfig, jsonMode = false) => {
  const model = config.model || 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      ...(jsonMode && { response_format: { type: "json_object" } })
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API 호출 실패');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const callAnthropic = async (prompt: string, config: AIConfig, jsonMode = false) => {
  const model = config.model || 'claude-3-5-sonnet-20241022';
  const systemPrompt = jsonMode 
    ? "You must respond with valid JSON only. Do not include any text outside the JSON structure."
    : "";

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      ...(systemPrompt && { system: systemPrompt }),
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API 호출 실패');
  }

  const data = await response.json();
  return data.content[0].text;
};

const callGemini = async (prompt: string, config: AIConfig, jsonMode = false) => {
  const model = config.model || 'gemini-2.0-flash-exp';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: jsonMode ? {
        responseMimeType: "application/json"
      } : {}
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API 호출 실패');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const callCustomAPI = async (prompt: string, config: AIConfig, jsonMode = false) => {
  if (!config.apiUrl) {
    throw new Error('Custom API URL이 설정되지 않았습니다.');
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      },
      body: JSON.stringify({
        prompt,
        json_mode: jsonMode,
        messages: [{ role: 'user', content: prompt }],
        model: config.model || 'default'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Custom API 호출 실패 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // 다양한 응답 형식 지원
    return data.response || 
           data.content || 
           data.text || 
           data.message?.content ||
           data.choices?.[0]?.message?.content ||
           data.choices?.[0]?.text ||
           JSON.stringify(data);
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('네트워크 오류: API 서버에 연결할 수 없습니다. CORS 설정을 확인하거나 프록시를 사용하세요.');
    }
    throw error;
  }
};

const callAI = async (prompt: string, jsonMode = false): Promise<string> => {
  const config = getConfig();

  switch (config.provider) {
    case 'openai':
      const messages = [{ role: 'user', content: prompt }];
      if (jsonMode) {
        messages.unshift({ 
          role: 'system', 
          content: 'You must respond with valid JSON only. Follow the exact schema requested in the user prompt.' 
        });
      }
      return await callOpenAI(messages, config, jsonMode);
    
    case 'anthropic':
      return await callAnthropic(prompt, config, jsonMode);
    
    case 'gemini':
      return await callGemini(prompt, config, jsonMode);
    
    case 'custom':
      return await callCustomAPI(prompt, config, jsonMode);
    
    default:
      throw new Error(`지원하지 않는 AI 제공자: ${config.provider}`);
  }
};

export const analyzeTranscript = async (transcript: string): Promise<ScriptAnalysis> => {
  if (!transcript) throw new Error("Transcript is required");

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

    Response with valid JSON in this exact schema:
    {
      "hookStrategy": "string",
      "pacing": "string",
      "tone": "string",
      "targetAudience": "string",
      "structure": [
        {
          "sectionName": "string",
          "description": "string"
        }
      ],
      "keyElements": ["string"]
    }
  `;

  const response = await callAI(prompt, true);
  
  // Extract JSON from response if it contains markdown code blocks
  let jsonText = response.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
  }
  
  return JSON.parse(jsonText) as ScriptAnalysis;
};

export const generateNewScript = async (analysis: ScriptAnalysis, topic: string): Promise<string> => {
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

  const response = await callAI(prompt, false);
  
  if (!response) throw new Error("No script generated");
  return response;
};
