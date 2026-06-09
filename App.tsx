import { useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { initDatabase, getDb } from './src/services/database';
import type { User } from './src/services/auth';
import { getLastSessionUser } from './src/services/auth';
import { completeLesson, checkAndAwardBadges } from './src/services/progress';
import { addXp } from './src/services/auth';
import type { LessonView } from './src/screens/LessonViewerScreen';
import type { QuizQuestion } from './src/screens/QuizEngineScreen';
import { QRContentType } from './src/types/qr';

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
  | 'createlesson'
  | 'rewards'
  | 'progress'
  | 'profile';

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
  const [selectedSubjectId, setSelectedSubjectId] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDbReady(true);
    }, 10000);

    initDatabase()
      .then(async () => {
        clearTimeout(timeout);
        const sessionUser = await getLastSessionUser();
        if (sessionUser) {
          setUser(sessionUser);
          setStep('home');
        }
        setDbReady(true);
      })
      .catch(async () => {
        clearTimeout(timeout);
        const sessionUser = await getLastSessionUser();
        if (sessionUser) {
          setUser(sessionUser);
          setStep('home');
        }
        setDbReady(true);
      });
  }, []);

  useEffect(() => {
    if (step === 'home' && !user) setStep('login');
  }, [step, user]);

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
      setQuizQuestions(rows.map(r => {
        let options: string[];
        try {
          options = JSON.parse(r.options);
        } catch {
          options = ['Option A', 'Option B', 'Option C', 'Option D'];
        }
        return {
          question: r.question,
          options,
          correctAnswer: r.correct_answer,
          explanation: r.explanation ?? undefined,
        };
      }));
    }
    setStep('quiz');
  }, [currentLesson]);

  const handleQuizComplete = useCallback(async (passed: boolean, score: number, total: number) => {
    if (!user || !currentLesson) return;
    const pct = Math.round((score / total) * 100);
    await completeLesson(user.id, currentLesson.id, pct);
    const xp = pct === 100 ? 100 : pct >= 75 ? 50 : 0;
    if (xp > 0) {
      await addXp(user.id, xp);
    }
    await checkAndAwardBadges(user.id);
    setStep('subject');
  }, [user, currentLesson]);

  const handleNavPress = useCallback((screen: string) => {
    switch (screen) {
      case 'home': setStep('home'); break;
      case 'learn': setStep('home'); break;
      case 'rewards': setStep('rewards'); break;
      case 'progress': setStep('progress'); break;
      case 'profile': setStep('profile'); break;
    }
  }, []);

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
      if (!user) return null;
      return (
        <>
          <StatusBar style="dark" />
          <HomeScreen
            user={user}
            onSubjectPress={(id: number) => {
              setSelectedSubjectId(id);
              navigate('subject');
            }}
            onScanPress={() => navigate('qrcode')}
            onNavPress={handleNavPress}
          />
        </>
      );

    case 'subject':
      if (!user) return null;
      return (
        <>
          <StatusBar style="light" />
          <SubjectDetailScreen
            subjectId={selectedSubjectId}
            userId={user.id}
            userGrade={user.grade}
            onBack={() => navigate('home')}
            onOpenLesson={handleOpenLesson}
          />
        </>
      );

    case 'lesson':
      if (!currentLesson) return null;
      return (
        <>
          <StatusBar style="light" />
          <LessonViewerScreen
            lesson={currentLesson}
            onBack={() => navigate('subject')}
            onTakeQuiz={handleTakeQuiz}
          />
        </>
      );

    case 'quiz':
      if (!currentLesson) return null;
      return (
        <>
          <StatusBar style="light" />
          <QuizEngineScreen
            lessonTitle={currentLesson.title}
            questions={quizQuestions}
            onBack={() => navigate('lesson')}
            onComplete={handleQuizComplete}
          />
        </>
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
      if (!pendingLesson) return null;
      return (
        <>
          <StatusBar style="dark" />
          <QRGeneratorScreen
            content={{ ...pendingLesson }}
            contentType={QRContentType.Lesson}
            title={pendingLesson.title}
            onBack={() => navigate('teacher')}
            onShareAnother={() => navigate('createlesson')}
          />
        </>
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
                content: lesson.content,
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

    case 'rewards':
    case 'progress':
    case 'profile':
      if (!user) return null;
      return (
        <>
          <StatusBar style="dark" />
          <HomeScreen
            user={user}
            onSubjectPress={(id: number) => {
              setSelectedSubjectId(id);
              navigate('subject');
            }}
            onScanPress={() => navigate('qrcode')}
            onNavPress={handleNavPress}
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
