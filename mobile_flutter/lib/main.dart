import 'package:flutter/material.dart';
import 'screens/home.dart';
import 'screens/gig_details.dart';
void main() => runApp(MyApp());
class MyApp extends StatelessWidget {
  @override Widget build(BuildContext context) { return MaterialApp(title:'Freelance Pi', home: HomeScreen(), routes:{'/gig': (_) => GigDetailsScreen()}); }
}
