import 'dart:io';
import 'package:flutter/material.dart';

class SelfieCapture extends StatefulWidget {
  final Function(File image) onCapture;

  const SelfieCapture({super.key, required this.onCapture});

  @override
  State<SelfieCapture> createState() => _SelfieCaptureState();
}

class _SelfieCaptureState extends State<SelfieCapture> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            const Spacer(),
            Container(
              width: 240,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.circular(120),
                border: Border.all(
                  color: const Color(0xFF4F6EF7),
                  width: 3,
                ),
              ),
              child: const Center(
                child: Text(
                  'Position face in oval',
                  style: TextStyle(color: Colors.white54, fontSize: 14),
                ),
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Ensure good lighting and face centred',
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
            const Spacer(),
            GestureDetector(
              onTap: () {
                widget.onCapture(File('/tmp/selfie.jpg'));
              },
              child: Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.fromBorderSide(
                    BorderSide(color: Colors.white, width: 4),
                  ),
                ),
                child: Container(
                  margin: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
