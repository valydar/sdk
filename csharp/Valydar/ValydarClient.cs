using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Valydar;

public class ValydarClient : IDisposable
{
    private readonly HttpClient _http;
    private readonly string _baseUrl;

    public ValydarClient(string apiKey, string? baseUrl = null)
    {
        _baseUrl = baseUrl ?? "https://api.dev.valydar.com";
        _http = new HttpClient();
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);
        _http.Timeout = TimeSpan.FromSeconds(30);
    }

    private async Task<T> GetAsync<T>(string path)
    {
        var resp = await _http.GetAsync($"{_baseUrl}{path}");
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json)!;
    }

    private async Task<T> PostAsync<T>(string path, object? body = null)
    {
        var content = body is not null
            ? new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            : null;
        var resp = await _http.PostAsync($"{_baseUrl}{path}", content);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json)!;
    }

    public async Task<HealthResponse> HealthAsync()
        => await GetAsync<HealthResponse>("/health");

    public async Task<VerificationResponse> CreateVerificationAsync(
        string? clientReference = null,
        List<string>? checks = null)
    {
        return await PostAsync<VerificationResponse>("/verifications", new
        {
            client_reference = clientReference ?? $"dotnet_{DateTime.UtcNow.Ticks}",
            checks = checks ?? new List<string> { "document", "face_match", "liveness" }
        });
    }

    public async Task<VerificationResponse> GetVerificationAsync(string id)
        => await GetAsync<VerificationResponse>($"/verifications/{id}");

    public async Task<DocumentUploadResponse> UploadDocumentAsync(
        string verificationId,
        string imagePath,
        string? documentType = null)
    {
        using var form = new MultipartFormDataContent();
        var imageBytes = await File.ReadAllBytesAsync(imagePath);
        form.Add(new ByteArrayContent(imageBytes), "file", Path.GetFileName(imagePath));
        if (documentType is not null)
            form.Add(new StringContent(documentType), "document_type");

        var resp = await _http.PostAsync($"{_baseUrl}/verifications/{verificationId}/documents", form);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<DocumentUploadResponse>(json)!;
    }

    public async Task<FaceMatchResponse> FaceMatchAsync(
        string verificationId,
        string documentId,
        string selfieId)
    {
        return await PostAsync<FaceMatchResponse>(
            $"/verifications/{verificationId}/face-match",
            new { document_id = documentId, selfie_id = selfieId });
    }

    public async Task<SelfieLivenessResponse> SelfieLivenessAsync(string verificationId)
        => await PostAsync<SelfieLivenessResponse>(
            $"/verifications/{verificationId}/selfie-liveness");

    public async Task<DeepfakeResult> DeepfakeAsync(string verificationId)
        => await PostAsync<DeepfakeResult>(
            $"/verifications/{verificationId}/deepfake");

    public async Task<NfcResult> VerifyNfcAsync(
        string verificationId,
        Dictionary<string, object>? expectedDg1 = null)
    {
        var body = expectedDg1 is not null
            ? new { expected_dg1 = expectedDg1 }
            : null;
        return await PostAsync<NfcResult>(
            $"/verifications/{verificationId}/nfc", body);
    }

    public async Task<ActiveLivenessChallenge> ActiveLivenessChallengeAsync(
        string verificationId,
        string challengeType = "blink")
    {
        return await PostAsync<ActiveLivenessChallenge>(
            $"/verifications/{verificationId}/active-liveness/challenge",
            new { challenge_type = challengeType });
    }

    public async Task<ActiveLivenessResult> ActiveLivenessVerifyAsync(
        string verificationId,
        string challengeId,
        List<string> frames)
    {
        return await PostAsync<ActiveLivenessResult>(
            $"/verifications/{verificationId}/active-liveness/verify",
            new { challenge_id = challengeId, frames });
    }

    public async Task<ListVerificationsResponse> ListVerificationsAsync()
        => await GetAsync<ListVerificationsResponse>("/verifications");

    public async Task<LivenessResult> DocumentLivenessAsync(
        string verificationId,
        string documentId)
    {
        return await PostAsync<LivenessResult>(
            $"/verifications/{verificationId}/documents/{documentId}/liveness");
    }

    public async Task<Dictionary<string, object>> UploadSelfieAsync(
        string verificationId,
        string imagePath)
    {
        using var form = new MultipartFormDataContent();
        var imageBytes = await File.ReadAllBytesAsync(imagePath);
        form.Add(new ByteArrayContent(imageBytes), "file", Path.GetFileName(imagePath));

        var resp = await _http.PostAsync(
            $"{_baseUrl}/verifications/{verificationId}/selfie", form);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<Dictionary<string, object>>(json)!;
    }

    public async Task<Dictionary<string, object>> DemoVerifyAsync(
        string documentPath,
        string? selfiePath = null,
        List<string>? checks = null)
    {
        using var form = new MultipartFormDataContent();
        var docBytes = await File.ReadAllBytesAsync(documentPath);
        form.Add(new ByteArrayContent(docBytes), "document", Path.GetFileName(documentPath));
        if (selfiePath is not null)
        {
            var selfieBytes = await File.ReadAllBytesAsync(selfiePath);
            form.Add(new ByteArrayContent(selfieBytes), "selfie", Path.GetFileName(selfiePath));
        }
        if (checks is not null)
            form.Add(new StringContent(JsonSerializer.Serialize(checks)), "checks");

        var resp = await _http.PostAsync($"{_baseUrl}/demo/verify", form);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<Dictionary<string, object>>(json)!;
    }

    public void Dispose() => _http.Dispose();
}
