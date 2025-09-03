import 'package:flutter/material.dart'; import 'package:http/http.dart' as http; import 'dart:convert';
class GigDetailsScreen extends StatefulWidget { @override _GigDetailsScreenState createState() => _GigDetailsScreenState(); }
class _GigDetailsScreenState extends State<GigDetailsScreen> {
  dynamic gig;
  Future<void> createPayment() async {
    final res = await http.post(Uri.parse('http://10.0.2.2:5000/api/payments/create'), headers: {'Content-Type':'application/json'}, body: json.encode({'projectId': gig?['_id'], 'amount': 10}));
    final data = json.decode(res.body);
    final paymentUrl = data['payment_url'] ?? '';
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Payment created (mock). URL: ' + paymentUrl)));
    // In a real mobile integration, open WebView or use Pi mobile SDK to handle payment
  }
  @override Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as dynamic;
    gig = args;
    return Scaffold(appBar: AppBar(title: Text(gig!=null? gig['title'] : 'Gig')), body: Center(child: ElevatedButton(onPressed: createPayment, child: Text('Pay with Pi (10 Pi)'))));
  }
}
