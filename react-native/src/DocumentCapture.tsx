import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { DocumentCaptureProps, DocumentUploadResponse } from './types';
import { ValydarClient } from './ValydarClient';

type CapturePhase = 'framing' | 'capturing' | 'uploading' | 'complete' | 'error';

export const DocumentCapture: React.FC<DocumentCaptureProps> = ({
  verificationId,
  apiKey,
  apiUrl,
  documentType,
  onComplete,
  onError,
}) => {
  const client = useRef(new ValydarClient({ apiKey, apiUrl })).current;
  const [phase, setPhase] = useState<CapturePhase>('framing');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleCapture = useCallback(async () => {
    if (phase !== 'framing') return;
    setPhase('capturing');

    try {
      const response = await client.uploadDocument(
        verificationId,
        'file://capture.jpg',
        documentType,
      );
      setPhase('complete');
      onComplete(response);
    } catch (err) {
      setPhase('error');
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMsg(msg);
      onError(err instanceof Error ? err : new Error(msg));
    }
  }, [phase, client, verificationId, documentType, onComplete, onError]);

  if (phase === 'uploading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4f6ef7" />
        <Text style={styles.text}>Uploading document...</Text>
      </View>
    );
  }

  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.text}>Document captured</Text>
      </View>
    );
  }

  if (phase === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>❌</Text>
        <Text style={styles.text}>{errorMsg}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setPhase('framing');
            setErrorMsg('');
          }}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        <View style={styles.frame}>
          <Text style={styles.frameText}>Align document within frame</Text>
        </View>
      </View>
      <Text style={styles.instruction}>
        Position your {documentType ?? 'document'} in the frame
      </Text>
      <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
        <View style={styles.captureInner} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: '85%',
    aspectRatio: 1.4,
    borderWidth: 2,
    borderColor: '#4f6ef7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  frame: {
    borderWidth: 1,
    borderColor: '#4f6ef780',
    borderStyle: 'dashed',
    borderRadius: 8,
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.7,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#4f6ef7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
