export interface ScriptAnalysis {
  hookStrategy: string;
  pacing: string;
  tone: string;
  targetAudience: string;
  structure: {
    sectionName: string;
    description: string;
  }[];
  keyElements: string[];
}

export enum AppStep {
  INPUT_TRANSCRIPT = 0,
  ANALYZING = 1,
  REVIEW_ANALYSIS = 2,
  INPUT_TOPIC = 3,
  GENERATING = 4,
  RESULT = 5,
}

export interface GenerationRequest {
  referenceAnalysis: ScriptAnalysis;
  newTopic: string;
}
