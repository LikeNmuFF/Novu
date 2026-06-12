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
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const { colors } = theme;

  const styles = makeStyles(colors);

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
                placeholderTextColor={colors.textLight}
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
                  placeholderTextColor={colors.textLight}
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
                placeholderTextColor={colors.textLight}
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
                placeholderTextColor={colors.textLight}
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
                  Alert.alert(t('alerts.error'), t('alerts.codeRequired'));
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
                  Alert.alert(t('alerts.registrationFailed'), e.message);
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

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    illustration: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: `${colors.teal}1A`,
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
      borderColor: colors.teal,
      borderStyle: 'dashed',
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontFamily: 'Fredoka_700Bold',
      fontSize: 28,
      color: colors.text,
    },
    headerAccent: {
      color: colors.coral,
    },
    headerSub: {
      fontFamily: 'Nunito_400Regular',
      fontSize: 15,
      color: colors.textMuted,
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
      color: colors.text,
      marginBottom: 6,
    },
    hint: {
      fontFamily: 'Nunito_400Regular',
      fontSize: 12,
      color: colors.textLight,
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
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    roleCardSelected: {
      borderColor: colors.coral,
      backgroundColor: `${colors.coral}1A`,
    },
    roleIcon: {
      fontSize: 20,
    },
    roleText: {
      fontFamily: 'Fredoka_700Bold',
      fontSize: 15,
      color: colors.textMuted,
    },
    roleTextSelected: {
      color: colors.coral,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      fontFamily: 'Nunito_400Regular',
      fontSize: 16,
      color: colors.text,
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
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      alignItems: 'center',
    },
    gradeOptionSelected: {
      borderColor: colors.coral,
      backgroundColor: `${colors.coral}1A`,
    },
    gradeNum: {
      fontFamily: 'Fredoka_700Bold',
      fontSize: 24,
      color: colors.textMuted,
    },
    gradeNumSelected: {
      color: colors.coral,
    },
    gradeLabel: {
      fontFamily: 'Nunito_400Regular',
      fontSize: 12,
      color: colors.textLight,
    },
    gradeLabelSelected: {
      color: colors.coral,
      fontWeight: '700',
    },
    btnGroup: {
      paddingVertical: 16,
      gap: 12,
    },
    btnPrimary: {
      backgroundColor: colors.coral,
      paddingVertical: 16,
      borderRadius: 9999,
      alignItems: 'center',
      shadowColor: colors.coral,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 4,
    },
    btnPrimaryDisabled: {
      backgroundColor: `${colors.coral}99`,
      shadowOpacity: 0.1,
    },
    btnPrimaryText: {
      fontFamily: 'Fredoka_700Bold',
      fontSize: 18,
      color: colors.surface,
    },
    switchText: {
      fontFamily: 'Nunito_700Bold',
      fontSize: 14,
      color: colors.textLight,
      textAlign: 'center',
      paddingVertical: 10,
    },
  });
}
