from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    database: Optional[str] = None


class VerificationResponse(BaseModel):
    id: str
    status: str
    client_reference: str
    redirect_url: Optional[str] = None
    checks: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class DocumentUploadResponse(BaseModel):
    document_id: str
    document_type: str
    width: int
    height: int
    file_size: int
    mime_type: str
    check_result: Optional[dict[str, Any]] = None


class FaceRegion(BaseModel):
    x: int
    y: int
    width: int
    height: int


class FaceMatchResponse(BaseModel):
    passed: bool
    confidence: float
    document_face: Optional[FaceRegion] = None
    selfie_face: Optional[FaceRegion] = None


class LivenessCheck(BaseModel):
    name: str
    passed: bool
    score: float
    reason: str


class LivenessResult(BaseModel):
    passed: bool
    score: float
    checks: list[LivenessCheck]


class DocLivenessResponse(BaseModel):
    passed: bool
    score: float
    checks: list[LivenessCheck]


class ApiError(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ApiError
