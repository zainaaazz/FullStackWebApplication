import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';

class AuthService {
  static const String baseUrl = 'https://hmsnwu.azurewebsites.net';
  final FlutterSecureStorage secureStorage = FlutterSecureStorage();
  final logger = Logger(); // Initialize the logger

  // Method to log in and store the token
  Future<bool> login(String username, String password) async {
    final String loginUrl = '$baseUrl/auth/login';

    // Add logging for request URL and payload
    logger.i('POST Request URL: $loginUrl');
    logger.i(
        'Request Payload: { "username": "$username", "password": "$password" }');

    final response = await http.post(
      Uri.parse(loginUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(
          {'username': username, 'password': password}), // Ensure correct keys
    );

    if (response.statusCode == 200) {
      // Login successful, extract and store the token
      final Map<String, dynamic> responseBody = json.decode(response.body);
      logger
          .i('Response Body: $responseBody'); // Log full response for debugging
      String accessToken = responseBody['accessToken'];
      await secureStorage.write(key: 'accessToken', value: accessToken);
      logger.i('Access token stored successfully.');

      // Verify token storage
      String? token = await getToken();
      logger.i('Retrieved Token: $token');

      return true;
    } else {
      // Handle error
      logger.e('Login failed: ${response.statusCode} - ${response.body}');
      return false;
    }
  }

  // Method to register a user
  Future<bool> register(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 201) {
      return true;
    } else {
      return false;
    }
  }

  // Method to retrieve the stored token
  Future<String?> getToken() async {
    return await secureStorage.read(key: 'accessToken');
  }

  // Method to check if the user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null; // Returns true if the token exists
  }

  // Example method to fetch protected resource
  Future<dynamic> fetchProtectedResource() async {
    final token = await getToken();
    if (token == null) {
      logger.e('User is not authenticated.');
      return null; // User is not authenticated
    }

    final response = await http.get(
      Uri.parse('$baseUrl/protected/resource'), // Replace with your endpoint
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      logger.e('Failed to fetch protected resource: ${response.body}');
      return null;
    }
  }
}
