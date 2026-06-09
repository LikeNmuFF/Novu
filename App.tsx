import { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/services/database';
import type { User } from './src/services/auth';
import { getDb } from './src/services/database';
import { completeLesson, checkAndAwardBadges } from './src/services/progress';
import { addXp } from './src/services/auth';
import type { LessonView } from './src/screens/LessonViewerScreen';
import type { QuizQuestion } from './src/screens/QuizEngineScreen';

import SplashScreen from './src/screens/SplashScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SubjectDetailScreen from './src/screens/SubjectDetailScreen';
import LessonViewerScreen from './src/screens/LessonViewerScreen';
import QuizEngineScreen from './src/screens/QuizEngineScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import QRGeneratorScreen from './src/screens/QRGeneratorScreen';
import TeacherDashboardScreen from './src/screens/TeacherDashboardScreen';
import TeacherLessonCreatorScreen from './src/screens/TeacherLessonCreatorScreen';
import type { QRContentType } from './src/types/qr';

type FlowStep =
  | 'splash'
  | 'language'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'home'
  | 'subject'
  | 'lesson'
  | 'quiz'
  | 'qrcode'
  | 'generate'
  | 'teacher'
  | 'createlesson';

interface PendingLesson {
  subject: string;
  title: string;
  content: string;
  language: string;
  images: string[];
}

export default function App() {
  const [step, setStep] = useState<FlowStep>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [pendingLesson, setPendingLesson] = useState<PendingLesson | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonView | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch(console.error);
  }, []);

  const navigate = useCallback((to: FlowStep) => {
    setStep(to);
  }, []);

  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    setStep('home');
  }, []);

  const handleRegister = useCallback((newUser: User) => {
    setUser(newUser);
    setStep('home');
  }, []);

  const handleOpenLesson = useCallback(async (lessonId: number) => {
    const db = await getDb();
    const row = await db.getFirstAsync<{
      id: number; title: string; content: string; language: string;
      chapter_number: number; image_url: string | null;
      subject_id: number;
    }>('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    if (!row) return;

    const subj = await db.getFirstAsync<{ name: string; color: string }>(
      'SELECT name, color FROM subjects WHERE id = ?',
      [row.subject_id]
    );

    setCurrentLesson({
      id: row.id,
      subjectId: row.subject_id,
      subjectName: subj?.name ?? 'Subject',
      subjectColor: subj?.color ?? '#FF7E5F',
      title: row.title,
      content: row.content,
      language: row.language,
      chapterNumber: row.chapter_number,
      imageUrl: row.image_url ?? undefined,
    });
    setStep('lesson');
  }, []);

  const handleTakeQuiz = useCallback(async () => {
    if (!currentLesson) return;
    const db = await getDb();
    const rows = await db.getAllAsync<{
      question: string; options: string; correct_answer: number; explanation: string | null;
    }>(
      'SELECT question, options, correct_answer, explanation FROM quizzes WHERE lesson_id = ?',
      [currentLesson.id]
    );

    if (rows.length === 0) {
      setQuizQuestions(defaultQuestions(currentLesson.title));
    } else {
      setQuizQuestions(rows.map(r => ({
        question: r.question,
        options: JSON.parse(r.options),
        correctAnswer: r.correct_answer,
        explanation: r.explanation ?? undefined,
      })));
    }
    setStep('quiz');
  }, [currentLesson]);

  const handleQuizComplete = useCallback(async (passed: boolean, score: number, total: number) => {
    if (!user || !currentLesson) return;
    const pct = Math.round((score / total) * 100);
    await completeLesson(user.id, currentLesson.id, pct);
    await addXp(user.id, score * 10);
    const newBadges = await checkAndAwardBadges(user.id);
    if (newBadges.length > 0) {
      // badges earned - could show notification
    }
    setStep('subject');
  }, [user, currentLesson]);

  if (!dbReady) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onComplete={() => {}} />
      </>
    );
  }

  switch (step) {
    case 'splash':
      return (
        <>
          <StatusBar style="light" />
          <SplashScreen onComplete={() => navigate('language')} />
        </>
      );

    case 'language':
      return (
        <>
          <StatusBar style="dark" />
          <LanguageScreen onContinue={() => navigate('onboarding')} />
        </>
      );

    case 'onboarding':
      return (
        <>
          <StatusBar style="dark" />
          <OnboardingScreen onStart={() => navigate('login')} />
        </>
      );

    case 'login':
      return (
        <>
          <StatusBar style="dark" />
          <LoginScreen
            onLogin={handleLogin}
            onSwitchToRegister={() => navigate('register')}
          />
        </>
      );

    case 'register':
      return (
        <>
          <StatusBar style="dark" />
          <RegisterScreen
            onRegister={handleRegister}
            onSwitchToLogin={() => navigate('login')}
          />
        </>
      );

    case 'home':
      return user ? (
        <>
          <StatusBar style="dark" />
          <HomeScreen
            user={user}
            onSubjectPress={() => navigate('subject')}
            onScanPress={() => navigate('qrcode')}
          />
        </>
      ) : (
        <>{navigate('login')}</>
      );

    case 'subject':
      return user ? (
        <>
          <StatusBar style="light" />
          <SubjectDetailScreen
            userId={user.id}
            onBack={() => navigate('home')}
            onOpenLesson={handleOpenLesson}
          />
        </>
      ) : (
        <>{navigate('login')}</>
      );

    case 'lesson':
      return currentLesson ? (
        <>
          <StatusBar style="light" />
          <LessonViewerScreen
            lesson={currentLesson}
            onBack={() => navigate('subject')}
            onTakeQuiz={handleTakeQuiz}
          />
        </>
      ) : (
        <>{navigate('subject')}</>
      );

    case 'quiz':
      return currentLesson ? (
        <>
          <StatusBar style="light" />
          <QuizEngineScreen
            lessonTitle={currentLesson.title}
            questions={quizQuestions}
            onBack={() => navigate('lesson')}
            onComplete={handleQuizComplete}
          />
        </>
      ) : (
        <>{navigate('subject')}</>
      );

    case 'qrcode':
      return (
        <>
          <StatusBar style="light" />
          <QRScannerScreen
            onBack={() => navigate('home')}
            onImported={() => navigate('home')}
          />
        </>
      );

    case 'generate':
      return pendingLesson ? (
        <>
          <StatusBar style="dark" />
          <QRGeneratorScreen
            content={{ ...pendingLesson }}
            contentType={'lesson' as QRContentType}
            title={pendingLesson.title}
            onBack={() => navigate('teacher')}
            onShareAnother={() => navigate('createlesson')}
          />
        </>
      ) : (
        <>{navigate('teacher')}</>
      );

    case 'teacher':
      return (
        <>
          <StatusBar style="dark" />
          <TeacherDashboardScreen
            onBack={() => navigate('home')}
            onCreateLesson={() => navigate('createlesson')}
            onShareLesson={(lesson) => {
              setPendingLesson({
                subject: lesson.subject,
                title: lesson.title,
                content: lesson.title,
                language: lesson.language,
                images: [],
              });
              navigate('generate');
            }}
          />
        </>
      );

    case 'createlesson':
      return (
        <>
          <StatusBar style="dark" />
          <TeacherLessonCreatorScreen
            onBack={() => navigate('teacher')}
            onSave={(lesson) => {
              setPendingLesson(lesson);
              navigate('generate');
            }}
          />
        </>
      );
  }
}

function defaultQuestions(title: string): QuizQuestion[] {
  return [
    {
      question: `What is the main topic of "${title}"?`,
      options: ['The main idea discussed in the lesson', 'A different subject', 'An unrelated topic', 'None of the above'],
      correctAnswer: 0,
      explanation: 'The lesson covers this topic in detail.',
    },
    {
      question: 'What should you do after finishing a lesson?',
      options: ['Review the key points', 'Skip to the next one', 'Forget everything', 'Stop studying'],
      correctAnswer: 0,
      explanation: 'Reviewing helps reinforce what you learned.',
    },
    {
      question: 'How can you improve your understanding?',
      options: ['Practice regularly', 'Never study', 'Only read once', 'Ignore difficult parts'],
      correctAnswer: 0,
      explanation: 'Regular practice is key to learning.',
    },
    {
      question: 'What is the best way to use this app?',
      options: ['Study one chapter at a time', 'Skip around randomly', 'Only do quizzes', 'Never read the lessons'],
      correctAnswer: 0,
      explanation: 'Going chapter by chapter builds a strong foundation.',
    },
  ];
}
