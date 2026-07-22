export interface ValydarConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface VerificationResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
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
  document_id: string;
  document_type: string;
  width: number;
  height: number;
  file_size: number;
  mime_type: string;
  check_result?: {
    passed: boolean;
    details: Record<string, unknown>;
  };
}

export interface FaceMatchResponse {
  passed: boolean;
  confidence: number;
  document_face?: FaceRegion;
  selfie_face?: FaceRegion;
}

export interface FaceRegion {
  x: number;
  y: number;
  width: number;
  height: number;
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

export interface CaptureCallbacks {
  onCapture: (uri: string) => void;
  onError: (error: Error) => void;
}

export interface DocumentCaptureProps {
  verificationId: string;
  apiKey: string;
  apiUrl?: string;
  documentType?: string;
  onComplete: (result: DocumentUploadResponse) => void;
  onError: (error: Error) => void;
}

export interface SelfieCaptureProps {
  verificationId: string;
  apiKey: string;
  apiUrl?: string;
  onComplete: (liveness: LivenessResult) => void;
  onError: (error: Error) => void;
}
