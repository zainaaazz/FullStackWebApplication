import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hms/main.dart'; // Adjust this import to your main.dart file

void main() {
  testWidgets('HMS App has a login button', (WidgetTester tester) async {
    await tester.pumpWidget(MyApp()); // Use your main app widget here

    // Verify if the login button is present
    expect(find.byType(ElevatedButton), findsOneWidget);
  });
}
