# Valydar Python SDK

Python client library for the Valydar Identity Verification API.

## Installation

```bash
pip install valydar
```

Or from source:

```bash
pip install ./sdk/python
```

## Quick Start

```python
from valydar import ValydarClient

client = ValydarClient(api_key="your-api-key")

# Check health
health = client.health()
print(health.status)

# Create a verification
verification = client.create_verification(
    client_reference="user-123",
    checks=["document", "face_match", "liveness"],
)
print(f"Verification: {verification.id}")

# Upload a document
doc = client.upload_document(
    verification.id,
    "/path/to/passport.jpg",
    document_type="passport",
)
print(f"Document: {doc.document_id}")

# Upload a selfie
selfie = client.upload_selfie(verification.id, "/path/to/selfie.jpg")

# Run face match
result = client.face_match(
    verification.id,
    doc.document_id,
    selfie["document_id"],
)
print(f"Face match: {result.passed}, confidence: {result.confidence}")
```

## API

### ValydarClient

| Method | Description |
|--------|-------------|
| `health()` | Check API health |
| `create_verification(client_ref, checks)` | Create a new verification |
| `get_verification(id)` | Get verification status |
| `upload_document(ver_id, image_path, doc_type)` | Upload a document image |
| `upload_selfie(ver_id, image_path)` | Upload a selfie |
| `face_match(ver_id, doc_id, selfie_id)` | Run face comparison |
| `document_liveness(ver_id, doc_id)` | Check document liveness |
