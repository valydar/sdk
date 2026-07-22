import Foundation

public struct HealthResponse: Codable {
    public let status: String
    public let database: String?
}

public struct VerificationResponse: Codable {
    public let id: String
    public let status: String
    public let clientReference: String
    public let redirectUrl: String?
    public let checks: [String: AnyCodable]?
    public let createdAt: String?
    public let completedAt: String?

    enum CodingKeys: String, CodingKey {
        case id, status, checks
        case clientReference = "client_reference"
        case redirectUrl = "redirect_url"
        case createdAt = "created_at"
        case completedAt = "completed_at"
    }
}

public struct DocumentUploadResponse: Codable {
    public let documentId: String
    public let documentType: String
    public let width: Int
    public let height: Int
    public let fileSize: Int
    public let mimeType: String

    enum CodingKeys: String, CodingKey {
        case documentId = "document_id"
        case documentType = "document_type"
        case width, height
        case fileSize = "file_size"
        case mimeType = "mime_type"
    }
}

public struct FaceRegion: Codable {
    public let x: Int
    public let y: Int
    public let width: Int
    public let height: Int
}

public struct FaceMatchResponse: Codable {
    public let passed: Bool
    public let confidence: Double
    public let documentFace: FaceRegion?
    public let selfieFace: FaceRegion?

    enum CodingKeys: String, CodingKey {
        case passed, confidence
        case documentFace = "document_face"
        case selfieFace = "selfie_face"
    }
}

/// Wrapper for arbitrary JSON values
public struct AnyCodable: Codable {
    public let value: Any

    public init(_ value: Any) { self.value = value }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let intVal = try? container.decode(Int.self) { value = intVal }
        else if let doubleVal = try? container.decode(Double.self) { value = doubleVal }
        else if let boolVal = try? container.decode(Bool.self) { value = boolVal }
        else if let stringVal = try? container.decode(String.self) { value = stringVal }
        else if let arrayVal = try? container.decode([AnyCodable].self) { value = arrayVal.map(\.value) }
        else if let dictVal = try? container.decode([String: AnyCodable].self) { value = dictVal.mapValues(\.value) }
        else { value = "null" }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if let intVal = value as? Int { try container.encode(intVal) }
        else if let doubleVal = value as? Double { try container.encode(doubleVal) }
        else if let boolVal = value as? Bool { try container.encode(boolVal) }
        else if let stringVal = value as? String { try container.encode(stringVal) }
    }
}
