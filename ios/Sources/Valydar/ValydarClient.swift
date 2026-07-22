import Foundation

public class ValydarClient {
    private let apiKey: String
    private let baseURL: URL
    private let session: URLSession

    public init(apiKey: String, baseURL: String = "https://api.dev.valydar.com") {
        self.apiKey = apiKey
        self.baseURL = URL(string: baseURL)!
        let config = URLSessionConfiguration.default
        config.httpAdditionalHeaders = ["Authorization": "Bearer \(apiKey)"]
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)
    }

    // MARK: - Verifications

    public func createVerification(
        clientReference: String? = nil,
        checks: [String]? = nil
    ) async throws -> VerificationResponse {
        var body: [String: Any] = [
            "client_reference": clientReference ?? "ios_\(Int(Date().timeIntervalSince1970))"
        ]
        if let checks { body["checks"] = checks }
        return try await post("/verifications", body: body)
    }

    public func getVerification(id: String) async throws -> VerificationResponse {
        try await get("/verifications/\(id)")
    }

    // MARK: - Documents

    public func uploadDocument(
        verificationId: String,
        imageData: Data,
        filename: String = "document.jpg",
        documentType: String? = nil
    ) async throws -> DocumentUploadResponse {
        var components = URLComponents()
        components.scheme = baseURL.scheme
        components.host = baseURL.host
        components.path = "/verifications/\(verificationId)/documents"

        var request = URLRequest(url: components.url!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)

        if let docType = documentType {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"document_type\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(docType)\r\n".data(using: .utf8)!)
        }
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(DocumentUploadResponse.self, from: data)
    }

    // MARK: - Face Match

    public func faceMatch(
        verificationId: String,
        documentId: String,
        selfieId: String
    ) async throws -> FaceMatchResponse {
        try await post(
            "/verifications/\(verificationId)/face-match",
            body: ["document_id": documentId, "selfie_id": selfieId]
        )
    }

    // MARK: - Health

    public func health() async throws -> HealthResponse {
        try await get("/health")
    }

    // MARK: - Internal

    private func get<T: Decodable>(_ path: String) async throws -> T {
        let url = baseURL.appendingPathComponent(path)
        let (data, _) = try await session.data(from: url)
        return try JSONDecoder().decode(T.self, from: data)
    }

    private func post<T: Decodable>(_ path: String, body: Any) async throws -> T {
        let url = baseURL.appendingPathComponent(path)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(T.self, from: data)
    }
}
