package com.valydar

import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.util.concurrent.TimeUnit

class ValydarClient(
    private val apiKey: String,
    private val baseUrl: String = "https://api.dev.valydar.com"
) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private val json = Json { ignoreUnknownKeys = true }

    private fun request(path: String): Request.Builder {
        return Request.Builder()
            .url("$baseUrl$path")
            .addHeader("Authorization", "Bearer $apiKey")
    }

    private inline fun <reified T> get(path: String): T {
        val resp = client.newCall(request(path).get().build()).execute()
        val body = resp.body?.string() ?: throw RuntimeException("Empty response")
        return json.decodeFromString(body)
    }

    private inline fun <reified T> post(path: String, body: Any? = null): T {
        val mediaType = "application/json".toMediaType()
        val jsonBody = body?.let { json.encodeToString(it) }
        val req = request(path)
            .post(jsonBody?.toRequestBody(mediaType) ?: "".toRequestBody())
            .build()
        val resp = client.newCall(req).execute()
        val result = resp.body?.string() ?: throw RuntimeException("Empty response")
        return json.decodeFromString(result)
    }

    fun health(): HealthResponse = get("/health")

    fun createVerification(
        clientReference: String = "android_${System.currentTimeMillis()}",
        checks: List<String> = listOf("document", "face_match", "liveness")
    ): VerificationResponse {
        return post("/verifications", mapOf(
            "client_reference" to clientReference,
            "checks" to checks
        ))
    }

    fun getVerification(id: String): VerificationResponse = get("/verifications/$id")

    fun uploadDocument(
        verificationId: String,
        imageFile: File,
        documentType: String? = null
    ): DocumentUploadResponse {
        val body = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("file", imageFile.name,
                imageFile.readBytes().toRequestBody("image/jpeg".toMediaType()))
            .apply { documentType?.let { addFormDataPart("document_type", it) } }
            .build()

        val req = request("/verifications/$verificationId/documents")
            .post(body)
            .build()

        val resp = client.newCall(req).execute()
        val result = resp.body?.string() ?: throw RuntimeException("Empty response")
        return json.decodeFromString(result)
    }

    fun faceMatch(
        verificationId: String,
        documentId: String,
        selfieId: String
    ): FaceMatchResponse {
        return post("/verifications/$verificationId/face-match", mapOf(
            "document_id" to documentId,
            "selfie_id" to selfieId
        ))
    }
}
