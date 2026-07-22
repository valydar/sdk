import 'dart:io';
import 'package:flutter/material.dart';

class DocumentCapture extends StatefulWidget {
  final Function(File image) onCapture;
  final String? documentType;

  const DocumentCapture({
    super.key,
    required this.onCapture,
    this.documentType,
  });

  @override
  State<DocumentCapture> createState() => _DocumentCaptureState();
}

class _DocumentCaptureState extends State<DocumentCapture> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            const Spacer(),
            Container(
              width: MediaQuery.of(context).size.width * 0.85,
              height: MediaQuery.of(context).size.width * 1.2,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF4F6EF7), width: 2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Container(
                  width: double.infinity,
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 32),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: const Color(0xFF4F6EF7).withOpacity(0.5),
                      width: 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Center(
                    child: Text(
                      'Align document within frame',
                      style: TextStyle(color: Colors.white54, fontSize: 14),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Position your ${widget.documentType ?? "document"} in the frame',
              style: const TextStyle(color: Colors.white, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const Spacer(),
            GestureDetector(
              onTap: () {
                // In a real implementation, capture from camera
                widget.onCapture(File('/tmp/capture.jpg'));
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
