import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rive/rive.dart' hide LinearGradient;
import '../services/api_service.dart';
import '../constants/app_colors.dart';

class AssignmentDetailScreen extends StatefulWidget {
  final int assignmentId;

  AssignmentDetailScreen({Key? key, required this.assignmentId})
      : super(key: key);

  @override
  _AssignmentDetailScreenState createState() => _AssignmentDetailScreenState();
}

class _AssignmentDetailScreenState extends State<AssignmentDetailScreen>
    with TickerProviderStateMixin {
  ApiService apiService = ApiService();
  Map<String, dynamic>? assignmentDetails;
  List<dynamic> feedbackList = [];
  bool isLoading = true;
  bool isUploading = false;
  double uploadProgress = 0;
  double uploadedSize = 0; // in MB
  double totalSize = 0; // in MB
  String? errorMessage;
  File? _videoFile;
  int? _uploadedVideoId;

  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
        vsync: this, duration: Duration(milliseconds: 1000));
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(parent: _fadeController, curve: Curves.easeIn));

    _slideController =
        AnimationController(vsync: this, duration: Duration(milliseconds: 800));
    _slideAnimation = Tween<Offset>(begin: Offset(0, 0.5), end: Offset.zero)
        .animate(CurvedAnimation(
            parent: _slideController, curve: Curves.easeOutQuad));

    fetchAssignmentDetails();
    fetchFeedback();
  }

  Future<void> fetchAssignmentDetails() async {
    try {
      final details =
          await apiService.getAssignmentDetails(widget.assignmentId);
      setState(() {
        assignmentDetails = details;
        isLoading = false;
      });
      _fadeController.forward();
      _slideController.forward();
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  Future<void> fetchFeedback() async {
    try {
      final feedback =
          await apiService.getFeedbackByAssignmentId(widget.assignmentId);
      setState(() {
        feedbackList = feedback;
      });
    } catch (e) {
      print('Error fetching feedback: $e');
      // You might want to show an error message to the user here
    }
  }

  Future<void> uploadVideo() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickVideo(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        isUploading = true;
        uploadProgress = 0;
        uploadedSize = 0;
        _videoFile = File(pickedFile.path);
        totalSize = _videoFile!.lengthSync() / (1024 * 1024); // Convert to MB
      });

      try {
        int videoId = await apiService.uploadVideo(
          _videoFile!,
          'Assignment Video',
          onProgress: (progress) {
            setState(() {
              uploadProgress = progress;
              uploadedSize = totalSize * progress;
            });
          },
        );

        setState(() {
          isUploading = false;
          uploadProgress = 0;
          uploadedSize = 0;
          _uploadedVideoId = videoId;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Video uploaded successfully! Video ID: $videoId'),
              backgroundColor: Colors.green),
        );
      } catch (e) {
        setState(() {
          isUploading = false;
          uploadProgress = 0;
          uploadedSize = 0;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to upload video: $e'),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  void removeVideo() {
    setState(() {
      _videoFile = null;
      _uploadedVideoId = null;
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: RiveAnimation.asset(
              'assets/animations/background_animation.riv',
              fit: BoxFit.cover,
            ),
          ),
          SafeArea(
            child: isLoading
                ? Center(
                    child: CircularProgressIndicator(
                        color: AppColors.primaryColor))
                : errorMessage != null
                    ? Center(
                        child: Text(errorMessage!,
                            style: GoogleFonts.poppins(
                                color: AppColors.errorColor, fontSize: 18)))
                    : FadeTransition(
                        opacity: _fadeAnimation,
                        child: SlideTransition(
                          position: _slideAnimation,
                          child: _buildContent(),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 200.0,
          floating: false,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            title: Text(assignmentDetails!['Title'],
                style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
            background: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primaryColor, AppColors.secondaryColor],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInstructionsCard(),
                SizedBox(height: 20),
                _buildFeedbackSection(),
                SizedBox(height: 20),
                _buildVideoUploadSection(),
                SizedBox(height: 20),
                _buildSubmitButton(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInstructionsCard() {
    return Card(
      elevation: 5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Instructions',
              style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryColor),
            ),
            SizedBox(height: 10),
            Text(
              assignmentDetails!['Instructions'],
              style: GoogleFonts.poppins(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedbackSection() {
    return Card(
      elevation: 5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Feedback',
              style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryColor),
            ),
            SizedBox(height: 10),
            feedbackList.isEmpty
                ? Text(
                    'No feedback available for this assignment.',
                    style:
                        GoogleFonts.poppins(fontSize: 16, color: Colors.grey),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: feedbackList.length,
                    itemBuilder: (context, index) {
                      final feedback = feedbackList[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 10),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                        child: ListTile(
                          title: Text(
                            feedback['feedbackText'],
                            style: GoogleFonts.poppins(fontSize: 16),
                          ),
                          subtitle: Text(
                            'Mark: ${feedback['mark']}',
                            style: GoogleFonts.poppins(fontSize: 14),
                          ),
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoUploadSection() {
    return Card(
      elevation: 5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Video Submission',
              style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryColor),
            ),
            SizedBox(height: 10),
            if (isUploading) ...[
              LinearProgressIndicator(
                value: uploadProgress,
                backgroundColor: Colors.grey[300],
                valueColor:
                    AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
              ),
              SizedBox(height: 10),
              Text(
                '${uploadedSize.toStringAsFixed(2)} MB / ${totalSize.toStringAsFixed(2)} MB (${(uploadProgress * 100).toInt()}%)',
                style: GoogleFonts.poppins(),
              ),
            ],
            if (_videoFile != null) ...[
              Text('Video uploaded: ${_videoFile!.path.split('/').last}',
                  style: GoogleFonts.poppins()),
              SizedBox(height: 10),
              ElevatedButton.icon(
                onPressed: removeVideo,
                icon: Icon(Icons.delete),
                label: Text('Remove Video'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ] else ...[
              ElevatedButton.icon(
                onPressed: isUploading ? null : uploadVideo,
                icon: Icon(Icons.upload_file),
                label: Text('Upload Video'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _uploadedVideoId != null ? _submitAssignment : null,
        child:
            Text('Submit Assignment', style: GoogleFonts.poppins(fontSize: 18)),
        style: ElevatedButton.styleFrom(
          backgroundColor:
              _uploadedVideoId != null ? AppColors.primaryColor : Colors.grey,
          padding: EdgeInsets.symmetric(vertical: 15),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
    );
  }

  Future<void> _submitAssignment() async {
    try {
      await apiService.submitAssignment(
        "8", // Fixed student ID as per requirement, converted to String
        widget.assignmentId,
        "Submission for assignment ${widget.assignmentId}", // Added a default submission text
        _uploadedVideoId!,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Assignment submitted successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      // Refresh feedback after submission
      fetchFeedback();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error submitting assignment: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
