import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDb } from '../services/database';
import { generateTeacherCode } from '../services/auth';
import type { User } from '../services/auth';

interface CreatedLesson {
  id: number;
  subject: string;
  title: string;
  content: string;
  language: string;
  grade_level: number;
  createdAt: number;
}

export default function TeacherDashboardScreen({
  user,
  onBack,
  onCreateLesson,
  onCreateQuiz,
  onShareLesson,
}: {
  user: User;
  onBack: () => void;
  onCreateLesson: () => void;
  onCreateQuiz: () => void;
  onShareLesson: (lesson: CreatedLesson) => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);
  const [lessons, setLessons] = useState<CreatedLesson[]>([]);
  const [quizCount, setQuizCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const db = await getDb();

    // Load lessons created by this teacher
    const lessonRows = await db.getAllAsync<{
      id: number; title: string; content: string; language: string;
      grade_level: number; created_at: number; subject_id: number;
      subject_name: string;
    }>(
      'SELECT l.id, l.title, l.content, l.language, l.grade_level, l.created_at, l.subject_id, s.name as subject_name FROM lessons l LEFT JOIN subjects s ON l.subject_id = s.id WHERE l.created_by = ? ORDER BY l.created_at DESC',
      [user.id]
    );

    setLessons(lessonRows.map(r => ({
      id: r.id,
      subject: r.subject_name || 'Unknown',
      title: r.title,
      content: r.content,
      language: r.language,
      grade_level: r.grade_level,
      createdAt: r.created_at,
    })));

    // Count quizzes for teacher's lessons
    const quizResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM quizzes WHERE lesson_id IN (SELECT id FROM lessons WHERE created_by = ?)',
      [user.id]
    );
    setQuizCount(quizResult?.count || 0);

    // Count students
    const studentResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['student']
    );
    setStudentCount(studentResult?.count || 0);
  };

  const handleGenerateCode = async () => {
    setLoadingCode(true);
    try {
      const code = await generateTeacherCode(user.id);
      setGeneratedCode(code);
      Alert.alert(t('alerts.teacherCodeGenerated'), t('alerts.shareCode', { code }));
    } catch (e: any) {
      Alert.alert(t('alerts.error'), e.message);
    } finally {
      setLoadingCode(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.headerBack}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('teacher.dashboard.title')}</Text>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{lessons.length}</Text>
            <Text style={styles.statLabel}>{t('subjects.title')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{quizCount}</Text>
            <Text style={styles.statLabel}>{t('quiz.title')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{studentCount}</Text>
            <Text style={styles.statLabel}>{t('teacher.dashboard.totalStudents')}</Text>
          </View>
        </View>

        {/* Generate Teacher Code */}
        <TouchableOpacity style={styles.codeCard} onPress={handleGenerateCode} activeOpacity={0.8}>
          <Text style={styles.codeIcon}>🔑</Text>
          <View style={styles.codeContent}>
            <Text style={styles.codeTitle}>Generate Teacher Code</Text>
            <Text style={styles.codeDesc}>Create a code for new teacher registration</Text>
          </View>
          <Text style={styles.codeArrow}>→</Text>
        </TouchableOpacity>

        {generatedCode ? (
          <View style={styles.codeDisplay}>
            <Text style={styles.codeLabel}>Latest Code:</Text>
            <Text style={styles.codeValue}>{generatedCode}</Text>
            <Text style={styles.codeHint}>Expires in 7 days • One-time use</Text>
          </View>
        ) : null}

        {/* Create Buttons */}
        <TouchableOpacity style={styles.createCard} onPress={onCreateLesson} activeOpacity={0.8}>
          <Text style={styles.createIcon}>➕</Text>
          <View style={styles.createContent}>
            <Text style={styles.createTitle}>{t('teacher.contentCreator.createLesson')}</Text>
            <Text style={styles.createDesc}>Write a lesson and generate a QR code to share</Text>
          </View>
          <Text style={styles.createArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createCard} onPress={onCreateQuiz} activeOpacity={0.8}>
          <Text style={styles.createIcon}>❓</Text>
          <View style={styles.createContent}>
            <Text style={styles.createTitle}>{t('teacher.contentCreator.createQuiz')}</Text>
            <Text style={styles.createDesc}>Make a quiz and distribute it via QR</Text>
          </View>
          <Text style={styles.createArrow}>→</Text>
        </TouchableOpacity>

        {/* Existing Lessons */}
        <Text style={styles.sectionTitle}>{t('teacher.dashboard.lessonsCreated')}</Text>

        {lessons.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyText}>No lessons yet</Text>
            <Text style={styles.emptyDesc}>Create your first lesson to share with students</Text>
          </View>
        ) : (
          lessons.map((lesson) => (
            <View key={lesson.id} style={styles.lessonCard}>
              <View style={styles.lessonInfo}>
                <View style={styles.lessonSubject}>
                  <Text style={styles.lessonSubjectText}>{lesson.subject}</Text>
                  <Text style={styles.lessonLang}>{lesson.language}</Text>
                  <Text style={styles.lessonGrade}>Grade {lesson.grade_level}</Text>
                </View>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
              </View>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => onShareLesson(lesson)}
                activeOpacity={0.7}
              >
                <Text style={styles.shareBtnText}>Share QR</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
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
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2EC4B6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
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
  statNum: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: '#FF7E5F',
  },
  statLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F6',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    gap: 14,
    borderWidth: 2,
    borderColor: '#7DDAD0',
  },
  codeIcon: {
    fontSize: 28,
    width: 44,
    textAlign: 'center',
  },
  codeContent: {
    flex: 1,
  },
  codeTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#1A535C',
  },
  codeDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#4A5568',
    marginTop: 2,
  },
  codeArrow: {
    fontSize: 20,
    color: '#1A535C',
  },
  codeDisplay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7DDAD0',
  },
  codeLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#718096',
  },
  codeValue: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    color: '#1A535C',
    marginVertical: 4,
    letterSpacing: 2,
  },
  codeHint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: '#718096',
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    gap: 14,
    borderWidth: 2,
    borderColor: '#F5E6D5',
    borderStyle: 'dashed',
  },
  createIcon: {
    fontSize: 28,
    width: 44,
    textAlign: 'center',
  },
  createContent: {
    flex: 1,
  },
  createTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#1A535C',
  },
  createDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  createArrow: {
    fontSize: 20,
    color: '#718096',
  },
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: '#1A535C',
    marginTop: 16,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#4A5568',
  },
  emptyDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  lessonInfo: {
    flex: 1,
  },
  lessonSubject: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  lessonSubjectText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#FF7E5F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonLang: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#718096',
  },
  lessonGrade: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: '#2EC4B6',
    backgroundColor: '#E0F5F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lessonTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#1A535C',
    marginTop: 2,
  },
  shareBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF0EB',
    borderRadius: 999,
  },
  shareBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#E86548',
  },
});
