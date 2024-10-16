import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rive/rive.dart' hide LinearGradient;
import '../services/api_service.dart';
import '../constants/app_colors.dart';
import '../screens/assignments_screen.dart';

class ModulesScreen extends StatefulWidget {
  ModulesScreen({Key? key}) : super(key: key);

  @override
  _ModulesScreenState createState() => _ModulesScreenState();
}

class _ModulesScreenState extends State<ModulesScreen>
    with TickerProviderStateMixin {
  final ApiService apiService = ApiService();
  List<dynamic> modules = [];
  List<dynamic> filteredModules = [];
  bool isLoading = true;
  String? errorMessage;

  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    fetchModules();

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

    _searchController.addListener(_filterModules);
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> fetchModules() async {
    try {
      final response = await apiService.getModules();
      setState(() {
        modules = response;
        filteredModules = response;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Error fetching modules: $e';
      });
      print('Error fetching modules: $e');
    }
  }

  void _filterModules() {
    setState(() {
      filteredModules = modules
          .where((module) =>
              module['ModuleCode']
                  .toLowerCase()
                  .contains(_searchController.text.toLowerCase()) ||
              module['ModuleName']
                  .toLowerCase()
                  .contains(_searchController.text.toLowerCase()))
          .toList();
    });
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
                _buildSearchBar(),
                Expanded(
                  child: _buildModuleList(),
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
          Expanded(
            child: Text(
              'Your Modules',
              style: GoogleFonts.poppins(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: AppColors.textColor,
              ),
            ),
          ),
          IconButton(
            icon: Icon(Icons.sort, color: AppColors.textColor),
            onPressed: () {
              _showSortOptions();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search modules...',
          prefixIcon: Icon(Icons.search, color: AppColors.iconColor),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: AppColors.secondaryColor.withOpacity(0.1),
        ),
        style: GoogleFonts.roboto(color: AppColors.textColor),
      ),
    );
  }

  Widget _buildModuleList() {
    if (isLoading) {
      return Center(
        child: CircularProgressIndicator(color: AppColors.primaryColor),
      );
    } else if (errorMessage != null) {
      return Center(
        child: Text(errorMessage!,
            style: GoogleFonts.roboto(color: AppColors.errorColor)),
      );
    } else if (filteredModules.isEmpty) {
      return Center(
        child: Text('No modules available.',
            style: GoogleFonts.roboto(color: AppColors.textColor)),
      );
    } else {
      return FadeTransition(
        opacity: _fadeAnimation,
        child: ListView.builder(
          controller: _scrollController,
          itemCount: filteredModules.length,
          itemBuilder: (context, index) {
            final module = filteredModules[index];
            return _buildAnimatedCard(module, index);
          },
        ),
      );
    }
  }

  Widget _buildAnimatedCard(dynamic module, int index) {
    return TweenAnimationBuilder(
      tween: Tween<double>(begin: 1, end: 0),
      duration: Duration(milliseconds: 500),
      curve: Curves.easeOutQuint,
      builder: (context, double value, child) {
        return Transform.translate(
          offset: Offset(0, 50 * value),
          child: Opacity(
            opacity: 1 - value,
            child: child,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    AssignmentsScreen(moduleId: module['ModuleID']),
              ),
            );
          },
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
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: Offset(0, 5),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    module['ModuleCode'] ?? 'No code available',
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textColor,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    module['ModuleName'] ?? 'Unknown Module',
                    style: GoogleFonts.roboto(
                      fontSize: 16,
                      color: AppColors.textColor.withOpacity(0.8),
                    ),
                  ),
                  SizedBox(height: 16),
                  Wrap(
                    // Replace Row with Wrap
                    spacing: 8, // Add horizontal spacing between chips
                    runSpacing: 8, // Add vertical spacing between rows
                    children: [
                      _buildInfoChip(Icons.assignment,
                          '${module['AssignmentCount'] ?? 0} Assignments'),
                      _buildInfoChip(Icons.video_library,
                          '${module['VideoCount'] ?? 0} Videos'),
                      _buildInfoChip(Icons.feedback,
                          '${module['FeedbackCount'] ?? 0} Feedback'),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.secondaryColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.iconColor, size: 16),
          SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.roboto(
              color: AppColors.textColor,
              fontSize: 12,
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
        fetchModules();
      },
      child: Icon(Icons.refresh),
      backgroundColor: AppColors.primaryColor,
    );
  }

  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Container(
          child: Wrap(
            children: <Widget>[
              ListTile(
                leading: Icon(Icons.sort_by_alpha),
                title: Text('Sort by Module Code'),
                onTap: () {
                  _sortModules('ModuleCode');
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: Icon(Icons.sort),
                title: Text('Sort by Module Name'),
                onTap: () {
                  _sortModules('ModuleName');
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _sortModules(String criteria) {
    setState(() {
      filteredModules.sort((a, b) => a[criteria].compareTo(b[criteria]));
    });
  }
}
