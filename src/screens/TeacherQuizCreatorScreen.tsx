import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { getDb } from '../services/database';
import type { User } from '../services/auth';

interface Subject {
  id: number;
  name: string;
  icon: string;
}

interface Lesson {
  id: number;
  title: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function TeacherQuizCreatorScreen({
  user,
  onBack,
  onSaved,
}: {
  user: User;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) loadLessons();
  }, [subjectId]);

  const loadSubjects = async () => {
    const db = await getDb();
    const rows = await db.getAllAsync<{ id: number; name: string; icon: string }>(
      'SELECT id, name, icon FROM subjects ORDER BY subject_order'
    );
    setSubjects(rows);
    if (rows.length > 0) setSubjectId(rows[0].id);
  };

  const loadLessons = async () => {
    if (!subjectId) return;
    const db = await getDb();
    const rows = await db.getAllAsync<{ id: number; title: string }>(
      'SELECT id, title FROM lessons WHERE subject_id = ? AND created_by = ? ORDER BY chapter_number',
      [subjectId, user.id]
    );
    setLessons(rows);
    setLessonId(rows.length > 0 ? rows[0].id : null);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!lessonId) {
      Alert.alert('Error', 'Please select a lesson');
      return;
    }

    const validQuestions = questions.filter(q => q.question.trim() && q.options.every(o => o.trim()));
    if (validQuestions.length === 0) {
      Alert.alert('Error', 'Please add at least one complete question');
      return;
    }

    setSaving(true);
    try {
      const db = await getDb();
      for (const q of validQuestions) {
        await db.runAsync(
          'INSERT INTO quizzes (lesson_id, question, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?)',
          [lessonId, q.question.trim(), JSON.stringify(q.options), q.correctAnswer, q.explanation.trim()]
        );
      }
      Alert.alert('Success', `${validQuestions.length} quiz question(s) saved!`, [
        { text: 'OK', onPress: onSaved }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.headerBack}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Quiz</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Subject picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject *</Text>
            <View style={styles.pickerRow}>
              {subjects.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.pickerChip, subjectId === s.id && styles.pickerChipSelected]}
                  onPress={() => setSubjectId(s.id)}
                >
                  <Text style={styles.pickerIcon}>{s.icon}</Text>
                  <Text style={[styles.pickerText, subjectId === s.id && styles.pickerTextSelected]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Lesson picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Lesson *</Text>
            {lessons.length === 0 ? (
              <Text style={styles.emptyText}>No lessons found. Create a lesson first.</Text>
            ) : (
              <View style={styles.pickerRow}>
                {lessons.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.pickerChip, lessonId === l.id && styles.pickerChipSelected]}
                    onPress={() => setLessonId(l.id)}
                  >
                    <Text style={[styles.pickerText, lessonId === l.id && styles.pickerTextSelected]}>
                      {l.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Questions */}
          <View style={styles.formGroup}>
            <View style={styles.questionHeader}>
              <Text style={styles.label}>Questions ({questions.length})</Text>
              <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
                <Text style={styles.addBtnText}>+ Add Question</Text>
              </TouchableOpacity>
            </View>

            {questions.map((q, qi) => (
              <View key={qi} style={styles.questionCard}>
                <View style={styles.questionTop}>
                  <Text style={styles.questionNum}>Q{qi + 1}</Text>
                  {questions.length > 1 && (
                    <TouchableOpacity onPress={() => removeQuestion(qi)}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your question"
                  placeholderTextColor="#718096"
                  value={q.question}
                  onChangeText={(v) => updateQuestion(qi, 'question', v)}
                />

                <Text style={styles.optionLabel}>Choices (tap the correct one):</Text>
                {q.options.map((opt, oi) => (
                  <TouchableOpacity
                    key={oi}
                    style={[styles.optionRow, q.correctAnswer === oi && styles.optionRowCorrect]}
                    onPress={() => updateQuestion(qi, 'correctAnswer', oi)}
                  >
                    <Text style={[styles.optionLetter, q.correctAnswer === oi && styles.optionLetterCorrect]}>
                      {String.fromCharCode(65 + oi)}
                    </Text>
                    <TextInput
                      style={styles.optionInput}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      placeholderTextColor="#718096"
                      value={opt}
                      onChangeText={(v) => updateOption(qi, oi, v)}
                    />
                  </TouchableOpacity>
                ))}

                <TextInput
                  style={[styles.input, styles.explanationInput]}
                  placeholder="Explanation (optional)"
                  placeholderTextColor="#718096"
                  value={q.explanation}
                  onChangeText={(v) => updateQuestion(qi, 'explanation', v)}
                />
              </View>
            ))}
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.btnSave, (saving || !lessonId) && styles.btnSaveDisabled]}
            onPress={handleSave}
            disabled={saving || !lessonId}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSaveText}>{saving ? 'Saving...' : 'Save Quiz'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 15,
    color: '#1A535C',
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F5E6D5',
  },
  pickerChipSelected: {
    borderColor: '#FF7E5F',
    backgroundColor: '#FFF0EB',
  },
  pickerIcon: {
    fontSize: 16,
  },
  pickerText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#4A5568',
  },
  pickerTextSelected: {
    color: '#E86548',
  },
  emptyText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2EC4B6',
    borderRadius: 8,
  },
  addBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F5E6D5',
  },
  questionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNum: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#FF7E5F',
  },
  removeBtn: {
    fontSize: 18,
    color: '#E53E3E',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FEFCF9',
    borderWidth: 2,
    borderColor: '#F5E6D5',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#1A535C',
    marginBottom: 10,
  },
  optionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#718096',
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F5E6D5',
  },
  optionRowCorrect: {
    borderColor: '#6BCB77',
    backgroundColor: '#E0F5E6',
  },
  optionLetter: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    color: '#718096',
    width: 24,
    textAlign: 'center',
  },
  optionLetterCorrect: {
    color: '#2D8A4E',
  },
  optionInput: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#1A535C',
  },
  explanationInput: {
    minHeight: 50,
  },
  btnSave: {
    backgroundColor: '#FF7E5F',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 4,
  },
  btnSaveDisabled: {
    opacity: 0.5,
  },
  btnSaveText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
