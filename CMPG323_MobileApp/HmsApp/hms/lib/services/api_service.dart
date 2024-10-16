import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';
import 'package:path/path.dart';
import 'package:async/async.dart';

class ApiService {
  final String baseUrl = 'https://hmsnwu.azurewebsites.net';
  final FlutterSecureStorage secureStorage = FlutterSecureStorage();
  String? _token; // Store the access token in memory for quicker access
  final Logger logger = Logger(); // Initialize logger

  // Method to log in the user and return an access token
  Future<String> login(int userNumber, String password) async {
    String trimmedUsername = userNumber.toString().trim();
    String trimmedPassword = password.trim();

    logger.i('Attempting to log in with UserNumber: $trimmedUsername');

    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'UserNumber': trimmedUsername,
        'Password': trimmedPassword,
      }),
    );

    final responseBody = _handleResponse(response, 'Login');

    if (responseBody is Map<String, dynamic> &&
        responseBody['accessToken'] != null) {
      // Store the token securely
      await secureStorage.write(
          key: 'accessToken', value: responseBody['accessToken']);
      _token = responseBody['accessToken']; // Store token in memory
      return _token!;
    } else {
      throw Exception('Access token not found in the response.');
    }
  }

  // Method to retrieve the token from secure storage
  Future<void> retrieveToken() async {
    _token = await secureStorage.read(key: 'accessToken');
  }

  // Method to log out the user
  Future<void> logout() async {
    await secureStorage.delete(key: 'accessToken'); // Remove the token
    _token = null; // Clear token from memory
    logger.i('User logged out successfully.');
  }

  // Method to fetch all modules
  Future<List<dynamic>> getModules() async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/modules'),
      headers: _buildAuthHeaders(),
    );

    return _handleResponse(response, 'Modules');
  }

  // Method to fetch all assignments
  Future<List<dynamic>> getAllAssignments() async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/assignments'),
      headers: _buildAuthHeaders(),
    );

    return _handleResponse(response, 'Assignments');
  }

  // Method to fetch assignments for a specific module
  Future<List<dynamic>> getAssignments(int moduleId) async {
    final allAssignments = await getAllAssignments();
    final moduleAssignments = allAssignments
        .where((assignment) => assignment['ModuleID'] == moduleId)
        .toList();

    if (moduleAssignments.isEmpty) {
      logger.e('Assignments not found for module ID $moduleId.');
      throw Exception('Assignments not found for module ID $moduleId.');
    }

    return moduleAssignments;
  }

  // Method to fetch feedbacks
  Future<List<dynamic>> getFeedbacks() async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/feedbacks'),
      headers: _buildAuthHeaders(),
    );

    return _handleResponse(response, 'Feedbacks');
  }

  // Method to fetch feedbacks for a specific assignment
  Future<List<dynamic>> getFeedbacksForAssignment(int assignmentId) async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/feedbacks?assignmentId=$assignmentId'),
      headers: _buildAuthHeaders(),
    );

    return _handleResponse(response, 'Feedbacks for Assignment');
  }

  // Method to fetch feedbacks for a specific submission
  Future<List<dynamic>> getFeedbacksForSubmission(int submissionId) async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/feedbacks?submissionId=$submissionId'),
      headers: _buildAuthHeaders(),
    );

    return _handleResponse(response, 'Feedbacks for Submission');
  }

  // Method to fetch submissions for a specific assignment
  Future<List<dynamic>> getSubmissionsByAssignmentId(int assignmentId) async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/submissions?assignmentId=$assignmentId'),
      headers: _buildAuthHeaders(),
    );

    return _handleResponse(response, 'Submissions for Assignment');
  }

  // Method to fetch feedbacks for a specific module
  Future<List<dynamic>> getFeedbacksByModuleId(int moduleId) async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/feedbacks'),
      headers: _buildAuthHeaders(),
    );

    final allFeedbacks = _handleResponse(response, 'Feedbacks');

    // Filter feedbacks by moduleId
    final moduleFeedbacks = allFeedbacks
        .where((feedback) => feedback['moduleId'] == moduleId)
        .toList();

    if (moduleFeedbacks.isEmpty) {
      logger.e('No feedback found for module ID $moduleId.');
      throw Exception('No feedback found for module ID $moduleId.');
    }

    return moduleFeedbacks;
  }

  // Method to fetch assignment details by ID
  Future<Map<String, dynamic>> getAssignmentDetails(int assignmentId) async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/assignments/$assignmentId'),
      headers: _buildAuthHeaders(),
    );

    return _handleResponse(response, 'Assignment Details');
  }

  // Method to upload a video and return the videoId with progress callback
  Future<int> uploadVideo(File videoFile, String title,
      {Function(double)? onProgress}) async {
    await _ensureTokenIsRetrieved();

    var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/videos'));
    request.headers.addAll(_buildAuthHeaders());

    // Add video file
    var videoStream =
        http.ByteStream(DelegatingStream.typed(videoFile.openRead()));
    var videoLength = await videoFile.length();
    var videoMultipartFile = http.MultipartFile(
      'file',
      videoStream,
      videoLength,
      filename: basename(videoFile.path),
    );
    request.files.add(videoMultipartFile);

    // Add video title
    request.fields['videoTitle'] = title;

    try {
      final stopwatch = Stopwatch()..start(); // Start the timer
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      stopwatch.stop(); // Stop the timer

      // Log the time taken for upload
      logger.i('Video upload took: ${stopwatch.elapsed.inSeconds} seconds');

      // Log the request and response
      _logRequestResponse(response, 'Video Upload');

      if (response.statusCode == 201) {
        final responseBody = json.decode(response.body);
        logger.i('Video uploaded successfully: ${responseBody['message']}');

        // Ensure videoId is present and valid in the response
        if (responseBody['videoId'] != null) {
          return responseBody[
              'videoId']; // Ensure this key matches your API response
        } else {
          logger.e('Video ID not found in response: $responseBody');
          throw Exception('Video ID not found in the response.');
        }
      } else {
        logger.e(
            'Failed to upload video: ${response.statusCode} ${response.reasonPhrase}');
        logger.e('Response body: ${response.body}');
        throw Exception(
            'Failed to upload video. Status: ${response.statusCode}, Body: ${response.body}');
      }
    } catch (e) {
      logger.e('Exception during video upload: $e');
      throw Exception('Failed to upload video: $e');
    }
  }

  // Method to submit assignment after video upload
  Future<void> submitAssignment(String username, int assignmentId,
      String submissionText, int videoId) async {
    await _ensureTokenIsRetrieved();

    final submissionData = {
      "studentId": username, // Use username as the student ID
      "assignmentId": assignmentId,
      "submissionText": submissionText,
      "videoId": videoId,
      "status": "Submitted"
    };

    final response = await http.post(
      Uri.parse('$baseUrl/submissions'),
      headers: _buildAuthHeaders(),
      body: jsonEncode(submissionData),
    );

    _logRequestResponse(response, 'Assignment Submission');

    if (response.statusCode != 201) {
      logger.e(
          'Failed to submit assignment: ${response.statusCode} ${response.reasonPhrase}');
      throw Exception('Failed to submit assignment');
    }

    logger.i('Assignment submitted successfully');
  }

  // Method to retrieve all videos
  Future<List<dynamic>> getAllVideos() async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/videos'),
      headers: _buildAuthHeaders(),
    );

    return _handleResponse(response, 'Videos');
  }

  // Helper method to ensure token is retrieved
  Future<void> _ensureTokenIsRetrieved() async {
    if (_token == null) {
      await retrieveToken();
    }
  }

  // Helper method to build authorization headers
  Map<String, String> _buildAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $_token',
    };
  }

  // Helper method to handle API responses
  dynamic _handleResponse(http.Response response, String action) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      logger
          .e('$action failed: ${response.statusCode} ${response.reasonPhrase}');
      throw Exception('$action failed: ${response.body}');
    }
  }

  // Helper method to log request and response details
  void _logRequestResponse(http.Response response, String action) {
    logger.i('$action: ${response.statusCode} ${response.reasonPhrase}');
    logger.i('Response body: ${response.body}');
  }

  Future<List<dynamic>> getFeedbackByAssignmentId(int assignmentId) async {
    await _ensureTokenIsRetrieved();
    final response = await http.get(
      Uri.parse('$baseUrl/feedbacks'),
      headers: _buildAuthHeaders(),
    );

    final allFeedback = _handleResponse(response, 'Feedbacks');

    // Filter feedback for the specific assignment
    return allFeedback
        .where((feedback) => feedback['submissionId'] == assignmentId)
        .toList();
  }
}
