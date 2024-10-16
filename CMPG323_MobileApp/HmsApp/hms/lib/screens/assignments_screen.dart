import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rive/rive.dart' hide LinearGradient;
import '../services/api_service.dart';
import '../constants/app_colors.dart';
import 'assignmentdetailscreen.dart';

class AssignmentsScreen extends StatefulWidget {
  final int moduleId;

  AssignmentsScreen({Key? key, required this.moduleId}) : super(key: key);

  @override
  _AssignmentsScreenState createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends State<AssignmentsScreen>
    with TickerProviderStateMixin {
  List assignments = [];
  bool isLoading = true;
  String? errorMessage;
  final ApiService apiService = ApiService();

  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    fetchAssignments();

    _fadeController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 1000),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _fadeController,
        curve: Curves.easeIn,
      ),
    );

    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> fetchAssignments() async {
    try {
      final response = await apiService.getAssignments(widget.moduleId);
      setState(() {
        assignments = response;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = 'Failed to load assignments: $e';
        isLoading = false;
      });
      print('Error fetching assignments: $e');
    }
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildAppBar(),
                Expanded(
                  child: _buildAssignmentGrid(),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  Widget _buildAppBar() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.primaryColor.withOpacity(0.8),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(20),
          bottomRight: Radius.circular(20),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            icon: Icon(Icons.arrow_back, color: AppColors.textColor),
            onPressed: () => Navigator.of(context).pop(),
          ),
          Text(
            'Assignments',
            style: GoogleFonts.poppins(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppColors.textColor,
            ),
          ),
          Spacer(),
          IconButton(
            icon: Icon(Icons.search, color: AppColors.textColor),
            onPressed: () {
              // Implement search functionality
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAssignmentGrid() {
    if (isLoading) {
      return Center(
        child: CircularProgressIndicator(color: AppColors.primaryColor),
      );
    } else if (errorMessage != null) {
      return Center(
        child: Text(errorMessage!,
            style: GoogleFonts.roboto(color: AppColors.errorColor)),
      );
    } else if (assignments.isEmpty) {
      return Center(
        child: Text('No assignments available.',
            style: GoogleFonts.roboto(color: AppColors.textColor)),
      );
    } else {
      return FadeTransition(
        opacity: _fadeAnimation,
        child: GridView.builder(
          padding: EdgeInsets.all(16),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 0.75,
          ),
          itemCount: assignments.length,
          itemBuilder: (context, index) {
            final assignment = assignments[index];
            return _buildAssignmentCard(assignment);
          },
        ),
      );
    }
  }

  Widget _buildAssignmentCard(dynamic assignment) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AssignmentDetailScreen(
              assignmentId: assignment['AssignmentID'],
            ),
          ),
        );
      },
      child: Card(
        elevation: 5,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.primaryColor,
                AppColors.primaryColor.withOpacity(0.7)
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  assignment['Title'],
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textColor,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 8),
                Text(
                  assignment['Description'] ?? 'No description available',
                  style: GoogleFonts.roboto(
                    color: AppColors.textColor.withOpacity(0.8),
                    fontSize: 14,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                Spacer(),
                _buildInfoChip(Icons.calendar_today,
                    'Due: ${_formatDate(assignment['DueDate'])}'),
                SizedBox(height: 8),
                _buildStatusChip(assignment['Status'] ?? 'Pending'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.secondaryColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.iconColor, size: 12),
          SizedBox(width: 4),
          Flexible(
            child: Text(
              label,
              style: GoogleFonts.roboto(
                color: AppColors.textColor,
                fontSize: 10,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color statusColor;
    IconData statusIcon;
    switch (status.toLowerCase()) {
      case 'submitted':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case 'late':
        statusColor = Colors.orange;
        statusIcon = Icons.warning;
        break;
      case 'pending':
      default:
        statusColor = Colors.blue;
        statusIcon = Icons.schedule;
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(statusIcon, color: statusColor, size: 12),
          SizedBox(width: 4),
          Text(
            status,
            style: GoogleFonts.roboto(
              color: statusColor,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingActionButton() {
    return FloatingActionButton(
      onPressed: () {
        // Implement refresh functionality
        fetchAssignments();
      },
      child: Icon(Icons.refresh),
      backgroundColor: AppColors.primaryColor,
    );
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    return '${date.day}/${date.month}/${date.year}';
  }
}
