import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { getDb } from '../services/database';
import { getChaptersForSubject, getSubjectProgress, ChapterStatus } from '../services/progress';
import { useTheme } from '../context/ThemeContext';

function ProgressRing({
  progress,
  color,
  size = 48,
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
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#FFFFFF"
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

export default function SubjectDetailScreen({
  subjectId,
  userId,
  userGrade,
  onBack,
  onOpenLesson,
}: {
  subjectId: number;
  userId: number;
  userGrade: string;
  onBack: () => void;
  onOpenLesson: (lessonId: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);
  const { theme } = useTheme();
  const { colors } = theme;

  const [subject, setSubject] = useState<{
    name: string; icon: string; color: string;
  } | null>(null);
  const [chapters, setChapters] = useState<Array<{
    id: number; title: string; chapterNumber: number;
    status: ChapterStatus; score: number | null;
  }>>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, averageScore: 0 });

  useEffect(() => {
    (async () => {
      const db = await getDb();
      const subj = await db.getFirstAsync<{ name: string; icon: string; color: string }>(
        'SELECT name, icon, color FROM subjects WHERE id = ?', [subjectId]
      );
      setSubject(subj);
      const gradeNum = userGrade ? parseInt(userGrade, 10) : undefined;
      const chs = await getChaptersForSubject(userId, subjectId, gradeNum);
      setChapters(chs);
      const p = await getSubjectProgress(userId, subjectId);
      setProgress(p);
    })();
  }, [userId, subjectId]);

  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  const statusMeta = (status: ChapterStatus, score: number | null) => {
    if (status === 'completed') {
      const xp = (score ?? 0) === 100 ? 100 : (score ?? 0) >= 75 ? 50 : 0;
      return `Score: ${score}% • +${xp} XP`;
    }
    if (status === 'unlocked') return 'Available • Start learning!';
    return 'Complete previous chapter first';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: subject?.color ?? '#FF7E5F', paddingTop: topInset + 24 }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>{subject?.name ?? 'Loading...'}</Text>
              <Text style={styles.heroSub}>Grade {userGrade}</Text>
              <View style={styles.heroStats}>
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>📊</Text>
                  <Text style={styles.statText}>{progress.completed}/{progress.total}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>🏆</Text>
                  <Text style={styles.statText}>{progress.averageScore}% avg</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroRing}>
              <ProgressRing progress={pct} color={subject?.color ?? '#FF7E5F'} size={72} strokeWidth={6} />
              <Text style={styles.heroPct}>{pct}%</Text>
            </View>
          </View>
          <Text style={styles.heroEmoji}>{subject?.icon ?? '📚'}</Text>
        </View>

        {/* Chapter List */}
        <View style={styles.chapterList}>
          {chapters.map((ch, index) => (
            <TouchableOpacity
              key={ch.id}
              style={[
                styles.chapterItem,
                { backgroundColor: colors.surface },
                ch.status === 'unlocked' && [styles.chapterItemUnlocked, { borderColor: colors.coral }],
                ch.status === 'locked' && styles.chapterItemLocked,
              ]}
              activeOpacity={ch.status === 'locked' ? 1 : 0.7}
              onPress={() => {
                if (ch.status !== 'locked') onOpenLesson(ch.id);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <View style={[styles.chapterNumber, { backgroundColor: colors.border }]}>
                <Text style={[styles.chapterNumberText, { color: colors.textMuted }]}>{index + 1}</Text>
              </View>
              <View style={[styles.chapterStatusBadge, { backgroundColor: colors.surface }]}>
                <Text style={styles.chapterStatusText}>
                  {ch.status === 'completed' ? '✅' : ch.status === 'unlocked' ? '📖' : '🔒'}
                </Text>
              </View>
              <View style={styles.chapterInfo}>
                <Text style={[
                  styles.chapterTitle,
                  { color: ch.status === 'unlocked' ? colors.coral : ch.status === 'locked' ? colors.textLight : colors.text },
                ]}>
                  {ch.title}
                </Text>
                <Text style={[styles.chapterMeta, { color: colors.textLight }]}>
                  {statusMeta(ch.status, ch.score)}
                </Text>
              </View>
              {ch.status !== 'locked' && (
                <Text style={[styles.chapterArrow, { color: colors.textLight }]}>→</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    marginBottom: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  backBtn: { marginBottom: 16 },
  backText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroText: { flex: 1 },
  heroTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 28, color: '#FFFFFF' },
  heroSub: { fontFamily: 'Nunito_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  heroStats: { flexDirection: 'row', gap: 20, marginTop: 14 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statIcon: { fontSize: 16 },
  statText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#FFFFFF' },
  heroRing: { alignItems: 'center', marginLeft: 16 },
  heroPct: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#FFFFFF', marginTop: 4 },
  heroEmoji: { position: 'absolute', right: 24, bottom: 24, fontSize: 56, opacity: 0.2 },
  chapterList: { paddingHorizontal: 20, gap: 10 },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chapterItemUnlocked: { borderWidth: 2 },
  chapterItemLocked: { opacity: 0.6 },
  chapterNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNumberText: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
  chapterStatusBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  chapterStatusText: { fontSize: 16 },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  chapterTitleUnlocked: { },
  chapterTitleLocked: { },
  chapterMeta: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  chapterArrow: { fontSize: 18 },
});
