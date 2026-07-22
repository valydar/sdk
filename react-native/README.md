# Valydar React Native SDK

Identity verification SDK for React Native apps. Captures document photos and selfies, communicates with the Valydar API.

## Installation

```
npm install @valydar/react-native react-native-vision-camera
```

## Quick Start

```tsx
import { ValydarClient, DocumentCapture, SelfieCapture } from '@valydar/react-native';

const client = new ValydarClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://api.dev.valydar.com',
});

// Create a verification
const verification = await client.createVerification('ref-123', [
  'document', 'face_match', 'liveness',
]);

// Document capture screen
<DocumentCapture
  verificationId={verification.id}
  apiKey="your-api-key"
  documentType="passport"
  onComplete={(result) => console.log('Document uploaded', result)}
  onError={(err) => console.error(err)}
/>

// Selfie capture screen
<SelfieCapture
  verificationId={verification.id}
  apiKey="your-api-key"
  onComplete={(result) => console.log('Selfie uploaded', result)}
  onError={(err) => console.error(err)}
/>
```

## API

### ValydarClient

| Method | Description |
|--------|-------------|
| `createVerification(clientRef, checks)` | Create a new verification |
| `getVerification(id)` | Get verification status |
| `uploadDocument(verId, imageUri, docType)` | Upload a document image |
| `uploadSelfie(verId, imageUri)` | Upload a selfie |
| `faceMatch(verId, docId, selfieId)` | Run face comparison |
| `documentLiveness(verId, docId)` | Check document liveness |
| `health()` | Check API health |

### Components

- **DocumentCapture** — Camera viewfinder with document framing guide
- **SelfieCapture** — Camera with oval face guide
