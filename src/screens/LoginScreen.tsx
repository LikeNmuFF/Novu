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
  Alert,
} from 'react-native';
import { loginUser } from '../services/auth';
import type { User } from '../services/auth';

export default function LoginScreen({
  onLogin,
  onSwitchToRegister,
}: {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.illustration}>
          <Text style={styles.illustrationEmoji}>🎒</Text>
          <View style={styles.illustrationRing} />
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Mag<Text style={styles.headerAccent}>login</Text>
          </Text>
          <Text style={styles.headerSub}>Ipagpatuloy ang iyong pag-aaral</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Ilagay ang iyong username"
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
              placeholder="Ilagay ang iyong password"
              placeholderTextColor="#718096"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.formRow}>
            <TouchableOpacity style={styles.checkboxRow}>
              <View style={styles.checkbox}>
                <Text style={styles.checkboxMark}>✓</Text>
              </View>
              <Text style={styles.checkboxLabel}>Tandaan ako</Text>
            </TouchableOpacity>
            <Text style={styles.forgotLink}>Nakalimutan ang password?</Text>
          </View>
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={async () => {
              if (!username.trim() || !password.trim()) {
                Alert.alert('Error', 'Please fill in all fields');
                return;
              }
              setLoading(true);
              try {
                const user = await loginUser(username.trim(), password);
                onLogin(user);
              } catch (e: any) {
                Alert.alert('Login Failed', e.message);
              } finally {
                setLoading(false);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? 'Loading...' : 'Mag-login'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={onSwitchToRegister} activeOpacity={0.8}>
            <Text style={styles.btnSecondaryText}>Walang account? Magrehistro</Text>
          </TouchableOpacity>
        </View>
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
    marginTop: 32,
    marginBottom: 16,
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
    marginBottom: 24,
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
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#FF7E5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#4A5568',
  },
  forgotLink: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#2EC4B6',
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
  btnSecondary: {
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5E6D5',
    backgroundColor: '#FFFFFF',
  },
  btnSecondaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#1A535C',
  },
});
