import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const PASS_THRESHOLD = 0.75;

export default function QuizEngineScreen({
  lessonTitle,
  questions,
  onBack,
  onComplete,
}: {
  lessonTitle: string;
  questions: QuizQuestion[];
  onBack: () => void;
  onComplete: (passed: boolean, score: number, total: number) => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (showResult) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showResult]);

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);

    timeoutRef.current = setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
      } else {
        const correct = newAnswers.filter((a, i) => a === questions[i].correctAnswer).length;
        const pct = correct / questions.length;
        setShowResult(true);
        setFinished(true);
      }
    }, 600);
  };

  const progress = ((currentQ + (selected !== null ? 1 : 0)) / questions.length) * 100;

  if (finished) {
    const correct = answers.filter((a, i) => a === questions[i].correctAnswer).length;
    const pct = correct / questions.length;
    const passed = pct >= PASS_THRESHOLD;

    return (
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.resultContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.resultEmoji}>{passed ? '🎉' : '💪'}</Text>
          <Text style={styles.resultTitle}>
            {passed ? 'Mahusay!' : 'Subukan Muli!'}
          </Text>
          <Text style={styles.resultSub}>
            {passed
              ? 'Mahusay ang iyong ginawa! Ipagpatuloy ang magandang aral!'
              : 'Huwag mawalan ng pag-asa! Maaari mong subukan muli.'}
          </Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNum}>{Math.round(pct * 100)}%</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>

          <Text style={styles.scoreDetail}>
            {correct} / {questions.length} correct
          </Text>
          <Text style={styles.scoreXp}>+{correct * 10} XP</Text>

          <View style={styles.resultActions}>
            {!passed && (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setCurrentQ(0);
                  setAnswers([]);
                  setSelected(null);
                  setShowResult(false);
                  setFinished(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Subukan Muli</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.doneBtn, passed && styles.doneBtnPrimary]}
              onPress={() => onComplete(passed, correct, questions.length)}
              activeOpacity={0.8}
            >
              <Text style={[styles.doneBtnText, passed && styles.doneBtnTextPrimary]}>
                {passed ? 'Next Lesson →' : 'Bumalik'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const question = questions[currentQ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backText}>← Exit</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz</Text>
        <Text style={styles.headerCount}>
          {currentQ + 1}/{questions.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Question */}
      <View style={styles.questionArea}>
        <Text style={styles.lessonLabel}>{lessonTitle}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsArea}>
        {question.options.map((opt, i) => {
          let optionStyle = styles.option;
          let textStyle = styles.optionText;

          if (selected !== null) {
            if (i === question.correctAnswer) {
              optionStyle = { ...optionStyle, ...styles.optionCorrect };
              textStyle = { ...textStyle, ...styles.optionTextCorrect };
            } else if (i === selected && i !== question.correctAnswer) {
              optionStyle = { ...optionStyle, ...styles.optionWrong };
              textStyle = { ...textStyle, ...styles.optionTextWrong };
            } else {
              optionStyle = { ...optionStyle, ...styles.optionDimmed };
              textStyle = { ...textStyle, ...styles.optionTextDimmed };
            }
          }

          return (
            <TouchableOpacity
              key={i}
              style={optionStyle}
              onPress={() => handleAnswer(i)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionLetter}>
                {String.fromCharCode(65 + i)}
              </Text>
              <Text style={textStyle}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  backText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#718096' },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 20, color: '#1A535C' },
  headerCount: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#718096' },
  progressBar: {
    height: 6,
    backgroundColor: '#F5E6D5',
    marginHorizontal: 20,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7E5F',
    borderRadius: 999,
  },
  questionArea: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  lessonLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#2EC4B6',
    marginBottom: 8,
  },
  questionText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: '#1A535C',
    lineHeight: 30,
  },
  optionsArea: {
    paddingHorizontal: 20,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F5E6D5',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  optionCorrect: { borderColor: '#6BCB77', backgroundColor: '#EDF8EF' },
  optionWrong: { borderColor: '#E86548', backgroundColor: '#FFEBE8' },
  optionDimmed: { opacity: 0.5 },
  optionLetter: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#718096',
    marginRight: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5E6D5',
    textAlign: 'center',
    lineHeight: 28,
    overflow: 'hidden',
  },
  optionText: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: '#1A535C', flex: 1 },
  optionTextCorrect: { color: '#2F855A' },
  optionTextWrong: { color: '#C53030' },
  optionTextDimmed: { color: '#A0AEC0' },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 32, color: '#1A535C', marginBottom: 8 },
  resultSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF8E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFD93D',
  },
  scoreNum: { fontFamily: 'Fredoka_700Bold', fontSize: 36, color: '#1A535C' },
  scoreLabel: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#718096' },
  scoreDetail: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#4A5568',
    marginBottom: 4,
  },
  scoreXp: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#FF7E5F',
    marginBottom: 32,
  },
  resultActions: { width: '100%', gap: 12 },
  retryBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5E6D5',
  },
  retryBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#1A535C' },
  doneBtn: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5E6D5',
  },
  doneBtnPrimary: { backgroundColor: '#FF7E5F', borderColor: '#FF7E5F' },
  doneBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#1A535C' },
  doneBtnTextPrimary: { color: '#FFFFFF' },
});
