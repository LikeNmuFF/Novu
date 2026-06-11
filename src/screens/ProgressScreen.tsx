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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getDb } from '../services/database';
import { getUserStats } from '../services/auth';
import { createQRPackage } from '../utils/qr/package';
import { QRContentType } from '../types/qr';
import BottomNav from '../components/BottomNav';
import type { User } from '../services/auth';

const { width: screenWidth } = Dimensions.get('window');

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
  const topInset = Math.max(insets.top, 16);

  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0 });
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [xpHistory, setXpHistory] = useState<number[]>([]);

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
        student: user.name,
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
      const qr = createQRPackage(qrData, QRContentType.Progress);
      Alert.alert(t('alerts.progressQRGenerated'), t('alerts.qrGenerated', { count: qr.length }));
    } catch {
      Alert.alert(t('alerts.error'), t('errors.storage'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        pointerEvents="box-none"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7E5F" />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset }]}>
          <Text style={styles.headerTitle}>{t('progress.title')}</Text>
        </View>

        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNum}>{totalCompleted}</Text>
              <Text style={styles.overviewLabel}>Completed</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNum}>{totalLessons}</Text>
              <Text style={styles.overviewLabel}>Total</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNum}>{overallAvg}%</Text>
              <Text style={styles.overviewLabel}>Average</Text>
            </View>
          </View>
        </View>

        {/* XP History Chart */}
        {xpHistory.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📊 Quiz Scores</Text>
            <LineChart
              data={{
                labels: xpHistory.map((_, i) => `${i + 1}`),
                datasets: [{ data: xpHistory.length > 0 ? xpHistory : [0] }],
              }}
              width={screenWidth - 72}
              height={140}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 126, 95, ${opacity})`,
                labelColor: () => '#718096',
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#FF7E5F',
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
            <Text style={styles.weakTitle}>⚠️ Areas to Improve</Text>
            {weakAreas.map((subj) => (
              <View key={subj.name} style={styles.weakCard}>
                <Text style={styles.weakIcon}>{subj.icon}</Text>
                <View style={styles.weakInfo}>
                  <Text style={styles.weakName}>{subj.name}</Text>
                  <Text style={styles.weakScore}>{subj.avgScore}% average</Text>
                </View>
                <View style={styles.weakBadge}>
                  <Text style={styles.weakBadgeText}>Needs Work</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>By Subject</Text>

        {/* Subject Progress */}
        {subjectProgress.map((subj) => {
          const pct = subj.total > 0 ? Math.round((subj.completed / subj.total) * 100) : 0;
          return (
            <View key={subj.name} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectIcon}>{subj.icon}</Text>
                <Text style={styles.subjectName}>{subj.name}</Text>
                <Text style={[styles.subjectPct, subj.avgScore < 50 && styles.subjectPctWeak]}>
                  {pct}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%`, backgroundColor: subj.color },
                  ]}
                />
              </View>
              <Text style={styles.subjectDetail}>
                {subj.completed}/{subj.total} lessons • {subj.avgScore}% avg
              </Text>
            </View>
          );
        })}

        {/* Export QR Button */}
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={handleExportQR}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.exportBtnText}>📤 Export Progress QR</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav activeTab={activeTab} onNavPress={onNavPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#1A535C' },
  overviewCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  overviewItem: { alignItems: 'center' },
  overviewNum: { fontFamily: 'Fredoka_700Bold', fontSize: 24, color: '#FF7E5F' },
  overviewLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#718096', marginTop: 2 },
  overviewDivider: { width: 1, height: 36, backgroundColor: '#F5E6D5' },
  chartCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#1A535C', marginBottom: 12 },
  chart: { borderRadius: 12 },
  weakSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  weakTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#E86548', marginBottom: 10 },
  weakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  weakIcon: { fontSize: 20, marginRight: 10 },
  weakInfo: { flex: 1 },
  weakName: { fontFamily: 'Fredoka_700Bold', fontSize: 14, color: '#1A535C' },
  weakScore: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#E86548', marginTop: 1 },
  weakBadge: {
    backgroundColor: '#E86548',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  weakBadgeText: { fontFamily: 'Nunito_700Bold', fontSize: 10, color: '#FFFFFF' },
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: '#1A535C',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  subjectCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectIcon: { fontSize: 20, marginRight: 10 },
  subjectName: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#1A535C', flex: 1 },
  subjectPct: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#FF7E5F' },
  subjectPctWeak: { color: '#E86548' },
  progressBar: {
    height: 6,
    backgroundColor: '#F5E6D5',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 999 },
  subjectDetail: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096' },
  exportBtn: {
    marginHorizontal: 20,
    backgroundColor: '#2EC4B6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2EC4B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  exportBtnText: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#FFFFFF' },
});
