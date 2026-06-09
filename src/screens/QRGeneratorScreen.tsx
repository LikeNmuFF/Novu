import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRChunkMeta, QRContentType } from '../types/qr';
import { createQRPackage } from '../utils/qr/package';

const { width } = Dimensions.get('window');
const QR_SIZE = width - 80;

export default function QRGeneratorScreen({
  content,
  contentType,
  title,
  onBack,
  onShareAnother,
}: {
  content: unknown;
  contentType: QRContentType;
  title: string;
  onBack: () => void;
  onShareAnother: () => void;
}) {
  const [chunks] = useState<QRChunkMeta[]>(() => createQRPackage(content, contentType));
  const [currentChunk, setCurrentChunk] = useState(0);

  const chunk = chunks[currentChunk];
  const isMultiChunk = chunks.length > 1;
  const chunkData = JSON.stringify(chunk);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.headerBack}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share via QR</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Sharing</Text>
          <Text style={styles.infoTitle}>{title}</Text>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>{contentType.toUpperCase()}</Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrWrapper}>
          <View style={styles.qrCard}>
            <QRCode
              value={chunkData}
              size={QR_SIZE}
              backgroundColor="#FFFFFF"
              color="#1A535C"
            />
          </View>
        </View>

        {/* Chunk Navigation */}
        {isMultiChunk && (
          <View style={styles.chunkNav}>
            <TouchableOpacity
              style={[styles.chunkArrow, currentChunk === 0 && styles.chunkArrowDisabled]}
              onPress={() => setCurrentChunk(Math.max(0, currentChunk - 1))}
              disabled={currentChunk === 0}
            >
              <Text style={[styles.chunkArrowText, currentChunk === 0 && styles.chunkArrowTextDisabled]}>←</Text>
            </TouchableOpacity>

            <View style={styles.chunkInfo}>
              <Text style={styles.chunkLabel}>QR Code</Text>
              <Text style={styles.chunkCount}>
                {currentChunk + 1} of {chunks.length}
              </Text>
              <View style={styles.chunkDots}>
                {chunks.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chunkDot,
                      i === currentChunk && styles.chunkDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.chunkArrow, currentChunk === chunks.length - 1 && styles.chunkArrowDisabled]}
              onPress={() => setCurrentChunk(Math.min(chunks.length - 1, currentChunk + 1))}
              disabled={currentChunk === chunks.length - 1}
            >
              <Text style={[styles.chunkArrowText, currentChunk === chunks.length - 1 && styles.chunkArrowTextDisabled]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Single chunk info */}
        {!isMultiChunk && (
          <View style={styles.singleInfo}>
            <Text style={styles.singleInfoText}>This content fits in one QR code</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to share:</Text>
          <Text style={styles.instructionsText}>
            {isMultiChunk
              ? `Show each QR code one by one. The student scans all ${chunks.length} codes in order to receive the complete content.`
              : 'Let the student scan this QR code using their LearnBasilan app.'}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={onShareAnother}>
          <Text style={styles.btnSecondaryText}>Share Another</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBack: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#718096',
  },
  headerTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#1A535C',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: '#1A535C',
    marginTop: 4,
    textAlign: 'center',
  },
  infoBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFF0EB',
    borderRadius: 999,
  },
  infoBadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#E86548',
    letterSpacing: 1,
  },
  qrWrapper: {
    marginBottom: 20,
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 8,
  },
  chunkNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  chunkArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chunkArrowDisabled: {
    opacity: 0.4,
  },
  chunkArrowText: {
    fontSize: 20,
    color: '#1A535C',
    fontFamily: 'Fredoka_700Bold',
  },
  chunkArrowTextDisabled: {
    color: '#718096',
  },
  chunkInfo: {
    alignItems: 'center',
    gap: 6,
  },
  chunkLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chunkCount: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: '#1A535C',
  },
  chunkDots: {
    flexDirection: 'row',
    gap: 6,
  },
  chunkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5E6D5',
  },
  chunkDotActive: {
    backgroundColor: '#FF7E5F',
    width: 20,
  },
  singleInfo: {
    marginBottom: 20,
  },
  singleInfoText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: '#E8F8F6',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  instructionsTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#1A535C',
    marginBottom: 6,
  },
  instructionsText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  btnSecondary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5E6D5',
  },
  btnSecondaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#1A535C',
  },
});
