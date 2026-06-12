import { useState, useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BackHandler } from 'react-native';
import { initDatabase, getDb } from './src/services/database';
import type { User } from './src/services/auth';
import { getLastSessionUser } from './src/services/auth';
import { completeLesson, checkAndAwardBadges } from './src/services/progress';
import { addXp } from './src/services/auth';
import type { LessonView } from './src/screens/LessonViewerScreen';
import type { QuizQuestion } from './src/screens/QuizEngineScreen';
import { QRContentType } from './src/types/qr';
import './src/i18n';
import i18n from './src/i18n';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import SplashScreen from './src/screens/SplashScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import SubjectDetailScreen from './src/screens/SubjectDetailScreen';
import LessonViewerScreen from './src/screens/LessonViewerScreen';
import QuizEngineScreen from './src/screens/QuizEngineScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import QRGeneratorScreen from './src/screens/QRGeneratorScreen';
import TeacherDashboardScreen from './src/screens/TeacherDashboardScreen';
import TeacherLessonCreatorScreen from './src/screens/TeacherLessonCreatorScreen';
import TeacherQuizCreatorScreen from './src/screens/TeacherQuizCreatorScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProgressReportScreen from './src/screens/ProgressReportScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type FlowStep =
  | 'splash'
  | 'language'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'home'
  | 'learn'
  | 'subject'
  | 'lesson'
  | 'quiz'
  | 'qrcode'
  | 'generate'
  | 'teacher'
  | 'createlesson'
  | 'createquiz'
  | 'rewards'
  | 'progress'
  | 'profile'
  | 'settings'
  | 'scanstudentprogress'
  | 'viewreport';

interface PendingLesson {
  subject: string;
  title: string;
  content: string;
  language: string;
  images: string[];
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { isDark, setDarkMode } = useTheme();
  const [step, setStep] = useState<FlowStep>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [pendingLesson, setPendingLesson] = useState<PendingLesson | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonView | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [dbReady, setDbReady] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('fil');
  const [textSize, setTextSize] = useState(16);
  const [readAloud, setReadAloud] = useState(true);
  const [scannedReport, setScannedReport] = useState<any>(null);
  const historyRef = useRef<FlowStep[]>([]);

  const isRootStep = useCallback((s: FlowStep) => {
    return s === 'splash' || s === 'language' || s === 'onboarding' || s === 'login' || s === 'home' || s === 'teacher';
  }, []);

  const goBack = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return false;
    const prev = history.pop()!;
    setStep(prev);
    return true;
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (isRootStep(step)) return false;
      return goBack();
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [step, isRootStep, goBack]);

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
          setStep(sessionUser.role === 'teacher' ? 'teacher' : 'home');
        }
        setDbReady(true);
      })
      .catch(async (error) => {
        clearTimeout(timeout);
        console.error('Database initialization failed:', error);
        setDbReady(true);
      });
  }, []);

  useEffect(() => {
    if (step === 'home' && !user) setStep('login');
  }, [step, user]);

  const navigate = useCallback((to: FlowStep) => {
    historyRef.current.push(step);
    setStep(to);
  }, [step]);

  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    historyRef.current = [];
    setStep(loggedInUser.role === 'teacher' ? 'teacher' : 'home');
  }, []);

  const handleRegister = useCallback((newUser: User) => {
    setUser(newUser);
    historyRef.current = [];
    setStep(newUser.role === 'teacher' ? 'teacher' : 'home');
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
      case 'learn': setStep('learn'); break;
      case 'rewards': setStep('rewards'); break;
      case 'progress': setStep('progress'); break;
      case 'profile': setStep('profile'); break;
    }
  }, []);

  if (!dbReady) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen onComplete={() => {}} />
      </SafeAreaProvider>
    );
  }

  switch (step) {
    case 'splash':
      return (
        <SafeAreaProvider>
          <StatusBar style="light" />
          <SplashScreen onComplete={() => navigate('language')} />
        </SafeAreaProvider>
      );

    case 'language':
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <LanguageScreen onContinue={(lang) => { setSelectedLanguage(lang); i18n.changeLanguage(lang); navigate('onboarding'); }} />
        </SafeAreaProvider>
      );

    case 'onboarding':
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <OnboardingScreen onStart={() => navigate('login')} />
        </SafeAreaProvider>
      );

    case 'login':
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <LoginScreen
            onLogin={handleLogin}
            onSwitchToRegister={() => navigate('register')}
          />
        </SafeAreaProvider>
      );

    case 'register':
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <RegisterScreen
            onRegister={handleRegister}
            onSwitchToLogin={() => navigate('login')}
          />
        </SafeAreaProvider>
      );

    case 'home':
      if (!user) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <HomeScreen
            user={user}
            onSubjectPress={(id: number) => {
              setSelectedSubjectId(id);
              navigate('subject');
            }}
            onScanPress={() => navigate('qrcode')}
            onNavPress={handleNavPress}
            activeTab="home"
          />
        </SafeAreaProvider>
      );

    case 'learn':
      if (!user) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <LearnScreen
            user={user}
            onSubjectPress={(id: number) => {
              setSelectedSubjectId(id);
              navigate('subject');
            }}
            onNavPress={handleNavPress}
            activeTab="learn"
          />
        </SafeAreaProvider>
      );

    case 'subject':
      if (!user) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style="light" />
          <SubjectDetailScreen
            subjectId={selectedSubjectId}
            userId={user.id}
            userGrade={user.grade}
            onBack={() => navigate('home')}
            onOpenLesson={handleOpenLesson}
          />
        </SafeAreaProvider>
      );

    case 'lesson':
      if (!currentLesson) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style="light" />
          <LessonViewerScreen
            lesson={currentLesson}
            onBack={() => navigate('subject')}
            onTakeQuiz={handleTakeQuiz}
          />
        </SafeAreaProvider>
      );

    case 'quiz':
      if (!currentLesson) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style="light" />
          <QuizEngineScreen
            lessonTitle={currentLesson.title}
            questions={quizQuestions}
            onBack={() => navigate('lesson')}
            onComplete={handleQuizComplete}
          />
        </SafeAreaProvider>
      );

    case 'qrcode':
      return (
        <SafeAreaProvider>
          <StatusBar style="light" />
          <QRScannerScreen
            onBack={() => navigate('home')}
            onImported={(report) => {
              if (report) {
                setScannedReport(report);
                navigate('viewreport');
              } else {
                navigate('home');
              }
            }}
          />
        </SafeAreaProvider>
      );

    case 'scanstudentprogress':
      return (
        <SafeAreaProvider>
          <StatusBar style="light" />
          <QRScannerScreen
            onBack={() => navigate('teacher')}
            onImported={(report) => {
              if (report) {
                setScannedReport(report);
                navigate('viewreport');
              } else {
                navigate('teacher');
              }
            }}
          />
        </SafeAreaProvider>
      );

    case 'generate':
      if (!pendingLesson) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <QRGeneratorScreen
            content={{ ...pendingLesson }}
            contentType={QRContentType.Lesson}
            title={pendingLesson.title}
            onBack={() => navigate('teacher')}
            onShareAnother={() => navigate('createlesson')}
          />
        </SafeAreaProvider>
      );

    case 'teacher':
      if (!user) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <TeacherDashboardScreen
            user={user}
            onBack={() => navigate('home')}
            onCreateLesson={() => navigate('createlesson')}
            onCreateQuiz={() => navigate('createquiz')}
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
            onScanProgress={() => navigate('scanstudentprogress')}
            onViewReport={(report) => {
              setScannedReport(report);
              navigate('viewreport');
            }}
          />
        </SafeAreaProvider>
      );

    case 'createlesson':
      if (!user) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <TeacherLessonCreatorScreen
            user={user}
            onBack={() => navigate('teacher')}
            onSave={(lesson) => {
              setPendingLesson(lesson);
              navigate('generate');
            }}
          />
        </SafeAreaProvider>
      );

    case 'createquiz':
      if (!user) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <TeacherQuizCreatorScreen
            user={user}
            onBack={() => navigate('teacher')}
            onSaved={() => navigate('teacher')}
          />
        </SafeAreaProvider>
      );

    case 'viewreport':
      if (!user || !scannedReport) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <ProgressReportScreen
            report={scannedReport}
            user={user}
            onBack={() => {
              setScannedReport(null);
              goBack();
            }}
          />
        </SafeAreaProvider>
      );

    case 'rewards':
      if (!user) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <RewardsScreen user={user} onNavPress={handleNavPress} activeTab="rewards" />
        </SafeAreaProvider>
      );

    case 'progress':
      if (!user) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <ProgressScreen user={user} onNavPress={handleNavPress} activeTab="progress" />
        </SafeAreaProvider>
      );

    case 'profile':
      if (!user) return null;
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <ProfileScreen
            user={user}
            onLogout={() => { setUser(null); historyRef.current = []; navigate('login'); }}
            onSettings={() => navigate('settings')}
            onUserUpdate={(updated) => setUser(updated)}
            onNavPress={handleNavPress}
            activeTab="profile"
          />
        </SafeAreaProvider>
      );

    case 'settings':
      return (
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <SettingsScreen
            onBack={() => navigate('profile')}
            currentLanguage={selectedLanguage}
            onLanguageChange={(lang) => { setSelectedLanguage(lang); i18n.changeLanguage(lang); }}
            darkMode={isDark}
            onDarkModeToggle={() => setDarkMode(!isDark)}
            textSize={textSize}
            onTextSizeChange={setTextSize}
            readAloud={readAloud}
            onReadAloudToggle={() => setReadAloud(!readAloud)}
            onResetData={() => {
              setUser(null);
              historyRef.current = [];
              setSelectedLanguage('fil');
              setDarkMode(false);
              setTextSize(16);
              setReadAloud(true);
              navigate('splash');
            }}
          />
        </SafeAreaProvider>
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
