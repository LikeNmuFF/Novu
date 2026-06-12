import { useState, useEffect, useCallback, useMemo } from 'react';
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
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
  const { colors } = theme;
  const themedStyles = useMemo(() => createStyles(colors), [colors]);

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
    <SafeAreaView style={themedStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        pointerEvents="box-none"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7E5F" />
        }
      >
        {/* Header */}
        <View style={[themedStyles.header, { paddingTop: topInset }]}>
          <View>
            <Text style={themedStyles.title}>Learn</Text>
            <Text style={themedStyles.subtitle}>Choose a subject to start learning</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={themedStyles.summaryCard}>
          <View style={themedStyles.summaryRow}>
            <View style={themedStyles.summaryItem}>
              <Text style={themedStyles.summaryNum}>
                {subjects.reduce((sum, s) => sum + s.completed, 0)}
              </Text>
              <Text style={themedStyles.summaryLabel}>Completed</Text>
            </View>
            <View style={themedStyles.summaryDivider} />
            <View style={themedStyles.summaryItem}>
              <Text style={themedStyles.summaryNum}>
                {subjects.reduce((sum, s) => sum + s.total, 0)}
              </Text>
              <Text style={themedStyles.summaryLabel}>Total Lessons</Text>
            </View>
            <View style={themedStyles.summaryDivider} />
            <View style={themedStyles.summaryItem}>
              <Text style={themedStyles.summaryNum}>
                {subjects.length > 0
                  ? Math.round(
                      subjects.reduce((sum, s) => sum + s.pct, 0) / subjects.length
                    )
                  : 0}
                %
              </Text>
              <Text style={themedStyles.summaryLabel}>Avg Progress</Text>
            </View>
          </View>
        </View>

        {/* Subject List */}
        {subjects.map((subj) => (
          <View key={subj.id} style={themedStyles.subjectBlock}>
            {/* Subject Card */}
            <TouchableOpacity
              style={[themedStyles.subjectCard, { borderLeftColor: subj.color }]}
              onPress={() => toggleExpand(subj.id)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={[themedStyles.subjectIcon, { backgroundColor: subj.bg_color }]}>
                <Text style={themedStyles.subjectIconText}>{subj.icon}</Text>
              </View>
              <View style={themedStyles.subjectInfo}>
                <Text style={themedStyles.subjectName}>{subj.name}</Text>
                <Text style={themedStyles.subjectProgress}>
                  {subj.completed}/{subj.total} lessons
                </Text>
              </View>
              <View style={themedStyles.subjectRight}>
                <ProgressRing progress={subj.pct} color={subj.color} size={44} strokeWidth={4} />
                <Text style={themedStyles.subjectPct}>{subj.pct}%</Text>
              </View>
              <Text style={[themedStyles.expandIcon, subj.expanded && themedStyles.expandIconActive]}>
                ▼
              </Text>
            </TouchableOpacity>

            {/* Expanded Chapter List */}
            {subj.expanded && (
              <View style={themedStyles.chapterList}>
                {subj.chapters.map((ch) => (
                  <TouchableOpacity
                    key={ch.id}
                    style={[
                      themedStyles.chapterItem,
                      ch.status === 'unlocked' && themedStyles.chapterItemUnlocked,
                      ch.status === 'locked' && themedStyles.chapterItemLocked,
                    ]}
                    activeOpacity={ch.status === 'locked' ? 1 : 0.7}
                    onPress={() => {
                      if (ch.status !== 'locked') onSubjectPress(subj.id);
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <View style={themedStyles.chapterStatusBadge}>
                      <Text style={themedStyles.chapterStatusText}>
                        {chapterStatusIcon(ch.status)}
                      </Text>
                    </View>
                    <View style={themedStyles.chapterInfo}>
                      <Text
                        style={[
                          themedStyles.chapterTitle,
                          ch.status === 'unlocked' && themedStyles.chapterTitleUnlocked,
                          ch.status === 'locked' && themedStyles.chapterTitleLocked,
                        ]}
                      >
                        Ch. {ch.chapterNumber}: {ch.title}
                      </Text>
                      <Text style={themedStyles.chapterMeta}>
                        {chapterStatusText(ch.status, ch.score)}
                      </Text>
                    </View>
                    {ch.status !== 'locked' && (
                      <Text style={themedStyles.chapterArrow}>→</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {subjects.length === 0 && (
          <View style={themedStyles.emptyState}>
            <Text style={themedStyles.emptyIcon}>📚</Text>
            <Text style={themedStyles.emptyTitle}>No subjects available</Text>
            <Text style={themedStyles.emptyDesc}>
              Import lessons via QR code or ask your teacher to add content.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav activeTab={activeTab} onNavPress={onNavPress} />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: { fontFamily: 'Fredoka_700Bold', fontSize: 28, color: colors.text },
    subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: colors.textLight, marginTop: 2 },
    summaryCard: {
      marginHorizontal: 20,
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 18,
      marginBottom: 20,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    summaryItem: { alignItems: 'center' },
    summaryNum: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: colors.coral },
    summaryLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: colors.textLight, marginTop: 2 },
    summaryDivider: { width: 1, height: 32, backgroundColor: colors.border },
    subjectBlock: { marginBottom: 12, paddingHorizontal: 20 },
    subjectCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderLeftWidth: 4,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    subjectIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    subjectIconText: { fontSize: 24 },
    subjectInfo: { flex: 1 },
    subjectName: { fontFamily: 'Fredoka_700Bold', fontSize: 17, color: colors.text },
    subjectProgress: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.textLight, marginTop: 2 },
    subjectRight: { alignItems: 'center', marginRight: 12 },
    subjectPct: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: colors.textLight, marginTop: 2 },
    expandIcon: { fontSize: 12, color: colors.textLight, transform: [{ rotate: '0deg' }] },
    expandIconActive: { transform: [{ rotate: '180deg' }] },
    chapterList: { marginTop: 8, paddingLeft: 24, gap: 8 },
    chapterItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    chapterItemUnlocked: { borderWidth: 1.5, borderColor: colors.coral },
    chapterItemLocked: { opacity: 0.5 },
    chapterStatusBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.border },
    chapterStatusText: { fontSize: 14 },
    chapterInfo: { flex: 1 },
    chapterTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 14, color: colors.text },
    chapterTitleUnlocked: { color: colors.coral },
    chapterTitleLocked: { color: colors.textLight },
    chapterMeta: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: colors.textLight, marginTop: 1 },
    chapterArrow: { fontSize: 16, color: colors.textLight },
    emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: colors.text, marginBottom: 8 },
    emptyDesc: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: colors.textLight, textAlign: 'center', lineHeight: 20 },
  });
