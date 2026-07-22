package com.valydar;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HealthResponse(
    @JsonProperty("status") String status,
    @JsonProperty("database") String database
) {}

@JsonIgnoreProperties(ignoreUnknown = true)
public record VerificationResponse(
    @JsonProperty("id") String id,
    @JsonProperty("status") String status,
    @JsonProperty("client_reference") String clientReference,
    @JsonProperty("redirect_url") String redirectUrl,
    @JsonProperty("checks") Map<String, Object> checks,
    @JsonProperty("created_at") String createdAt,
    @JsonProperty("completed_at") String completedAt
) {}

@JsonIgnoreProperties(ignoreUnknown = true)
public record DocumentUploadResponse(
    @JsonProperty("document_id") String documentId,
    @JsonProperty("document_type") String documentType,
    @JsonProperty("width") int width,
    @JsonProperty("height") int height,
    @JsonProperty("file_size") int fileSize,
    @JsonProperty("mime_type") String mimeType,
    @JsonProperty("check_result") Map<String, Object> checkResult
) {}

@JsonIgnoreProperties(ignoreUnknown = true)
public record FaceRegion(
    @JsonProperty("x") int x,
    @JsonProperty("y") int y,
    @JsonProperty("width") int width,
    @JsonProperty("height") int height
) {}

@JsonIgnoreProperties(ignoreUnknown = true)
public record FaceMatchResponse(
    @JsonProperty("passed") boolean passed,
    @JsonProperty("confidence") double confidence,
    @JsonProperty("document_face") FaceRegion documentFace,
    @JsonProperty("selfie_face") FaceRegion selfieFace
) {}

@JsonIgnoreProperties(ignoreUnknown = true)
public record LivenessCheck(
    @JsonProperty("name") String name,
    @JsonProperty("passed") boolean passed,
    @JsonProperty("score") double score,
    @JsonProperty("reason") String reason
) {}

@JsonIgnoreProperties(ignoreUnknown = true)
public record LivenessResult(
    @JsonProperty("passed") boolean passed,
    @JsonProperty("score") double score,
    @JsonProperty("checks") List<LivenessCheck> checks
) {}
