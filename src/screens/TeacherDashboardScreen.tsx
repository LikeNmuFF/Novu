import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface CreatedLesson {
  id: string;
  subject: string;
  title: string;
  content: string;
  language: string;
  createdAt: number;
}

export default function TeacherDashboardScreen({
  onBack,
  onCreateLesson,
  onShareLesson,
}: {
  onBack: () => void;
  onCreateLesson: () => void;
  onShareLesson: (lesson: CreatedLesson) => void;
}) {
  const [lessons] = useState<CreatedLesson[]>([
    {
      id: '1',
      subject: 'Mathematics',
      title: 'Addition with Regrouping',
      content: 'Ang addition ay ang proseso ng pagdaragdag ng dalawa o higit pang numero. Kapag may regrouping, isinasama ang sobra sa susunod na column.',
      language: 'Filipino',
      createdAt: Date.now() - 3600000,
    },
    {
      id: '2',
      subject: 'Science',
      title: 'Parts of a Plant',
      content: 'A plant has roots, stem, leaves, flowers, and fruit. Each part has a specific function that helps the plant grow and survive.',
      language: 'English',
      createdAt: Date.now() - 7200000,
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.headerBack}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teacher Dashboard</Text>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>T</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{lessons.length}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createCard} onPress={onCreateLesson} activeOpacity={0.8}>
          <Text style={styles.createIcon}>➕</Text>
          <View style={styles.createContent}>
            <Text style={styles.createTitle}>Create New Lesson</Text>
            <Text style={styles.createDesc}>Write a lesson and generate a QR code to share</Text>
          </View>
          <Text style={styles.createArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createCard} activeOpacity={0.8}>
          <Text style={styles.createIcon}>❓</Text>
          <View style={styles.createContent}>
            <Text style={styles.createTitle}>Create New Quiz</Text>
            <Text style={styles.createDesc}>Make a quiz and distribute it via QR</Text>
          </View>
          <Text style={styles.createArrow}>→</Text>
        </TouchableOpacity>

        {/* Existing Lessons */}
        <Text style={styles.sectionTitle}>Your Lessons</Text>

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
    marginBottom: 24,
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
