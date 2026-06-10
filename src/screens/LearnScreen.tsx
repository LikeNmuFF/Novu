import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { getDb } from '../services/database';
import { getSubjectProgress, getChaptersForSubject, ChapterStatus } from '../services/progress';
import type { User } from '../services/auth';

const { width } = Dimensions.get('window');

interface SubjectWithChapters {
  id: number;
  name: string;
  icon: string;
  color: string;
  bg_color: string;
  completed: number;
  total: number;
  pct: number;
  expanded: boolean;
  chapters: Array<{
    id: number;
    title: string;
    chapterNumber: number;
    status: ChapterStatus;
    score: number | null;
  }>;
}

function ProgressRing({
  progress,
  color,
  size = 40,
  strokeWidth = 4,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

export default function LearnScreen({
  user,
  onSubjectPress,
  onNavPress,
  activeTab = 'learn',
}: {
  user: User;
  onSubjectPress: (subjectId: number) => void;
  onNavPress: (screen: string) => void;
  activeTab?: string;
}) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);
  const bottomInset = insets.bottom;

  const [subjects, setSubjects] = useState<SubjectWithChapters[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<{
        id: number; name: string; icon: string; color: string; bg_color: string;
      }>('SELECT id, name, icon, color, bg_color FROM subjects ORDER BY subject_order ASC');

      const cards: SubjectWithChapters[] = [];
      for (const row of rows) {
        const progress = await getSubjectProgress(user.id, row.id);
        const chapters = await getChaptersForSubject(user.id, row.id);
        cards.push({
          id: row.id,
          name: row.name,
          icon: row.icon,
          color: row.color,
          bg_color: row.bg_color,
          completed: progress.completed,
          total: progress.total,
          pct: progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0,
          expanded: false,
          chapters,
        });
      }
      setSubjects(cards);
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

  const toggleExpand = (subjectId: number) => {
    setSubjects(prev =>
      prev.map(s => (s.id === subjectId ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const chapterStatusIcon = (status: ChapterStatus) => {
    if (status === 'completed') return '✅';
    if (status === 'unlocked') return '📖';
    return '🔒';
  };

  const chapterStatusText = (status: ChapterStatus, score: number | null) => {
    if (status === 'completed') return `Score: ${score}%`;
    if (status === 'unlocked') return 'Available';
    return 'Locked';
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
          <View>
            <Text style={styles.title}>Learn</Text>
            <Text style={styles.subtitle}>Choose a subject to start learning</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>
                {subjects.reduce((sum, s) => sum + s.completed, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>
                {subjects.reduce((sum, s) => sum + s.total, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Total Lessons</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>
                {subjects.length > 0
                  ? Math.round(
                      subjects.reduce((sum, s) => sum + s.pct, 0) / subjects.length
                    )
                  : 0}
                %
              </Text>
              <Text style={styles.summaryLabel}>Avg Progress</Text>
            </View>
          </View>
        </View>

        {/* Subject List */}
        {subjects.map((subj) => (
          <View key={subj.id} style={styles.subjectBlock}>
            {/* Subject Card */}
            <TouchableOpacity
              style={[styles.subjectCard, { borderLeftColor: subj.color }]}
              onPress={() => toggleExpand(subj.id)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={[styles.subjectIcon, { backgroundColor: subj.bg_color }]}>
                <Text style={styles.subjectIconText}>{subj.icon}</Text>
              </View>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subj.name}</Text>
                <Text style={styles.subjectProgress}>
                  {subj.completed}/{subj.total} lessons
                </Text>
              </View>
              <View style={styles.subjectRight}>
                <ProgressRing progress={subj.pct} color={subj.color} size={44} strokeWidth={4} />
                <Text style={styles.subjectPct}>{subj.pct}%</Text>
              </View>
              <Text style={[styles.expandIcon, subj.expanded && styles.expandIconActive]}>
                ▼
              </Text>
            </TouchableOpacity>

            {/* Expanded Chapter List */}
            {subj.expanded && (
              <View style={styles.chapterList}>
                {subj.chapters.map((ch) => (
                  <TouchableOpacity
                    key={ch.id}
                    style={[
                      styles.chapterItem,
                      ch.status === 'unlocked' && styles.chapterItemUnlocked,
                      ch.status === 'locked' && styles.chapterItemLocked,
                    ]}
                    activeOpacity={ch.status === 'locked' ? 1 : 0.7}
                    onPress={() => {
                      if (ch.status !== 'locked') onSubjectPress(subj.id);
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <View style={styles.chapterStatusBadge}>
                      <Text style={styles.chapterStatusText}>
                        {chapterStatusIcon(ch.status)}
                      </Text>
                    </View>
                    <View style={styles.chapterInfo}>
                      <Text
                        style={[
                          styles.chapterTitle,
                          ch.status === 'unlocked' && styles.chapterTitleUnlocked,
                          ch.status === 'locked' && styles.chapterTitleLocked,
                        ]}
                      >
                        Ch. {ch.chapterNumber}: {ch.title}
                      </Text>
                      <Text style={styles.chapterMeta}>
                        {chapterStatusText(ch.status, ch.score)}
                      </Text>
                    </View>
                    {ch.status !== 'locked' && (
                      <Text style={styles.chapterArrow}>→</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {subjects.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No subjects available</Text>
            <Text style={styles.emptyDesc}>
              Import lessons via QR code or ask your teacher to add content.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: bottomInset, zIndex: 100 }]}>
        {[
          { key: 'home', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z', label: 'Home' },
          { key: 'learn', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', label: 'Learn' },
          { key: 'rewards', icon: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v4h4v-2H5v-2zm14 0h-2v2h-2v2h4v-4z', label: 'Rewards' },
          { key: 'progress', icon: 'M22 12h-4l-3 9L9 3l-3 9H2', label: 'Progress' },
          { key: 'profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', label: 'Profile' },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.navItem}
            onPress={() => onNavPress(item.key)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill={item.key === activeTab ? '#FF7E5F' : '#718096'}>
              <Path d={item.icon} />
            </Svg>
            <Text style={[styles.navLabel, item.key === activeTab && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingBottom: 16,
  },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 28, color: '#1A535C' },
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#718096', marginTop: 2 },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: '#FF7E5F' },
  summaryLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#718096', marginTop: 2 },
  summaryDivider: { width: 1, height: 32, backgroundColor: '#F5E6D5' },
  subjectBlock: { marginBottom: 12, paddingHorizontal: 20 },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  subjectIconText: { fontSize: 24 },
  subjectInfo: { flex: 1 },
  subjectName: { fontFamily: 'Fredoka_700Bold', fontSize: 17, color: '#1A535C' },
  subjectProgress: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096', marginTop: 2 },
  subjectRight: { alignItems: 'center', marginRight: 12 },
  subjectPct: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: '#718096', marginTop: 2 },
  expandIcon: { fontSize: 12, color: '#718096', transform: [{ rotate: '0deg' }] },
  expandIconActive: { transform: [{ rotate: '180deg' }] },
  chapterList: { marginTop: 8, paddingLeft: 24, gap: 8 },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chapterItemUnlocked: { borderWidth: 1.5, borderColor: '#FFA68F' },
  chapterItemLocked: { opacity: 0.5 },
  chapterStatusBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F4EF' },
  chapterStatusText: { fontSize: 14 },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 14, color: '#1A535C' },
  chapterTitleUnlocked: { color: '#E86548' },
  chapterTitleLocked: { color: '#718096' },
  chapterMeta: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#718096', marginTop: 1 },
  chapterArrow: { fontSize: 16, color: '#718096' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#1A535C', marginBottom: 8 },
  emptyDesc: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 20 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5E6D5',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  navItem: { alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 6 },
  navLabel: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: '#718096' },
  navLabelActive: { color: '#FF7E5F' },
});
