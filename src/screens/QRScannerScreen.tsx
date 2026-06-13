import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { processQRScan } from '../utils/qr/package';
import { importContent } from '../services/contentStore';
import { QRContentType } from '../types/qr';
import type { QRScanResult } from '../types/qr';
import type { User } from '../services/auth';
import { useTheme } from '../context/ThemeContext';

export default function QRScannerScreen({
  user,
  onBack,
  onImported,
}: {
  user: User;
  onBack: () => void;
  onImported: (report?: any) => void;
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const scannedPackages = useRef(new Set<string>());

  const handleBarCodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (scanning) return;
    setScanning(true);
    Vibration.vibrate(100);

    try {
      const result: QRScanResult = processQRScan(data);

      if (result.status === 'invalid') {
        setStatus(`Invalid QR code: ${result.error}`);
        setScanning(false);
        return;
      }

      if (result.status === 'duplicate') {
        setStatus('Already scanned this code');
        setScanning(false);
        return;
      }

      if (result.status === 'partial' && result.packageId) {
        if (scannedPackages.current.has(result.packageId + '_' + result.progress?.received)) {
          setStatus('Already scanned this code');
          setScanning(false);
          return;
        }
        scannedPackages.current.add(result.packageId + '_' + result.progress?.received);
        setScanResult(result);
        setStatus(`Scanning... ${result.progress?.received}/${result.progress?.total} chunks received`);
        setScanning(false);
        return;
      }

      if (result.status === 'complete') {
        setScanResult(result);

        if (result.type === QRContentType.Progress) {
          setStatus('Content imported successfully!');
          setTimeout(() => {
            onImported(result.content);
          }, 1500);
          return;
        }

        // Grade-level validation for lessons
        if (result.type === QRContentType.Lesson && result.content) {
          const content = result.content as Record<string, unknown>;
          const qrGradeLevel = content.grade_level as number | undefined;

          if (qrGradeLevel !== undefined && user.role === 'student') {
            const studentGrade = parseInt(user.grade.replace('Grade ', ''), 10);

            if (!isNaN(studentGrade) && qrGradeLevel !== studentGrade) {
              setStatus(`This lesson is for Grade ${qrGradeLevel}. Your grade is ${user.grade}.`);
              Vibration.vibrate([0, 100, 100, 100]);
              setScanning(false);
              return;
            }
          }
        }

        setStatus('Content imported successfully!');

        try {
          await importContent(result.type!, result.content, user.id);
        } catch (err) {
          setStatus('Error saving content. Please try again.');
          setScanning(false);
          return;
        }

        setTimeout(() => {
          onImported();
        }, 1500);
        return;
      }
    } catch (err) {
      setStatus('Error scanning QR code');
    }

    setScanning(false);
  }, [scanning, onImported]);

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.teal }]}>
        <View style={styles.center}>
          <Text style={[styles.statusText, { color: colors.background }]}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.teal }]}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>📷</Text>
          <Text style={[styles.errorTitle, { color: colors.background }]}>No camera access</Text>
          <Text style={[styles.errorDesc, { color: 'rgba(255,255,255,0.7)' }]}>
            Please enable camera in your settings to scan QR codes
          </Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.coral }]} onPress={requestPermission}>
            <Text style={[styles.retryBtnText, { color: colors.background }]}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={[styles.backBtnText, { color: 'rgba(255,255,255,0.6)' }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.teal }]}>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.headerBack, { color: 'rgba(255,255,255,0.8)' }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.background }]}>Scan QR Code</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.scannerWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.coral }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.coral }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.coral }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.coral }]} />
          </View>
        </View>
        <View style={[styles.scanLine, { backgroundColor: colors.coral }]} />
      </View>

      <View style={styles.statusBar}>
        {status ? (
          <View style={[
            styles.statusCard,
            scanResult?.status === 'complete' && [styles.statusCardSuccess, { backgroundColor: 'rgba(107,203,119,0.3)' }],
            scanResult?.status === 'partial' && [styles.statusCardPartial, { backgroundColor: 'rgba(255,217,61,0.3)' }],
          ]}>
            <Text style={[styles.statusText, { color: colors.background }]}>{status}</Text>
          </View>
        ) : (
          <View style={[styles.statusCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={[styles.statusHint, { color: 'rgba(255,255,255,0.7)' }]}>Point your camera at a QR code</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerBack: { fontFamily: 'Nunito_700Bold', fontSize: 16 },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  scannerWrapper: { flex: 1, position: 'relative' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLine: {
    position: 'absolute',
    left: 30,
    right: 30,
    height: 2,
    top: '50%',
    opacity: 0.6,
  },
  statusBar: {
    padding: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  statusCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  statusCardSuccess: {},
  statusCardPartial: {},
  statusText: { fontFamily: 'Nunito_700Bold', fontSize: 15, textAlign: 'center' },
  statusHint: { fontFamily: 'Nunito_400Regular', fontSize: 14, textAlign: 'center' },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 22, marginBottom: 8 },
  errorDesc: { fontFamily: 'Nunito_400Regular', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  retryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    marginBottom: 12,
  },
  retryBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 16 },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  backBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
});
