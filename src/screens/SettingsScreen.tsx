import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
  { code: 'chavacano', name: 'Chavacano', flag: '🇵🇭' },
  { code: 'yakan', name: 'Yakan', flag: '🇵🇭' },
  { code: 'tausug', name: 'Tausug', flag: '🇵🇭' },
];

export default function SettingsScreen({
  onBack,
  currentLanguage,
  onLanguageChange,
  darkMode,
  onDarkModeToggle,
  textSize,
  onTextSizeChange,
  readAloud,
  onReadAloudToggle,
  onResetData,
}: {
  onBack: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  textSize: number;
  onTextSizeChange: (size: number) => void;
  readAloud: boolean;
  onReadAloudToggle: () => void;
  onResetData: () => void;
}) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your progress, badges, and imported content. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onResetData },
      ]
    );
  };

  const textSizeLabels: Record<number, string> = { 14: 'Small', 16: 'Medium', 18: 'Large', 20: 'X-Large' };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        pointerEvents="box-none"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset }]}>
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.headerBack}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.card}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langItem,
                  currentLanguage === lang.code && styles.langItemActive,
                ]}
                onPress={() => onLanguageChange(lang.code)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.langName,
                  currentLanguage === lang.code && styles.langNameActive,
                ]}>
                  {lang.name}
                </Text>
                {currentLanguage === lang.code && (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FF7E5F">
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </Svg>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            {/* Dark Mode */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🌙</Text>
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={onDarkModeToggle}
                trackColor={{ false: '#F5E6D5', true: '#FFA68F' }}
                thumbColor={darkMode ? '#FF7E5F' : '#718096'}
              />
            </View>

            {/* Text Size */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔤</Text>
                <Text style={styles.settingLabel}>Text Size</Text>
              </View>
              <View style={styles.textSizeRow}>
                {[14, 16, 18, 20].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.textSizeBtn,
                      textSize === size && styles.textSizeBtnActive,
                    ]}
                    onPress={() => onTextSizeChange(size)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={[
                      styles.textSizeBtnText,
                      textSize === size && styles.textSizeBtnTextActive,
                    ]}>
                      {textSizeLabels[size]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Accessibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔊</Text>
                <Text style={styles.settingLabel}>Read Aloud</Text>
              </View>
              <Switch
                value={readAloud}
                onValueChange={onReadAloudToggle}
                trackColor={{ false: '#F5E6D5', true: '#FFA68F' }}
                thumbColor={readAloud ? '#FF7E5F' : '#718096'}
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📱</Text>
                <Text style={styles.settingLabel}>Version</Text>
              </View>
              <Text style={styles.settingValue}>1.0.1</Text>
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📖</Text>
                <Text style={styles.settingLabel}>App Name</Text>
              </View>
              <Text style={styles.settingValue}>LearnBasilan</Text>
            </View>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleReset}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.resetBtnText}>🗑️ Reset All Data</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 12,
  },
  headerBack: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#718096' },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#1A535C' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#1A535C',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E6D5',
  },
  langItemActive: { backgroundColor: '#FFF0EB' },
  langFlag: { fontSize: 24, marginRight: 12 },
  langName: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#1A535C', flex: 1 },
  langNameActive: { color: '#FF7E5F' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E6D5',
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { fontSize: 20 },
  settingLabel: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#1A535C' },
  settingValue: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#718096' },
  textSizeRow: { flexDirection: 'row', gap: 6 },
  textSizeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5E6D5',
  },
  textSizeBtnActive: { backgroundColor: '#FF7E5F' },
  textSizeBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: '#4A5568' },
  textSizeBtnTextActive: { color: '#FFFFFF' },
  resetBtn: {
    marginHorizontal: 20,
    backgroundColor: '#FFF0EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  resetBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#E86548' },
});
