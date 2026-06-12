import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../context/ThemeContext';
import { getDb } from '../services/database';
import { getUserStats } from '../services/auth';
import { createQRPackage } from '../utils/qr/package';
import { QRContentType, QRChunkMeta } from '../types/qr';
import BottomNav from '../components/BottomNav';
import type { User } from '../services/auth';

const { width: screenWidth } = Dimensions.get('window');
const QR_SIZE = screenWidth - 120;

interface SubjectProgress {
  name: string;
  icon: string;
  color: string;
  completed: number;
  total: number;
  avgScore: number;
}

export default function ProgressScreen({
  user,
  onNavPress,
  activeTab = 'progress',
}: {
  user: User;
  onNavPress: (screen: string) => void;
  activeTab?: string;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors } = theme;
  const topInset = Math.max(insets.top, 16);

  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0 });
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [xpHistory, setXpHistory] = useState<number[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrChunks, setQRChunks] = useState<QRChunkMeta[]>([]);
  const [currentChunk, setCurrentChunk] = useState(0);

  const loadData = useCallback(async () => {
    try {
      getUserStats(user.id).then(setStats).catch(() => {});
      const db = await getDb();

      const subjects = await db.getAllAsync<{ id: number; name: string; icon: string; color: string }>(
        'SELECT id, name, icon, color FROM subjects ORDER BY subject_order'
      );

      const progress: SubjectProgress[] = [];
      for (const subj of subjects) {
        const total = await db.getFirstAsync<{ count: number }>(
          'SELECT COUNT(*) as count FROM lessons WHERE subject_id = ?',
          [subj.id]
        );
        const completed = await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE subject_id = ?) AND status = 'completed'",
          [user.id, subj.id]
        );
        const avg = await db.getFirstAsync<{ avg: number | null }>(
          "SELECT AVG(score) as avg FROM progress WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE subject_id = ?) AND status = 'completed'",
          [user.id, subj.id]
        );

        progress.push({
          name: subj.name,
          icon: subj.icon,
          color: subj.color,
          completed: completed?.count ?? 0,
          total: total?.count ?? 0,
          avgScore: Math.round(avg?.avg ?? 0),
        });
      }
      setSubjectProgress(progress);

      const xpRows = await db.getAllAsync<{ score: number; completed_at: number }>(
        "SELECT score, completed_at FROM progress WHERE user_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 7",
        [user.id]
      );
      setXpHistory(xpRows.map(r => r.score).reverse());
    } catch {}
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const totalCompleted = subjectProgress.reduce((sum, s) => sum + s.completed, 0);
  const totalLessons = subjectProgress.reduce((sum, s) => sum + s.total, 0);
  const overallAvg = totalCompleted > 0
    ? Math.round(subjectProgress.reduce((sum, s) => sum + (s.avgScore * s.completed), 0) / totalCompleted)
    : 0;

  const weakAreas = subjectProgress.filter(s => s.avgScore > 0 && s.avgScore < 50);

  const handleExportQR = async () => {
    try {
      const qrData = {
        student_name: user.name,
        grade: user.grade,
        average_score: overallAvg,
        completed_lessons: totalCompleted,
        total_lessons: totalLessons,
        streak: stats.streak,
        level: stats.level,
        xp: stats.xp,
        subjects: subjectProgress.map(s => ({
          name: s.name,
          avg: s.avgScore,
          completed: s.completed,
          total: s.total,
        })),
      };
      const chunks = createQRPackage(qrData, QRContentType.Progress);
      setQRChunks(chunks);
      setCurrentChunk(0);
      setShowQRModal(true);
    } catch {
      Alert.alert(t('alerts.error'), t('errors.storage'));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        pointerEvents="box-none"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('progress.title')}</Text>
        </View>

        {/* Overview Card */}
        <View style={{
          marginHorizontal: 20,
          backgroundColor: colors.surface,
          borderRadius: 18,
          padding: 18,
          marginBottom: 16,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewNum, { color: colors.coral }]}>{totalCompleted}</Text>
              <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Completed</Text>
            </View>
            <View style={[styles.overviewDivider, { backgroundColor: colors.border }]} />
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewNum, { color: colors.coral }]}>{totalLessons}</Text>
              <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Total</Text>
            </View>
            <View style={[styles.overviewDivider, { backgroundColor: colors.border }]} />
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewNum, { color: colors.coral }]}>{overallAvg}%</Text>
              <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Average</Text>
            </View>
          </View>
        </View>

        {/* XP History Chart */}
        {xpHistory.length > 0 && (
          <View style={{
            marginHorizontal: 20,
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          }}>
            <Text style={[styles.chartTitle, { color: colors.text, marginBottom: 12 }]}>📊 Quiz Scores</Text>
            <LineChart
              data={{
                labels: xpHistory.map((_, i) => `${i + 1}`),
                datasets: [{ data: xpHistory.length > 0 ? xpHistory : [0] }],
              }}
              width={screenWidth - 72}
              height={140}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 126, 95, ${opacity})`,
                labelColor: () => colors.textMuted,
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: colors.coral,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Weak Areas */}
        {weakAreas.length > 0 && (
          <View style={styles.weakSection}>
            <Text style={[styles.weakTitle, { color: '#E86548', marginBottom: 10 }]}>⚠️ Areas to Improve</Text>
            {weakAreas.map((subj) => (
              <View key={subj.name} style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 12,
                marginBottom: 8,
              }}>
                <Text style={styles.weakIcon}>{subj.icon}</Text>
                <View style={styles.weakInfo}>
                  <Text style={[styles.weakName, { color: colors.text }]}>{subj.name}</Text>
                  <Text style={[styles.weakScore, { color: '#E86548', marginTop: 1 }]}>{subj.avgScore}% average</Text>
                </View>
                <View style={{
                  backgroundColor: '#E86548',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}>
                  <Text style={[styles.weakBadgeText, { color: '#FFFFFF' }]}>Needs Work</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>By Subject</Text>

        {/* Subject Progress */}
        {subjectProgress.map((subj) => {
          const pct = subj.total > 0 ? Math.round((subj.completed / subj.total) * 100) : 0;
          return (
            <View key={subj.name} style={{
              marginHorizontal: 20,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectIcon}>{subj.icon}</Text>
                <Text style={[styles.subjectName, { color: colors.text, flex: 1 }]}>{subj.name}</Text>
                <Text style={{
                  fontFamily: 'Nunito_700Bold',
                  fontSize: 14,
                  color: subj.avgScore < 50 ? '#E86548' : colors.coral,
                }}>
                  {pct}%
                </Text>
              </View>
              <View style={{
                height: 6,
                backgroundColor: colors.border,
                borderRadius: 999,
                overflow: 'hidden',
                marginBottom: 6,
              }}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%`, backgroundColor: subj.color },
                  ]}
                />
              </View>
              <Text style={[styles.subjectDetail, { color: colors.textMuted }]}>
                {subj.completed}/{subj.total} lessons • {subj.avgScore}% avg
              </Text>
            </View>
          );
        })}

        {/* Export QR Button */}
        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: colors.teal,
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: 'center',
            marginTop: 8,
            shadowColor: colors.teal,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 4,
          }}
          onPress={handleExportQR}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#FFFFFF' }}>📤 Export Progress QR</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav activeTab={activeTab} onNavPress={onNavPress} />

      {/* QR Display Modal */}
      <Modal visible={showQRModal} transparent animationType="fade" onRequestClose={() => setShowQRModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
          }}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>📤 Share Progress</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalStudentInfo}>
              <Text style={[styles.modalStudentName, { color: colors.text }]}>{user.name}</Text>
              <Text style={[styles.modalStudentGrade, { color: colors.textMuted, marginTop: 2 }]}>{user.grade}</Text>
            </View>

            <View style={styles.modalQRWrapper}>
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 12,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 6,
              }}>
                <QRCode
                  value={JSON.stringify(qrChunks[currentChunk])}
                  size={QR_SIZE}
                  backgroundColor={colors.surface}
                  color={colors.text}
                />
              </View>
            </View>

            {qrChunks.length > 1 && (
              <View style={styles.modalChunkNav}>
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.border,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => setCurrentChunk(Math.max(0, currentChunk - 1))}
                  disabled={currentChunk === 0}
                >
                  <Text style={[styles.modalChunkBtnText, { color: colors.text }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.modalChunkCount, { color: colors.text }]}>
                  {currentChunk + 1} / {qrChunks.length}
                </Text>
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.border,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => setCurrentChunk(Math.min(qrChunks.length - 1, currentChunk + 1))}
                  disabled={currentChunk === qrChunks.length - 1}
                >
                  <Text style={[styles.modalChunkBtnText, { color: colors.text }]}>→</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.modalHint, { color: colors.textMuted }]}>
              {qrChunks.length > 1
                ? `Show each QR code one by one. Teacher scans all ${qrChunks.length} codes.`
                : 'Show this QR code to your teacher to share your progress.'}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18 },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  overviewItem: { alignItems: 'center' },
  overviewNum: { fontFamily: 'Fredoka_700Bold', fontSize: 24 },
  overviewLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  overviewDivider: { width: 1, height: 36 },
  chart: { borderRadius: 12 },
  chartTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  weakSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  weakTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  weakIcon: { fontSize: 20, marginRight: 10 },
  weakInfo: { flex: 1 },
  weakName: { fontFamily: 'Fredoka_700Bold', fontSize: 14 },
  weakScore: { fontFamily: 'Nunito_400Regular', fontSize: 12 },
  weakBadgeText: { fontFamily: 'Nunito_700Bold', fontSize: 10 },
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectIcon: { fontSize: 20, marginRight: 10 },
  subjectName: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  subjectDetail: { fontFamily: 'Nunito_400Regular', fontSize: 13 },
  progressFill: { height: '100%', borderRadius: 999 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 20 },
  modalClose: { fontFamily: 'Nunito_700Bold', fontSize: 20 },
  modalStudentInfo: { alignItems: 'center', marginBottom: 20 },
  modalStudentName: { fontFamily: 'Fredoka_700Bold', fontSize: 18 },
  modalStudentGrade: { fontFamily: 'Nunito_400Regular', fontSize: 14 },
  modalQRWrapper: { marginBottom: 16, alignItems: 'center' },
  modalChunkNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  modalChunkBtnDisabled: { opacity: 0.4 },
  modalChunkBtnText: { fontFamily: 'Fredoka_700Bold', fontSize: 18 },
  modalChunkCount: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  modalHint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
