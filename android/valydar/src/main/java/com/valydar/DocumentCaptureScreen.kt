package com.valydar

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.unit.dp
import java.io.File

@Composable
fun DocumentCaptureScreen(
    verificationId: String,
    apiKey: String,
    documentType: String? = null,
    onComplete: (DocumentUploadResponse) -> Unit,
    onError: (Exception) -> Unit
) {
    val client = remember { ValydarClient(apiKey) }
    var captured by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    Box(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Canvas(
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .aspectRatio(1.4f)
            ) {
                drawRoundRect(
                    color = Color.Blue,
                    size = size,
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(12f),
                    style = androidx.compose.ui.graphics.Stroke(width = 3f)
                )
                drawRoundRect(
                    color = Color.Blue.copy(alpha = 0.5f),
                    topLeft = Offset(size.width * 0.05f, size.height * 0.15f),
                    size = Size(size.width * 0.9f, size.height * 0.7f),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(8f),
                    style = androidx.compose.ui.graphics.Stroke(
                        width = 2f,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f))
                    )
                )
            }
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Position your ${documentType ?: "document"} in the frame",
                color = Color.White
            )
            Spacer(modifier = Modifier.height(32.dp))
            Button(onClick = {
                captured = true
                try {
                    val tempFile = File.createTempFile("capture", ".jpg")
                    val response = client.uploadDocument(
                        verificationId = verificationId,
                        imageFile = tempFile,
                        documentType = documentType
                    )
                    onComplete(response)
                } catch (e: Exception) {
                    errorMsg = e.message
                    onError(e)
                }
            }) {
                Text("Capture")
            }
            errorMsg?.let {
                Text(it, color = Color.Red, modifier = Modifier.padding(top = 8.dp))
            }
        }
    }
}
