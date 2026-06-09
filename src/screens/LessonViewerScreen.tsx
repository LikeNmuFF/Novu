import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import * as Speech from 'expo-speech';

export interface LessonView {
  id: number;
  subjectId: number;
  subjectName: string;
  subjectColor: string;
  title: string;
  content: string;
  language: string;
  chapterNumber: number;
  imageUrl?: string;
}

export default function LessonViewerScreen({
  lesson,
  onBack,
  onTakeQuiz,
}: {
  lesson: LessonView;
  onBack: () => void;
  onTakeQuiz: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const toggleReadAloud = async () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    const langMap: Record<string, string> = {
      fil: 'fil-PH',
      eng: 'en-US',
      cbk: 'fil-PH',
      yka: 'fil-PH',
      tsg: 'fil-PH',
    };
    const lang = langMap[lesson.language] || 'fil-PH';
    setSpeaking(true);
    try {
      Speech.speak(lesson.content, {
        language: lang,
        rate: 0.85,
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    } catch {
      setSpeaking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.hero, { backgroundColor: lesson.subjectColor }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumb}>
            {lesson.subjectName} • Chapter {lesson.chapterNumber}
          </Text>
          <Text style={styles.heroTitle}>{lesson.title}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Image if available */}
          {lesson.imageUrl && (
            <Image
              source={{ uri: lesson.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {/* Read Aloud Button */}
          <TouchableOpacity
            style={[styles.readAloudBtn, speaking && styles.readAloudBtnActive]}
            onPress={toggleReadAloud}
            activeOpacity={0.7}
          >
            <Text style={styles.readAloudIcon}>{speaking ? '⏹' : '🔊'}</Text>
            <Text style={[styles.readAloudText, speaking && styles.readAloudTextActive]}>
              {speaking ? ' Stop Reading' : ' Read Aloud'}
            </Text>
          </TouchableOpacity>

          {/* Lesson Text */}
          <View style={styles.lessonText}>
            <Text style={styles.lessonContent}>{lesson.content}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Take Quiz CTA */}
      <View style={styles.bottomCta}>
        <TouchableOpacity
          style={styles.quizBtn}
          onPress={onTakeQuiz}
          activeOpacity={0.8}
        >
          <Text style={styles.quizBtnText}>Take Quiz →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  hero: {
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: { marginBottom: 12 },
  backText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  breadcrumb: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  heroTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 28, color: '#FFFFFF' },
  content: { padding: 20 },
  image: { width: '100%', height: 200, borderRadius: 18, marginBottom: 16 },
  readAloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F5E6D5',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  readAloudBtnActive: { backgroundColor: '#FFF0EB', borderColor: '#FF7E5F' },
  readAloudIcon: { fontSize: 18 },
  readAloudText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#1A535C', marginLeft: 6 },
  readAloudTextActive: { color: '#E86548' },
  lessonText: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonContent: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: '#1A535C',
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#FFF8F0',
  },
  quizBtn: {
    backgroundColor: '#FF7E5F',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 4,
  },
  quizBtnText: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#FFFFFF' },
});
