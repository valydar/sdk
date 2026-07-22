import type {
  ValydarConfig,
  VerificationResponse,
  DocumentUploadResponse,
  FaceMatchResponse,
  LivenessResult,
} from './types';

export class ValydarClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ValydarConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.apiUrl ?? 'https://api.dev.valydar.com';
  }

  private async request<T>(
    method: string,
    path: string,
    body?: object | FormData,
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    const isFormData = body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error?.message ?? `HTTP ${res.status}`);
    }

    return res.json();
  }

  async createVerification(
    clientReference?: string,
    checks?: string[],
  ): Promise<VerificationResponse> {
    return this.request<VerificationResponse>('POST', '/verifications', {
      client_reference: clientReference ?? `rn_${Date.now()}`,
      checks: checks ?? ['document', 'face_match', 'liveness'],
    });
  }

  async getVerification(id: string): Promise<VerificationResponse> {
    return this.request<VerificationResponse>('GET', `/verifications/${id}`);
  }

  async uploadDocument(
    verificationId: string,
    imageUri: string,
    documentType?: string,
  ): Promise<DocumentUploadResponse> {
    const form = new FormData();
    form.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'document.jpg',
    } as unknown as Blob);
    if (documentType) {
      form.append('document_type', documentType);
    }
    return this.request<DocumentUploadResponse>(
      'POST',
      `/verifications/${verificationId}/documents`,
      form,
    );
  }

  async uploadSelfie(
    verificationId: string,
    imageUri: string,
  ): Promise<{ document_id: string }> {
    const form = new FormData();
    form.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'selfie.jpg',
    } as unknown as Blob);
    return this.request<{ document_id: string }>(
      'POST',
      `/verifications/${verificationId}/selfie`,
      form,
    );
  }

  async faceMatch(
    verificationId: string,
    documentId: string,
    selfieId: string,
  ): Promise<FaceMatchResponse> {
    return this.request<FaceMatchResponse>(
      'POST',
      `/verifications/${verificationId}/face-match`,
      { document_id: documentId, selfie_id: selfieId },
    );
  }

  async documentLiveness(
    verificationId: string,
    documentId: string,
  ): Promise<LivenessResult> {
    return this.request<LivenessResult>(
      'POST',
      `/verifications/${verificationId}/documents/${documentId}/liveness`,
    );
  }

  async health(): Promise<{ status: string }> {
    return this.request<{ status: string }>('GET', '/health');
  }
}
