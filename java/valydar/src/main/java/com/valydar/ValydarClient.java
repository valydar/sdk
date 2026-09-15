package com.valydar;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ValydarClient implements AutoCloseable {
    private static final String CONTENT_TYPE = "Content-Type";
    private static final String APPLICATION_JSON = "application/json";
    private static final String IMAGE_JPEG = "image/jpeg";
    private static final String VERIFICATIONS_ROOT = "/verifications"; // NOSONAR - API path, not configurable
    private static final String VERIFICATIONS_PATH = "/verifications/"; // NOSONAR - API path, not configurable
    private static final String BOUNDARY_PREFIX = "----boundary";
    private static final String MULTIPART_BOUNDARY = "multipart/form-data; boundary=";

    /** Default API endpoint used when no explicit base URL is supplied. */
    public static final String DEFAULT_BASE_URL = "https://api.dev.valydar.com";

    private final HttpClient http;
    private final String baseUrl;
    private final String apiKey;
    private final ObjectMapper mapper;

    public ValydarClient(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl != null ? baseUrl : DEFAULT_BASE_URL;
        this.http = HttpClient.newBuilder().build();
        this.mapper = new ObjectMapper();
    }

    public ValydarClient(String apiKey) {
        this(apiKey, null);
    }

    private HttpRequest.Builder request(String path) {
        return HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .header("Authorization", "Bearer " + apiKey);
    }

    private <T> T send(HttpRequest request, Class<T> type) throws Exception {
        var resp = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 400) {
            throw new ValydarException("HTTP " + resp.statusCode() + ": " + resp.body());
        }
        return mapper.readValue(resp.body(), type);
    }

    private String sendRaw(HttpRequest request) throws Exception {
        var resp = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 400) {
            throw new ValydarException("HTTP " + resp.statusCode() + ": " + resp.body());
        }
        return resp.body();
    }

    private Map<String, Object> sendMap(HttpRequest request) throws Exception {
        return mapper.readValue(sendRaw(request), new TypeReference<Map<String, Object>>() {});
    }

    private record MultipartPart(
        String name, String filename, String contentType, byte[] content) {}

    public static class ValydarException extends RuntimeException {
        public ValydarException(String message) {
            super(message);
        }
    }

    private byte[] buildMultipart(String boundary, List<MultipartPart> parts) throws Exception {
        var body = new java.io.ByteArrayOutputStream();
        var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(body));

        for (var part : parts) {
            writer.write("--" + boundary + "\r\n");
            writer.write("Content-Disposition: form-data; name=\"" + part.name + "\"");
            if (part.filename != null) {
                writer.write("; filename=\"" + part.filename + "\"");
            }
            writer.write("\r\n");
            if (part.contentType != null) {
                writer.write(CONTENT_TYPE + ": " + part.contentType + "\r\n\r\n");
            } else {
                writer.write("\r\n");
            }
            writer.flush();
            body.write(part.content);
            writer.write("\r\n");
        }

        writer.write("--" + boundary + "--\r\n");
        writer.flush();
        return body.toByteArray();
    }

    public HealthResponse health() throws Exception {
        var req = request("/health").GET().build();
        return send(req, HealthResponse.class);
    }

    public VerificationResponse createVerification(
        String clientReference, List<String> checks) throws Exception {
        var body = mapper.writeValueAsString(new Object() {
            public final String client_reference = clientReference;
            public final List<String> checks = checks;
        });
        var req = request(VERIFICATIONS_ROOT)
            .header(CONTENT_TYPE, APPLICATION_JSON)
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
        return send(req, VerificationResponse.class);
    }

    public VerificationResponse getVerification(String id) throws Exception {
        var req = request(VERIFICATIONS_PATH + id).GET().build();
        return send(req, VerificationResponse.class);
    }

    public DocumentUploadResponse uploadDocument(
        String verificationId, Path imagePath, String documentType) throws Exception {
        var boundary = BOUNDARY_PREFIX + System.currentTimeMillis();
        var body = new java.io.ByteArrayOutputStream();
        var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(body));

        writer.write("--" + boundary + "\r\n");
        writer.write("Content-Disposition: form-data; name=\"file\"; filename=\""
            + imagePath.getFileName() + "\"\r\n");
        writer.write(CONTENT_TYPE + ": " + IMAGE_JPEG + "\r\n\r\n");
        writer.flush();
        body.write(Files.readAllBytes(imagePath));
        writer.write("\r\n");

        if (documentType != null) {
            writer.write("--" + boundary + "\r\n");
            writer.write("Content-Disposition: form-data; name=\"document_type\"\r\n\r\n");
            writer.write(documentType + "\r\n");
        }
        writer.write("--" + boundary + "--\r\n");
        writer.flush();

        var req = request(VERIFICATIONS_PATH + verificationId + "/documents")
            .header(CONTENT_TYPE, MULTIPART_BOUNDARY + boundary)
            .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()))
            .build();
        return send(req, DocumentUploadResponse.class);
    }

    public SelfieLivenessResponse selfieLiveness(String id) throws Exception {
        var req = request(VERIFICATIONS_PATH + id + "/selfie-liveness")
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();
        return send(req, SelfieLivenessResponse.class);
    }

    public DeepfakeResult deepfake(String id) throws Exception {
        var req = request(VERIFICATIONS_PATH + id + "/deepfake")
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();
        return send(req, DeepfakeResult.class);
    }

    public NfcResult verifyNfc(String id, Map<String, Object> expectedDg1) throws Exception {
        var body = mapper.writeValueAsString(new Object() {
            public final Map<String, Object> expected_dg1 = expectedDg1;
        });
        var req = request(VERIFICATIONS_PATH + id + "/nfc")
            .header(CONTENT_TYPE, APPLICATION_JSON)
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
        return send(req, NfcResult.class);
    }

    public ActiveLivenessChallenge activeLivenessChallenge(
        String id, String challengeType) throws Exception {
        var body = mapper.writeValueAsString(new Object() {
            public final String challenge_type = challengeType;
        });
        var req = request(VERIFICATIONS_PATH + id + "/active-liveness/challenge")
            .header(CONTENT_TYPE, APPLICATION_JSON)
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
        return send(req, ActiveLivenessChallenge.class);
    }

    public ActiveLivenessResult activeLivenessVerify(
        String id, String challengeId, List<String> frames) throws Exception {
        var body = mapper.writeValueAsString(new Object() {
            public final String challenge_id = challengeId;
            public final List<String> frames = frames;
        });
        var req = request(VERIFICATIONS_PATH + id + "/active-liveness/verify")
            .header(CONTENT_TYPE, APPLICATION_JSON)
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
        return send(req, ActiveLivenessResult.class);
    }

    public ListVerificationsResponse listVerifications() throws Exception {
        var req = request(VERIFICATIONS_ROOT).GET().build();
        return send(req, ListVerificationsResponse.class);
    }

    public FaceMatchResponse faceMatch(
        String id, String documentId, String selfieId) throws Exception {
        var body = mapper.writeValueAsString(new Object() {
            public final String document_id = documentId;
            public final String selfie_id = selfieId;
        });
        var req = request(VERIFICATIONS_PATH + id + "/face-match")
            .header(CONTENT_TYPE, APPLICATION_JSON)
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
        return send(req, FaceMatchResponse.class);
    }

    public LivenessResult documentLiveness(String id, String documentId) throws Exception {
        var req = request(VERIFICATIONS_PATH + id + "/documents/" + documentId + "/liveness")
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();
        return send(req, LivenessResult.class);
    }

    public String uploadSelfie(String id, Path imagePath) throws Exception {
        var boundary = BOUNDARY_PREFIX + System.currentTimeMillis();
        var multipart = buildMultipart(boundary, List.of(
            new MultipartPart("file", imagePath.getFileName().toString(), IMAGE_JPEG,
                Files.readAllBytes(imagePath))
        ));
        var req = request(VERIFICATIONS_PATH + id + "/selfie")
            .header(CONTENT_TYPE, MULTIPART_BOUNDARY + boundary)
            .POST(HttpRequest.BodyPublishers.ofByteArray(multipart))
            .build();
        return sendRaw(req);
    }

    public Map<String, Object> demoVerify(
        Path documentPath, Path selfiePath, List<String> checks) throws Exception {
        var boundary = BOUNDARY_PREFIX + System.currentTimeMillis();
        var parts = new ArrayList<MultipartPart>();
        parts.add(new MultipartPart("document", documentPath.getFileName().toString(),
            IMAGE_JPEG, Files.readAllBytes(documentPath)));
        if (selfiePath != null) {
            parts.add(new MultipartPart("selfie", selfiePath.getFileName().toString(),
                IMAGE_JPEG, Files.readAllBytes(selfiePath)));
        }
        if (checks != null && !checks.isEmpty()) {
            parts.add(new MultipartPart("checks", null, null,
                String.join(",", checks).getBytes(StandardCharsets.UTF_8)));
        }
        var multipart = buildMultipart(boundary, parts);
        var req = request("/demo/verify")
            .header(CONTENT_TYPE, MULTIPART_BOUNDARY + boundary)
            .POST(HttpRequest.BodyPublishers.ofByteArray(multipart))
            .build();
        return sendMap(req);
    }

    @Override
    public void close() {}

    public static class CreateVerificationBody {
        public String client_reference;
        public List<String> checks;
    }
}
