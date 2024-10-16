import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/modules_screen.dart';
import 'screens/not_found_screen.dart';
import 'screens/assignments_screen.dart';
import 'services/api_service.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:io';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  final ApiService apiService = ApiService();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.detached ||
        state == AppLifecycleState.paused) {
      apiService.logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HMS App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: LoginScreen(),
      routes: {
        '/modules': (context) => ModulesScreen(),
        '/login': (context) => LoginScreen(),
        '/assignments': (context) {
          final args = ModalRoute.of(context)!.settings.arguments
              as Map<String, dynamic>;
          return AssignmentsScreen(moduleId: args['moduleId']);
        },
      },
      onUnknownRoute: (settings) {
        return MaterialPageRoute(builder: (context) => NotFoundScreen());
      },
    );
  }
}

class AssignmentsScreen extends StatefulWidget {
  final int moduleId;

  const AssignmentsScreen({Key? key, required this.moduleId}) : super(key: key);

  @override
  _AssignmentsScreenState createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends State<AssignmentsScreen> {
  File? _videoFile;
  bool _isUploading = false;

  Future<void> _pickVideo() async {
    final ImagePicker _picker = ImagePicker();
    final XFile? video = await _picker.pickVideo(source: ImageSource.gallery);

    if (video != null) {
      setState(() {
        _videoFile = File(video.path);
      });
    }
  }

  Future<void> _submitVideo() async {
    if (_videoFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please upload a video first.')),
      );
      return;
    }

    setState(() {
      _isUploading = true;
    });

    final uri = Uri.parse(
        'https://your-api-url.com/upload'); // Update with your API endpoint
    final request = http.MultipartRequest('POST', uri);
    request.files
        .add(await http.MultipartFile.fromPath('video', _videoFile!.path));

    try {
      final response = await request.send();
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Video uploaded successfully!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to upload video. Please try again.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error occurred: $e')),
      );
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Assignments')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            if (_videoFile != null) ...[
              Text('Video selected: ${_videoFile!.path.split('/').last}'),
              SizedBox(height: 10),
            ],
            ElevatedButton(
              onPressed: _isUploading ? null : _pickVideo,
              child: Text('Upload Video'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isUploading ? null : _submitVideo,
              child: Text(_isUploading ? 'Uploading...' : 'Submit Video'),
            ),
            if (_isUploading) CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
