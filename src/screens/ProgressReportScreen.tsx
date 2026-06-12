import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StudentReport } from '../types/qr';
import { saveStudentReport } from '../services/database';
import type { User } from '../services/auth';

export default function ProgressReportScreen({
  report,
  user,
  onBack,
}: {
  report: StudentReport;
  user: User;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const weakAreas = report.subjects.filter((s) => s.avg > 0 && s.avg < 50);
  const totalCompleted = report.subjects.reduce((sum, s) => sum + s.completed, 0);
  const totalLessons = report.subjects.reduce((sum, s) => sum + s.total, 0);

  const handleSave = async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      await saveStudentReport(user.id!, report);
      setSaved(true);
      Alert.alert(t('alerts.success'), 'Report saved to your dashboard');
    } catch {
      Alert.alert(t('alerts.error'), t('errors.storage'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Report</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Student Info Card */}
        <View style={styles.studentCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentAvatarText}>
              {report.student_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.studentName}>{report.student_name}</Text>
          <Text style={styles.studentGrade}>{report.grade}</Text>
        </View>

        {/* Overall Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{report.average_score}%</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{report.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>Lv.{report.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>
            {report.streak} day streak
          </Text>
        </View>

        {/* Subject Breakdown */}
        <Text style={styles.sectionTitle}>By Subject</Text>
        {report.subjects.map((subj) => {
          const pct = subj.total > 0 ? Math.round((subj.completed / subj.total) * 100) : 0;
          const isWeak = subj.avg > 0 && subj.avg < 50;
          return (
            <View key={subj.name} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{subj.name}</Text>
                <Text style={[styles.subjectScore, isWeak && styles.subjectScoreWeak]}>
                  {subj.avg}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: isWeak ? '#E86548' : '#2EC4B6',
                    },
                  ]}
                />
              </View>
              <Text style={styles.subjectDetail}>
                {subj.completed}/{subj.total} lessons
              </Text>
            </View>
          );
        })}

        {/* Weak Areas */}
        {weakAreas.length > 0 && (
          <View style={styles.weakSection}>
            <Text style={styles.weakTitle}>⚠️ Areas to Improve</Text>
            {weakAreas.map((subj) => (
              <View key={subj.name} style={styles.weakCard}>
                <View style={styles.weakInfo}>
                  <Text style={styles.weakName}>{subj.name}</Text>
                  <Text style={styles.weakScore}>{subj.avg}% average</Text>
                </View>
                <View style={styles.weakBadge}>
                  <Text style={styles.weakBadgeText}>Needs Work</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnSaved]}
          onPress={handleSave}
          disabled={saved}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.saveBtnText}>
            {saved ? '✓ Saved' : saving ? 'Saving...' : '💾 Save to Dashboard'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  backBtn: {
    width: 60,
    alignItems: 'flex-start',
  },
  backBtnText: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#FF7E5F' },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#1A535C' },
  studentCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  studentAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF7E5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentAvatarText: { fontFamily: 'Fredoka_700Bold', fontSize: 28, color: '#FFFFFF' },
  studentName: { fontFamily: 'Fredoka_700Bold', fontSize: 20, color: '#1A535C' },
  studentGrade: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#718096', marginTop: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statBox: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: '#FF7E5F' },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#718096', marginTop: 4 },
  streakCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF0EB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  streakEmoji: { fontSize: 20 },
  streakText: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#E86548' },
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#1A535C', flex: 1 },
  subjectScore: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#2EC4B6' },
  subjectScoreWeak: { color: '#E86548' },
  progressBar: {
    height: 6,
    backgroundColor: '#F5E6D5',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 999 },
  subjectDetail: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096' },
  weakSection: {
    marginHorizontal: 20,
    marginTop: 8,
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
  saveBtn: {
    marginHorizontal: 20,
    backgroundColor: '#FF7E5F',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  saveBtnSaved: { backgroundColor: '#2EC4B6' },
  saveBtnText: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#FFFFFF' },
});
