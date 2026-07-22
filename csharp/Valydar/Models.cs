using System.Text.Json.Serialization;

namespace Valydar;

public record HealthResponse(
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("database")] string? Database
);

public record VerificationResponse(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("client_reference")] string ClientReference,
    [property: JsonPropertyName("redirect_url")] string? RedirectUrl,
    [property: JsonPropertyName("checks")] Dictionary<string, object>? Checks,
    [property: JsonPropertyName("created_at")] DateTime? CreatedAt,
    [property: JsonPropertyName("completed_at")] DateTime? CompletedAt
);

public record DocumentUploadResponse(
    [property: JsonPropertyName("document_id")] string DocumentId,
    [property: JsonPropertyName("document_type")] string DocumentType,
    [property: JsonPropertyName("width")] int Width,
    [property: JsonPropertyName("height")] int Height,
    [property: JsonPropertyName("file_size")] int FileSize,
    [property: JsonPropertyName("mime_type")] string MimeType,
    [property: JsonPropertyName("check_result")] Dictionary<string, object>? CheckResult
);

public record FaceRegion(
    [property: JsonPropertyName("x")] int X,
    [property: JsonPropertyName("y")] int Y,
    [property: JsonPropertyName("width")] int Width,
    [property: JsonPropertyName("height")] int Height
);

public record FaceMatchResponse(
    [property: JsonPropertyName("passed")] bool Passed,
    [property: JsonPropertyName("confidence")] double Confidence,
    [property: JsonPropertyName("document_face")] FaceRegion? DocumentFace,
    [property: JsonPropertyName("selfie_face")] FaceRegion? SelfieFace
);

public record LivenessCheck(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("passed")] bool Passed,
    [property: JsonPropertyName("score")] double Score,
    [property: JsonPropertyName("reason")] string Reason
);

public record LivenessResult(
    [property: JsonPropertyName("passed")] bool Passed,
    [property: JsonPropertyName("score")] double Score,
    [property: JsonPropertyName("checks")] List<LivenessCheck> Checks
);

public record ApiError(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message
);
