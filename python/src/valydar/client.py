from pathlib import Path
from typing import Any, Optional
from urllib.parse import urljoin

import httpx

from .types import (
    DocumentUploadResponse,
    FaceMatchResponse,
    HealthResponse,
    LivenessResult,
    VerificationResponse,
)


class ValydarError(Exception):
    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        super().__init__(f"[{status_code}] {code}: {message}")


class ValydarClient:
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.dev.valydar.com",
        timeout: float = 30.0,
    ) -> None:
        self._client = httpx.Client(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=timeout,
        )

    def _raise_for_error(self, response: httpx.Response) -> None:
        if response.is_success:
            return
        try:
            body = response.json()
            err = body.get("error", {})
            raise ValydarError(
                status_code=response.status_code,
                code=err.get("code", "unknown"),
                message=err.get("message", response.text),
            )
        except ValueError:
            raise ValydarError(
                status_code=response.status_code,
                code="unknown",
                message=response.text,
            )

    def _get(self, path: str) -> httpx.Response:
        resp = self._client.get(path)
        self._raise_for_error(resp)
        return resp

    def _post(self, path: str, json: Optional[dict[str, Any]] = None) -> httpx.Response:
        resp = self._client.post(path, json=json)
        self._raise_for_error(resp)
        return resp

    # ── Health ────────────────────────────────────────────────────────────────

    def health(self) -> HealthResponse:
        resp = self._get("/health")
        return HealthResponse.model_validate(resp.json())

    # ── Verifications ──────────────────────────────────────────────────────────

    def create_verification(
        self,
        client_reference: Optional[str] = None,
        checks: Optional[list[str]] = None,
    ) -> VerificationResponse:
        payload: dict[str, Any] = {
            "client_reference": client_reference or f"py_{id(self)}",
        }
        if checks:
            payload["checks"] = checks
        resp = self._post("/verifications", json=payload)
        return VerificationResponse.model_validate(resp.json())

    def get_verification(self, verification_id: str) -> VerificationResponse:
        resp = self._get(f"/verifications/{verification_id}")
        return VerificationResponse.model_validate(resp.json())

    # ── Documents ──────────────────────────────────────────────────────────────

    def upload_document(
        self,
        verification_id: str,
        image_path: str | Path,
        document_type: Optional[str] = None,
    ) -> DocumentUploadResponse:
        path = Path(image_path)
        files: dict[str, Any] = {
            "file": (path.name, path.read_bytes(), "image/jpeg"),
        }
        if document_type:
            files["document_type"] = (None, document_type)
        resp = self._client.post(
            urljoin(str(self._client.base_url), f"/verifications/{verification_id}/documents"),
            files=files,
        )
        self._raise_for_error(resp)
        return DocumentUploadResponse.model_validate(resp.json())

    def upload_selfie(
        self,
        verification_id: str,
        image_path: str | Path,
    ) -> dict[str, Any]:
        path = Path(image_path)
        files: dict[str, Any] = {
            "file": (path.name, path.read_bytes(), "image/jpeg"),
        }
        resp = self._client.post(
            urljoin(str(self._client.base_url), f"/verifications/{verification_id}/selfie"),
            files=files,
        )
        self._raise_for_error(resp)
        return resp.json()

    # ── Face Match ─────────────────────────────────────────────────────────────

    def face_match(
        self,
        verification_id: str,
        document_id: str,
        selfie_id: str,
    ) -> FaceMatchResponse:
        resp = self._post(
            f"/verifications/{verification_id}/face-match",
            json={"document_id": document_id, "selfie_id": selfie_id},
        )
        return FaceMatchResponse.model_validate(resp.json())

    # ── Liveness ───────────────────────────────────────────────────────────────

    def document_liveness(
        self,
        verification_id: str,
        document_id: str,
    ) -> LivenessResult:
        resp = self._post(
            f"/verifications/{verification_id}/documents/{document_id}/liveness",
        )
        return LivenessResult.model_validate(resp.json())

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "ValydarClient":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()
