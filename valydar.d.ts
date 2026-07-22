/**
 * Valydar Web SDK — TypeScript type definitions
 */

export interface ValydarConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface CreateVerificationOpts {
  checks?: string[];
  clientReference?: string;
  redirectUrl?: string;
}

export interface VerificationResponse {
  id: string;
  status: "pending" | "completed" | "failed";
  client_reference: string;
  redirect_url?: string;
  checks?: Record<string, CheckResult>;
  created_at?: string;
  completed_at?: string;
}

export interface CheckResult {
  passed: boolean;
  details?: Record<string, unknown>;
}

export interface DocumentUploadResponse {
  id: string;
  document_type: string;
  filename?: string;
  mime_type?: string;
  width?: number;
  height?: number;
  file_size?: number;
  check?: CheckResult;
}

export interface SelfieUploadResponse {
  selfie_id: string;
  liveness: LivenessResult;
}

export interface LivenessResult {
  passed: boolean;
  score: number;
  checks: LivenessCheck[];
}

export interface LivenessCheck {
  name: string;
  passed: boolean;
  score: number;
  reason: string;
}

export interface FaceMatchResponse {
  passed: boolean;
  confidence: number;
  document_face?: { x: number; y: number; width: number; height: number };
  selfie_face?: { x: number; y: number; width: number; height: number };
  details?: Record<string, unknown>;
}

export interface DocLivenessResponse {
  passed: boolean;
  score: number;
  checks: DocLivenessCheck[];
}

export interface DocLivenessCheck {
  name: string;
  passed: boolean;
  score: number;
  reason: string;
}

export interface HealthResponse {
  status: string;
}

export declare class Valydar {
  constructor(config: ValydarConfig);

  createVerification(opts?: CreateVerificationOpts): Promise<VerificationResponse>;
  getVerification(id: string): Promise<VerificationResponse>;
  waitForCompletion(
    id: string,
    onProgress?: (data: VerificationResponse) => void
  ): Promise<VerificationResponse>;

  uploadDocument(
    verificationId: string,
    image: File | Blob | string,
    documentType?: string
  ): Promise<DocumentUploadResponse>;

  uploadSelfie(
    verificationId: string,
    image: File | Blob | string
  ): Promise<SelfieUploadResponse>;

  faceMatch(
    verificationId: string,
    documentId: string,
    selfieId: string
  ): Promise<FaceMatchResponse>;

  documentLiveness(
    verificationId: string,
    documentId: string
  ): Promise<DocLivenessResponse>;

  health(): Promise<HealthResponse>;
}
