// src/types/models.ts
export interface MentalModel {
  id: string;
  name: string;
  category: string;
  summary: string;
}

export interface CognitiveBias {
  id: string;
  name: string;
  category: string;
  summary: string;
}

export interface UserScenario {
  situation: string;
  relevantModelIds: string[];
  relevantBiasIds: string[];
  explanation: string;
}