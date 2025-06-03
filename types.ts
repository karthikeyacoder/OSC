
export interface RepairMethod {
  method: string;
  description: string;
}

export interface AnalysisResult {
  objectName?: string;
  isFixable: boolean | "maybe" | null;
  fixabilityReason?: string;
  repairMethods?: RepairMethod[] | null;
  estimatedCost?: string | null;
  confidenceScore?: "High" | "Medium" | "Low" | string;
  error?: string; // To communicate errors from Gemini or parsing
}

export interface GeminiAnalysisResponse {
  objectName: string;
  isFixable: boolean | "maybe";
  fixabilityReason?: string;
  repairMethods: RepairMethod[] | null;
  estimatedCost: string | null;
  confidenceScore: "High" | "Medium" | "Low" | string;
}
