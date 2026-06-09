import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { processQRScan, getQRProgress } from '../utils/qr/package';
import { importContent } from '../services/contentStore';
import type { QRScanResult } from '../types/qr';

export default function QRScannerScreen({ onBack, onImported }: { onBack: () => void; onImported: () => void }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<QRScanResult | null>(null);
  const [scanning, setScanning] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermission();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleBarCodeScanned = useCallback(async ({ data }: { type: string; data: string }) => {
    if (!scanning) return;
    setScanning(false);
    Vibration.vibrate(100);

    const scanResult = processQRScan(data);
    setResult(scanResult);

    if (scanResult.status === 'complete' && scanResult.content) {
      await importContent(scanResult.type!, scanResult.content);
      setTimeout(() => {
        onImported();
      }, 1500);
      return;
    }

    if (scanResult.status === 'duplicate') {
      setTimeout(() => {
        setResult(null);
        setScanning(true);
      }, 1500);
      return;
    }

    if (scanResult.status === 'partial') {
      setTimeout(() => {
        setScanned(false);
        setScanning(true);
      }, 2000);
      return;
    }
  }, [scanning]);

  const progress = result?.progress
    ? `${result.progress.received} / ${result.progress.total}`
    : null;

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.permissionText}>No camera access</Text>
          <Text style={styles.permissionSub}>Please enable camera in your settings to scan QR codes</Text>
          <TouchableOpacity style={styles.btnOutline} onPress={onBack}>
            <Text style={styles.btnOutlineText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBack}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Scanner */}
      <View style={styles.scannerWrapper}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame}>
            <Animated.View
              style={[
                styles.scanCornerTL,
                { opacity: pulseAnim },
              ]}
            />
            <Animated.View
              style={[
                styles.scanCornerTR,
                { opacity: pulseAnim },
              ]}
            />
            <Animated.View
              style={[
                styles.scanCornerBL,
                { opacity: pulseAnim },
              ]}
            />
            <Animated.View
              style={[
                styles.scanCornerBR,
                { opacity: pulseAnim },
              ]}
            />
            {scanning && (
              <View style={styles.scanLine} />
            )}
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusArea}>
        {result?.status === 'complete' && (
          <View style={styles.statusSuccess}>
            <Text style={styles.statusIcon}>✅</Text>
            <Text style={styles.statusText}>Content imported successfully!</Text>
          </View>
        )}
        {result?.status === 'partial' && (
          <View style={styles.statusPartial}>
            <Text style={styles.statusIcon}>📦</Text>
            <Text style={styles.statusText}>
              Scanning... {progress} chunks received
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((result.progress?.received ?? 0) / (result.progress?.total ?? 1)) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.statusHint}>Scan the next QR code</Text>
          </View>
        )}
        {result?.status === 'duplicate' && (
          <View style={styles.statusWarn}>
            <Text style={styles.statusIcon}>🔄</Text>
            <Text style={styles.statusText}>Already scanned this code</Text>
          </View>
        )}
        {result?.status === 'invalid' && (
          <View style={styles.statusError}>
            <Text style={styles.statusIcon}>⚠️</Text>
            <Text style={styles.statusText}>Invalid QR code</Text>
          </View>
        )}
        {!result && scanning && (
          <View style={styles.statusIdle}>
            <Text style={styles.statusIcon}>📷</Text>
            <Text style={styles.statusText}>Point your camera at a QR code</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2E33',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerBack: {
    width: 60,
  },
  headerBackText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  headerTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  scannerWrapper: {
    flex: 1,
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  scanFrame: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  scanCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 36,
    height: 36,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FF7E5F',
    borderTopLeftRadius: 12,
  },
  scanCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FF7E5F',
    borderTopRightRadius: 12,
  },
  scanCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 36,
    height: 36,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FF7E5F',
    borderBottomLeftRadius: 12,
  },
  scanCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FF7E5F',
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: '#FF7E5F',
    opacity: 0.6,
  },
  statusArea: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    minHeight: 80,
    justifyContent: 'center',
  },
  statusSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EDF8EF',
    borderRadius: 16,
    padding: 16,
  },
  statusPartial: {
    backgroundColor: '#E8F8F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statusWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFF8E0',
    borderRadius: 16,
    padding: 16,
  },
  statusError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFE8E0',
    borderRadius: 16,
    padding: 16,
  },
  statusIdle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  statusHint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(46, 196, 182, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2EC4B6',
    borderRadius: 3,
  },
  btnOutline: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  btnOutlineText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
