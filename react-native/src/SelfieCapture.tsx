import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { SelfieCaptureProps, LivenessResult } from './types';
import { ValydarClient } from './ValydarClient';

type Phase = 'framing' | 'capturing' | 'uploading' | 'complete' | 'error';

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({
  verificationId,
  apiKey,
  apiUrl,
  onComplete,
  onError,
}) => {
  const client = useRef(new ValydarClient({ apiKey, apiUrl })).current;
  const [phase, setPhase] = useState<Phase>('framing');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCapture = useCallback(async () => {
    if (phase !== 'framing') return;
    setPhase('capturing');

    try {
      await client.uploadSelfie(verificationId, 'file://selfie.jpg');
      setPhase('complete');
      onComplete({ passed: true, score: 1.0, checks: [] });
    } catch (err) {
      setPhase('error');
      const msg = err instanceof Error ? err.message : 'Selfie upload failed';
      setErrorMsg(msg);
      onError(err instanceof Error ? err : new Error(msg));
    }
  }, [phase, client, verificationId, onComplete, onError]);

  if (phase === 'uploading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4f6ef7" />
        <Text style={styles.text}>Uploading selfie...</Text>
      </View>
    );
  }

  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.text}>Selfie captured</Text>
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
      <View style={styles.oval}>
        <Text style={styles.ovalText}>Position face in oval</Text>
      </View>
      <Text style={styles.instruction}>
        Ensure good lighting and face centred
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
  oval: {
    width: 240,
    height: 320,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: '#4f6ef7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  ovalText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
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
