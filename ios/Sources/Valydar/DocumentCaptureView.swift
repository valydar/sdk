import SwiftUI

public struct DocumentCaptureView: View {
    let verificationId: String
    let apiKey: String
    let documentType: String?
    let onComplete: (DocumentUploadResponse) -> Void
    let onError: (Error) -> Void

    @State private var phase: CapturePhase = .framing
    @State private var errorMessage: String?

    public init(
        verificationId: String,
        apiKey: String,
        documentType: String? = nil,
        onComplete: @escaping (DocumentUploadResponse) -> Void,
        onError: @escaping (Error) -> Void
    ) {
        self.verificationId = verificationId
        self.apiKey = apiKey
        self.documentType = documentType
        self.onComplete = onComplete
        self.onError = onError
    }

    public var body: some View {
        VStack {
            Spacer()
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.blue, lineWidth: 2)
                    .frame(width: UIScreen.main.bounds.width * 0.85,
                           height: UIScreen.main.bounds.width * 1.2)
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.blue.opacity(0.5), style: StrokeStyle(lineWidth: 1, dash: [8]))
                    .frame(width: UIScreen.main.bounds.width * 0.75,
                           height: UIScreen.main.bounds.width * 0.9)
                Text("Align document within frame")
                    .foregroundColor(.white.opacity(0.7))
                    .font(.subheadline)
            }
            Text("Position your \(documentType ?? "document") in the frame")
                .foregroundColor(.white)
                .padding(.top, 24)
            Spacer()
            Button(action: capture) {
                Circle()
                    .stroke(Color.white, lineWidth: 4)
                    .frame(width: 72, height: 72)
                    .overlay(Circle().fill(Color.white).frame(width: 60, height: 60))
            }
            .padding(.bottom, 48)
        }
        .background(Color.black.edgesIgnoringSafeArea(.all))
    }

    private func capture() {
        // In production, capture from camera via AVFoundation
        phase = .capturing
        let client = ValydarClient(apiKey: apiKey)
        Task {
            do {
                let response = try await client.uploadDocument(
                    verificationId: verificationId,
                    imageData: Data(),
                    filename: "document.jpg",
                    documentType: documentType
                )
                await MainActor.run { onComplete(response) }
            } catch {
                await MainActor.run { onError(error) }
            }
        }
    }
}

enum CapturePhase {
    case framing, capturing, uploading, complete, error
}
