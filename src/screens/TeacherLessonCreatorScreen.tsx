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

export default function TeacherLessonCreatorScreen({
  user,
  onBack,
  onSave,
}: {
  user: User;
  onBack: () => void;
  onSave: (lesson: {
    subject: string;
    title: string;
    content: string;
    language: string;
    images: string[];
  }) => void;
}) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('fil');
  const [gradeLevel, setGradeLevel] = useState(1);
  const [imageUrls, setImageUrls] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const db = await getDb();
    const rows = await db.getAllAsync<{ id: number; name: string; icon: string }>(
      'SELECT id, name, icon FROM subjects ORDER BY subject_order'
    );
    setSubjects(rows);
    if (rows.length > 0) setSubjectId(rows[0].id);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !subjectId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const db = await getDb();
      const images = imageUrls.split('\n').filter(Boolean);

      // Save lesson to database
      await db.runAsync(
        'INSERT INTO lessons (subject_id, title, content, language, chapter_number, grade_level, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [subjectId, title.trim(), content.trim(), language, 1, gradeLevel, user.id, Date.now()]
      );

      // Also save to QR for sharing
      const subjectName = subjects.find(s => s.id === subjectId)?.name || 'Unknown';
      onSave({
        subject: subjectName,
        title: title.trim(),
        content: content.trim(),
        language,
        images,
      });
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
          <Text style={styles.headerTitle}>Create Lesson</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Subject picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject *</Text>
            <View style={styles.subjectGrid}>
              {subjects.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.subjectCard,
                    subjectId === s.id && styles.subjectCardSelected,
                  ]}
                  onPress={() => setSubjectId(s.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.subjectIcon}>{s.icon}</Text>
                  <Text
                    style={[
                      styles.subjectName,
                      subjectId === s.id && styles.subjectNameSelected,
                    ]}
                  >
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Grade Level */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Grade Level</Text>
            <View style={styles.gradeRow}>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradeChip, gradeLevel === g && styles.gradeChipSelected]}
                  onPress={() => setGradeLevel(g)}
                >
                  <Text style={[styles.gradeChipText, gradeLevel === g && styles.gradeChipTextSelected]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Language</Text>
            <View style={styles.langRow}>
              {['fil', 'en', 'chav', 'yak', 'tau'].map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[
                    styles.langChip,
                    language === l && styles.langChipSelected,
                  ]}
                  onPress={() => setLanguage(l)}
                >
                  <Text
                    style={[
                      styles.langChipText,
                      language === l && styles.langChipTextSelected,
                    ]}
                  >
                    {l === 'fil' ? 'Filipino' : l === 'en' ? 'English' : l === 'chav' ? 'Chavacano' : l === 'yak' ? 'Yakan' : 'Tausug'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Lesson Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Addition with Regrouping"
              placeholderTextColor="#718096"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Content */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Lesson Content</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write your lesson content here..."
              placeholderTextColor="#718096"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Image URLs (optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Image URLs (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add image URLs, one per line"
              placeholderTextColor="#718096"
              multiline
              value={imageUrls}
              onChangeText={setImageUrls}
            />
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.btnSave, (saving || !title || !content || !subjectId) && styles.btnSaveDisabled]}
            onPress={handleSave}
            disabled={saving || !title || !content || !subjectId}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSaveText}>{saving ? 'Saving...' : 'Save & Generate QR'}</Text>
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
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F5E6D5',
  },
  subjectCardSelected: {
    borderColor: '#FF7E5F',
    backgroundColor: '#FFF0EB',
  },
  subjectIcon: {
    fontSize: 20,
  },
  subjectName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#4A5568',
  },
  subjectNameSelected: {
    color: '#E86548',
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F5E6D5',
  },
  langChipSelected: {
    borderColor: '#FF7E5F',
    backgroundColor: '#FFF0EB',
  },
  langChipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#4A5568',
  },
  langChipTextSelected: {
    color: '#E86548',
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gradeChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F5E6D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeChipSelected: {
    borderColor: '#FF7E5F',
    backgroundColor: '#FFF0EB',
  },
  gradeChipText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#4A5568',
  },
  gradeChipTextSelected: {
    color: '#E86548',
  },
  input: {
    backgroundColor: '#FEFCF9',
    borderWidth: 2,
    borderColor: '#F5E6D5',
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#1A535C',
  },
  textArea: {
    minHeight: 160,
    lineHeight: 22,
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
