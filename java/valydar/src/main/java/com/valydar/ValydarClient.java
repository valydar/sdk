package com.valydar;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class ValydarClient implements AutoCloseable {
    private final HttpClient http;
    private final String baseUrl;
    private final String apiKey;
    private final ObjectMapper mapper;

    public ValydarClient(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl != null ? baseUrl : "https://api.dev.valydar.com";
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
            throw new RuntimeException("HTTP " + resp.statusCode() + ": " + resp.body());
        }
        return mapper.readValue(resp.body(), type);
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
        var req = request("/verifications")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
        return send(req, VerificationResponse.class);
    }

    public VerificationResponse getVerification(String id) throws Exception {
        var req = request("/verifications/" + id).GET().build();
        return send(req, VerificationResponse.class);
    }

    public DocumentUploadResponse uploadDocument(
        String verificationId, Path imagePath, String documentType) throws Exception {
        var boundary = "----boundary" + System.currentTimeMillis();
        var body = new java.io.ByteArrayOutputStream();
        var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(body));

        writer.write("--" + boundary + "\r\n");
        writer.write("Content-Disposition: form-data; name=\"file\"; filename=\""
            + imagePath.getFileName() + "\"\r\n");
        writer.write("Content-Type: image/jpeg\r\n\r\n");
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

        var req = request("/verifications/" + verificationId + "/documents")
            .header("Content-Type", "multipart/form-data; boundary=" + boundary)
            .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()))
            .build();
        return send(req, DocumentUploadResponse.class);
    }

    @Override
    public void close() {}

    public static class CreateVerificationBody {
        public String client_reference;
        public List<String> checks;
    }
}
