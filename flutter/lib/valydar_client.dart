import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ValydarClient {
  final String apiKey;
  final String baseUrl;

  ValydarClient({required this.apiKey, this.baseUrl = 'https://api.dev.valydar.com'});

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    http.MultipartRequest? multipart,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = <String, String>{
      'Authorization': 'Bearer $apiKey',
    };

    http.Response response;

    if (multipart != null) {
      multipart.headers.addAll(headers);
      final streamed = await multipart.send();
      response = await http.Response.fromStream(streamed);
    } else if (body != null) {
      headers['Content-Type'] = 'application/json';
      response = await http.post(uri, headers: headers, body: jsonEncode(body));
    } else {
      response = await http.get(uri, headers: headers);
    }

    if (response.statusCode >= 400) {
      final err = jsonDecode(response.body);
      throw Exception(err['error']?['message'] ?? 'HTTP ${response.statusCode}');
    }

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> createVerification({
    String? clientReference,
    List<String>? checks,
  }) {
    return _request('POST', '/verifications', body: {
      'client_reference': clientReference ?? 'flutter_${DateTime.now().millisecondsSinceEpoch}',
      'checks': checks ?? ['document', 'face_match', 'liveness'],
    });
  }

  Future<Map<String, dynamic>> getVerification(String id) {
    return _request('GET', '/verifications/$id');
  }

  Future<Map<String, dynamic>> uploadDocument(
    String verificationId,
    File image,
    String? documentType,
  ) async {
    final uri = Uri.parse('$baseUrl/verifications/$verificationId/documents');
    final request = http.MultipartRequest('POST', uri);
    request.headers['Authorization'] = 'Bearer $apiKey';
    request.files.add(await http.MultipartFile.fromPath('file', image.path));
    if (documentType != null) {
      request.fields['document_type'] = documentType;
    }
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    if (response.statusCode >= 400) {
      final err = jsonDecode(response.body);
      throw Exception(err['error']?['message'] ?? 'HTTP ${response.statusCode}');
    }
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> uploadSelfie(
    String verificationId,
    File image,
  ) async {
    final uri = Uri.parse('$baseUrl/verifications/$verificationId/selfie');
    final request = http.MultipartRequest('POST', uri);
    request.headers['Authorization'] = 'Bearer $apiKey';
    request.files.add(await http.MultipartFile.fromPath('file', image.path));
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    if (response.statusCode >= 400) {
      final err = jsonDecode(response.body);
      throw Exception(err['error']?['message'] ?? 'HTTP ${response.statusCode}');
    }
    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> faceMatch(
    String verificationId,
    String documentId,
    String selfieId,
  ) {
    return _request('POST', '/verifications/$verificationId/face-match', body: {
      'document_id': documentId,
      'selfie_id': selfieId,
    });
  }

  Future<Map<String, dynamic>> documentLiveness(
    String verificationId,
    String documentId,
  ) {
    return _request(
      'POST',
      '/verifications/$verificationId/documents/$documentId/liveness',
    );
  }

  Future<Map<String, dynamic>> health() {
    return _request('GET', '/health');
  }
}
