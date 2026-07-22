package com.valydar

import kotlinx.serialization.Serializable

@Serializable
data class HealthResponse(
    val status: String,
    val database: String? = null
)

@Serializable
data class VerificationResponse(
    val id: String,
    val status: String,
    @SerialName("client_reference") val clientReference: String,
    @SerialName("redirect_url") val redirectUrl: String? = null,
    val checks: Map<String, kotlinx.serialization.json.JsonElement>? = null,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("completed_at") val completedAt: String? = null
)

@Serializable
data class DocumentUploadResponse(
    @SerialName("document_id") val documentId: String,
    @SerialName("document_type") val documentType: String,
    val width: Int,
    val height: Int,
    @SerialName("file_size") val fileSize: Int,
    @SerialName("mime_type") val mimeType: String
)

@Serializable
data class FaceRegion(
    val x: Int,
    val y: Int,
    val width: Int,
    val height: Int
)

@Serializable
data class FaceMatchResponse(
    val passed: Boolean,
    val confidence: Double,
    @SerialName("document_face") val documentFace: FaceRegion? = null,
    @SerialName("selfie_face") val selfieFace: FaceRegion? = null
)

@Serializable
data class LivenessCheck(
    val name: String,
    val passed: Boolean,
    val score: Double,
    val reason: String
)

@Serializable
data class LivenessResult(
    val passed: Boolean,
    val score: Double,
    val checks: List<LivenessCheck>
)
