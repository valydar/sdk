# Valydar .NET SDK

.NET client library for the Valydar Identity Verification API.

## Installation

```bash
dotnet add package Valydar
```

Or add to `.csproj`:

```xml
<PackageReference Include="Valydar" Version="0.1.0" />
```

## Quick Start

```csharp
using Valydar;

var client = new ValydarClient("your-api-key");

// Check health
var health = await client.HealthAsync();
Console.WriteLine(health.Status);

// Create a verification
var verification = await client.CreateVerificationAsync(
    clientReference: "user-123",
    checks: new() { "document", "face_match", "liveness" }
);
Console.WriteLine($"Verification: {verification.Id}");

// Upload a document
var doc = await client.UploadDocumentAsync(
    verification.Id,
    "/path/to/passport.jpg",
    documentType: "passport"
);
Console.WriteLine($"Document: {doc.DocumentId}");

// Run face match
var result = await client.FaceMatchAsync(
    verification.Id,
    doc.DocumentId,
    selfieId: "selfie-id"
);
Console.WriteLine($"Face match: {result.Passed}, confidence: {result.Confidence}");
```

## API

### ValydarClient

| Method | Description |
|--------|-------------|
| `HealthAsync()` | Check API health |
| `CreateVerificationAsync(clientRef, checks)` | Create a new verification |
| `GetVerificationAsync(id)` | Get verification status |
| `UploadDocumentAsync(verId, imagePath, docType)` | Upload a document image |
| `FaceMatchAsync(verId, docId, selfieId)` | Run face comparison |
