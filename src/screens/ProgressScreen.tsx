import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { getDb } from '../services/database';
import { getUserStats } from '../services/auth';
import type { User } from '../services/auth';

export default function ProgressScreen({
  user,
  onBack,
}: {
  user: User;
  onBack: () => void;
}) {
  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0 });
  const [subjectProgress, setSubjectProgress] = useState<Array<{
    name: string;
    icon: string;
    color: string;
    completed: number;
    total: number;
    avgScore: number;
  }>>([]);

  useEffect(() => {
    getUserStats(user.id).then(setStats).catch(() => {});

    const loadProgress = async () => {
      try {
        const db = await getDb();
        const subjects = await db.getAllAsync<{ id: number; name: string; icon: string; color: string }>(
          'SELECT id, name, icon, color FROM subjects ORDER BY subject_order'
        );

        const progress = [];
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
      } catch {}
    };
    loadProgress();
  }, [user.id]);

  const totalCompleted = subjectProgress.reduce((sum, s) => sum + s.completed, 0);
  const totalLessons = subjectProgress.reduce((sum, s) => sum + s.total, 0);
  const overallAvg = totalCompleted > 0
    ? Math.round(subjectProgress.reduce((sum, s) => sum + (s.avgScore * s.completed), 0) / totalCompleted)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.headerBack}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress</Text>
          <View style={{ width: 60 }} />
        </View>

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

        <Text style={styles.sectionTitle}>By Subject</Text>

        {subjectProgress.map((subj) => {
          const pct = subj.total > 0 ? Math.round((subj.completed / subj.total) * 100) : 0;
          return (
            <View key={subj.name} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectIcon}>{subj.icon}</Text>
                <Text style={styles.subjectName}>{subj.name}</Text>
                <Text style={styles.subjectPct}>{pct}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: subj.color }]} />
              </View>
              <Text style={styles.subjectDetail}>
                {subj.completed}/{subj.total} lessons • {subj.avgScore}% avg
              </Text>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
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
    paddingVertical: 12,
  },
  headerBack: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#718096' },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#1A535C' },
  overviewCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
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
  overviewNum: { fontFamily: 'Fredoka_700Bold', fontSize: 28, color: '#FF7E5F' },
  overviewLabel: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096', marginTop: 2 },
  overviewDivider: { width: 1, height: 40, backgroundColor: '#F5E6D5' },
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
  progressBar: {
    height: 6,
    backgroundColor: '#F5E6D5',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 999 },
  subjectDetail: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096' },
});
