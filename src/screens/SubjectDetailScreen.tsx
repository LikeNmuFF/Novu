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
import { getChaptersForSubject, getSubjectProgress, ChapterStatus } from '../services/progress';

const SUBJECT_ID = 1;

export default function SubjectDetailScreen({
  userId,
  onBack,
  onOpenLesson,
}: {
  userId: number;
  onBack: () => void;
  onOpenLesson: (lessonId: number) => void;
}) {
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
        'SELECT name, icon, color FROM subjects WHERE id = ?', [SUBJECT_ID]
      );
      setSubject(subj);
      const chs = await getChaptersForSubject(userId, SUBJECT_ID);
      setChapters(chs);
      const p = await getSubjectProgress(userId, SUBJECT_ID);
      setProgress(p);
    })();
  }, [userId]);

  const statusMeta = (status: ChapterStatus, score: number | null) => {
    if (status === 'completed') return `Score: ${score}% • +${Math.round((score ?? 0) / 10) * 10} XP`;
    if (status === 'unlocked') return 'Available • Start learning!';
    return 'Complete previous chapter first';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: subject?.color ?? '#FF7E5F' }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>{subject?.name ?? 'Loading...'}</Text>
          <Text style={styles.heroSub}>Grade {userId} • Tagalog</Text>
          <View style={styles.heroStats}>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statText}>{progress.completed} / {progress.total}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statText}>{progress.averageScore}% avg</Text>
            </View>
          </View>
          <Text style={styles.heroEmoji}>{subject?.icon ?? '📚'}</Text>
        </View>

        {/* Chapter List */}
        <View style={styles.chapterList}>
          {chapters.map((ch) => (
            <TouchableOpacity
              key={ch.id}
              style={[
                styles.chapterItem,
                ch.status === 'unlocked' && styles.chapterItemUnlocked,
                ch.status === 'locked' && styles.chapterItemLocked,
              ]}
              activeOpacity={ch.status === 'locked' ? 1 : 0.7}
              onPress={() => {
                if (ch.status !== 'locked') onOpenLesson(ch.id);
              }}
            >
              <View style={styles.chapterStatus}>
                <Text style={styles.chapterStatusText}>
                  {ch.status === 'completed' ? '✅' : ch.status === 'unlocked' ? '📖' : '🔒'}
                </Text>
              </View>
              <View style={styles.chapterInfo}>
                <Text style={[
                  styles.chapterTitle,
                  ch.status === 'unlocked' && styles.chapterTitleUnlocked,
                  ch.status === 'locked' && styles.chapterTitleLocked,
                ]}>
                  {ch.title}
                </Text>
                <Text style={styles.chapterMeta}>
                  {statusMeta(ch.status, ch.score)}
                </Text>
              </View>
              <Text style={[styles.chapterArrow, ch.status === 'locked' && styles.chapterArrowLocked]}>
                →
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  hero: {
    marginBottom: 20,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  backBtn: { marginBottom: 16 },
  backText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  heroTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 32, color: '#FFFFFF' },
  heroSub: { fontFamily: 'Nunito_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  heroStats: { flexDirection: 'row', gap: 20, marginTop: 14 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statIcon: { fontSize: 16 },
  statText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#FFFFFF' },
  heroEmoji: { position: 'absolute', right: 24, bottom: 24, fontSize: 56, opacity: 0.25 },
  chapterList: { paddingHorizontal: 20, gap: 10 },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chapterItemUnlocked: { borderWidth: 2, borderColor: '#FFA68F' },
  chapterItemLocked: { opacity: 0.6 },
  chapterStatus: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  chapterStatusText: { fontSize: 16 },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#1A535C' },
  chapterTitleUnlocked: { color: '#E86548' },
  chapterTitleLocked: { color: '#718096' },
  chapterMeta: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096', marginTop: 2 },
  chapterArrow: { fontSize: 18, color: '#718096' },
  chapterArrowLocked: { opacity: 0.3 },
});
