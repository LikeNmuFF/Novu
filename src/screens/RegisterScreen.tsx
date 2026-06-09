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
import { registerUser } from '../services/auth';
import type { User } from '../services/auth';

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function RegisterScreen({
  onRegister,
  onSwitchToLogin,
}: {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(2);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
              Gumawa ng <Text style={styles.headerAccent}>Account</Text>
            </Text>
            <Text style={styles.headerSub}>Sumali sa LearnBasilan!</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Buong Pangalan</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan Dela Cruz"
                placeholderTextColor="#718096"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Grade Level</Text>
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Pumili ng username"
                placeholderTextColor="#718096"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Gumawa ng password"
                placeholderTextColor="#718096"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={async () => {
                if (!name.trim() || !username.trim() || !password.trim()) {
                  Alert.alert('Error', 'Please fill in all fields');
                  return;
                }
                setLoading(true);
                try {
                  const user = await registerUser(name.trim(), username.trim(), password, `Grade ${grade}`, 'student');
                  onRegister(user);
                } catch (e: any) {
                  Alert.alert('Registration Failed', e.message);
                } finally {
                  setLoading(false);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPrimaryText}>
                {loading ? 'Loading...' : 'Gumawa ng Account'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.7}>
              <Text style={styles.switchText}>May account na? Mag-login</Text>
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
