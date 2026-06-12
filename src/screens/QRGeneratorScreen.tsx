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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { QRChunkMeta, QRContentType } from '../types/qr';
import { createQRPackage } from '../utils/qr/package';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const { colors } = theme;
  const [chunks] = useState<QRChunkMeta[]>(() => createQRPackage(content, contentType));
  const [currentChunk, setCurrentChunk] = useState(0);
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);

  const chunk = chunks[currentChunk];
  const isMultiChunk = chunks.length > 1;
  const chunkData = JSON.stringify(chunk);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.headerBack, { color: colors.textLight }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Share via QR</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>Sharing</Text>
          <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
          <View style={[styles.infoBadge, { backgroundColor: colors.coral + '20' }]}>
            <Text style={[styles.infoBadgeText, { color: colors.coral }]}>{contentType.toUpperCase()}</Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrWrapper}>
          <View style={[styles.qrCard, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
            <QRCode
              value={chunkData}
              size={QR_SIZE}
              backgroundColor={colors.surface}
              color={colors.text}
            />
          </View>
        </View>

        {/* Chunk Navigation */}
        {isMultiChunk && (
          <View style={styles.chunkNav}>
            <TouchableOpacity
              style={[styles.chunkArrow, { backgroundColor: colors.surface, shadowColor: colors.text }, currentChunk === 0 && styles.chunkArrowDisabled]}
              onPress={() => setCurrentChunk(Math.max(0, currentChunk - 1))}
              disabled={currentChunk === 0}
            >
              <Text style={[styles.chunkArrowText, { color: colors.text }, currentChunk === 0 && [styles.chunkArrowTextDisabled, { color: colors.textLight }]]}>←</Text>
            </TouchableOpacity>

            <View style={styles.chunkInfo}>
              <Text style={[styles.chunkLabel, { color: colors.textLight }]}>QR Code</Text>
              <Text style={[styles.chunkCount, { color: colors.text }]}>
                {currentChunk + 1} of {chunks.length}
              </Text>
              <View style={styles.chunkDots}>
                {chunks.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chunkDot,
                      { backgroundColor: colors.border },
                      i === currentChunk && [styles.chunkDotActive, { backgroundColor: colors.coral }],
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.chunkArrow, { backgroundColor: colors.surface, shadowColor: colors.text }, currentChunk === chunks.length - 1 && styles.chunkArrowDisabled]}
              onPress={() => setCurrentChunk(Math.min(chunks.length - 1, currentChunk + 1))}
              disabled={currentChunk === chunks.length - 1}
            >
              <Text style={[styles.chunkArrowText, { color: colors.text }, currentChunk === chunks.length - 1 && [styles.chunkArrowTextDisabled, { color: colors.textLight }]]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Single chunk info */}
        {!isMultiChunk && (
          <View style={styles.singleInfo}>
            <Text style={[styles.singleInfoText, { color: colors.textLight }]}>This content fits in one QR code</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: colors.teal + '15' }]}>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>How to share:</Text>
          <Text style={[styles.instructionsText, { color: colors.textMuted }]}>
            {isMultiChunk
              ? `Show each QR code one by one. The student scans all ${chunks.length} codes in order to receive the complete content.`
              : 'Let the student scan this QR code using their LearnBasilan app.'}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={[styles.btnSecondary, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onShareAnother}>
          <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Share Another</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  infoCard: {
    borderRadius: 18,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    marginTop: 4,
    textAlign: 'center',
  },
  infoBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  infoBadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  qrWrapper: {
    marginBottom: 20,
    alignItems: 'center',
  },
  qrCard: {
    borderRadius: 24,
    padding: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'Fredoka_700Bold',
  },
  chunkArrowTextDisabled: {},
  chunkInfo: {
    alignItems: 'center',
    gap: 6,
  },
  chunkLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chunkCount: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
  },
  chunkDots: {
    flexDirection: 'row',
    gap: 6,
  },
  chunkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chunkDotActive: {
    width: 20,
  },
  singleInfo: {
    marginBottom: 20,
  },
  singleInfoText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  instructions: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  instructionsTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    marginBottom: 6,
  },
  instructionsText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  btnSecondary: {
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    borderWidth: 2,
  },
  btnSecondaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
  },
});
