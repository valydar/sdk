# Valydar Flutter SDK

Identity verification SDK for Flutter apps. Captures document photos and selfies, communicates with the Valydar API.

## Installation

Add to `pubspec.yaml`:

```yaml
dependencies:
  valydar_flutter:
    path: ./sdk/flutter
```

## Quick Start

```dart
import 'package:valydar_flutter/valydar.dart';

final client = ValydarClient(
  apiKey: 'your-api-key',
  baseUrl: 'https://api.dev.valydar.com',
);

// Create a verification
final verification = await client.createVerification(
  clientReference: 'ref-123',
  checks: ['document', 'face_match', 'liveness'],
);

// Document capture
DocumentCapture(
  documentType: 'passport',
  onCapture: (file) async {
    final result = await client.uploadDocument(
      verification['id'],
      file,
      'passport',
    );
  },
);

// Selfie capture
SelfieCapture(
  onCapture: (file) async {
    final result = await client.uploadSelfie(
      verification['id'],
      file,
    );
  },
);
```

## API

### ValydarClient

| Method | Description |
|--------|-------------|
| `createVerification(clientRef, checks)` | Create a new verification |
| `getVerification(id)` | Get verification status |
| `uploadDocument(verId, image, docType)` | Upload a document image |
| `uploadSelfie(verId, image)` | Upload a selfie |
| `faceMatch(verId, docId, selfieId)` | Run face comparison |
| `documentLiveness(verId, docId)` | Check document liveness |
| `health()` | Check API health |

### Widgets

- **DocumentCapture** — Camera viewfinder with document framing guide
- **SelfieCapture** — Camera with oval face guide
