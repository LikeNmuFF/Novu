import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { registerUser, registerTeacher } from '../services/auth';
import type { User } from '../services/auth';

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function RegisterScreen({
  onRegister,
  onSwitchToLogin,
}: {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(2);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [teacherCode, setTeacherCode] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationEmoji}>✏️</Text>
            <View style={styles.illustrationRing} />
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t('auth.register.title')}
            </Text>
            <Text style={styles.headerSub}>{t('auth.register.subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('auth.role.student')} / {t('auth.role.teacher')}</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'student' && styles.roleCardSelected]}
                  onPress={() => setRole('student')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roleIcon}>🎓</Text>
                  <Text style={[styles.roleText, role === 'student' && styles.roleTextSelected]}>{t('auth.role.student')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'teacher' && styles.roleCardSelected]}
                  onPress={() => setRole('teacher')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roleIcon}>👨‍🏫</Text>
                  <Text style={[styles.roleText, role === 'teacher' && styles.roleTextSelected]}>{t('auth.role.teacher')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('auth.register.fullName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.fullNamePlaceholder')}
                placeholderTextColor="#718096"
                value={name}
                onChangeText={setName}
              />
            </View>

            {role === 'student' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('auth.register.gradeLevel')}</Text>
                <View style={styles.gradeGrid}>
                  {GRADE_OPTIONS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.gradeOption,
                        grade === g && styles.gradeOptionSelected,
                      ]}
                      onPress={() => setGrade(g)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.gradeNum,
                          grade === g && styles.gradeNumSelected,
                        ]}
                      >
                        {g}
                      </Text>
                      <Text
                        style={[
                          styles.gradeLabel,
                          grade === g && styles.gradeLabelSelected,
                        ]}
                      >
                        Grade
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {role === 'teacher' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Teacher Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., TCH-A3B8X9"
                  placeholderTextColor="#718096"
                  value={teacherCode}
                  onChangeText={setTeacherCode}
                  autoCapitalize="characters"
                />
                <Text style={styles.hint}>Ask your admin for a teacher code</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('auth.register.username')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.usernamePlaceholder')}
                placeholderTextColor="#718096"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('auth.register.password')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.passwordPlaceholder')}
                placeholderTextColor="#718096"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]}
              onPress={async () => {
                if (!name.trim() || !username.trim() || !password.trim()) {
                  Alert.alert('Error', t('auth.register.errorEmpty'));
                  return;
                }
                if (role === 'teacher' && !teacherCode.trim()) {
                  Alert.alert('Error', 'Teacher code is required');
                  return;
                }
                setLoading(true);
                try {
                  let user: User;
                  if (role === 'teacher') {
                    user = await registerTeacher(name.trim(), username.trim(), password, teacherCode.trim().toUpperCase());
                  } else {
                    user = await registerUser(name.trim(), username.trim(), password, `Grade ${grade}`, 'student');
                  }
                  onRegister(user);
                } catch (e: any) {
                  Alert.alert('Registration Failed', e.message);
                } finally {
                  setLoading(false);
                }
              }}
              activeOpacity={loading ? 1 : 0.8}
              disabled={loading}
            >
              <Text style={styles.btnPrimaryText}>
                {loading ? 'Creating account...' : t('auth.register.registerButton')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.7}>
              <Text style={styles.switchText}>{t('auth.register.hasAccount')} {t('auth.register.login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 20,
  },
  illustration: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F8F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 12,
    position: 'relative',
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  illustrationRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 76,
    borderWidth: 3,
    borderColor: '#7DDAD0',
    borderStyle: 'dashed',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: '#1A535C',
  },
  headerAccent: {
    color: '#FF7E5F',
  },
  headerSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#4A5568',
    marginTop: 4,
  },
  form: {
    gap: 4,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 15,
    color: '#1A535C',
    marginBottom: 6,
  },
  hint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F5E6D5',
  },
  roleCardSelected: {
    borderColor: '#FF7E5F',
    backgroundColor: '#FFF0EB',
  },
  roleIcon: {
    fontSize: 20,
  },
  roleText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 15,
    color: '#4A5568',
  },
  roleTextSelected: {
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
  gradeGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  gradeOption: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F5E6D5',
    borderRadius: 12,
    alignItems: 'center',
  },
  gradeOptionSelected: {
    borderColor: '#FF7E5F',
    backgroundColor: '#FFF0EB',
  },
  gradeNum: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    color: '#4A5568',
  },
  gradeNumSelected: {
    color: '#E86548',
  },
  gradeLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: '#718096',
  },
  gradeLabelSelected: {
    color: '#E86548',
    fontWeight: '700',
  },
  btnGroup: {
    paddingVertical: 16,
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#FF7E5F',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 4,
  },
  btnPrimaryDisabled: {
    backgroundColor: '#FFB5A0',
    shadowOpacity: 0.1,
  },
  btnPrimaryText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  switchText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    paddingVertical: 10,
  },
});
