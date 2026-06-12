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
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const { colors } = theme;

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
            <Text style={[styles.headerBack, { color: colors.textLight }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings.title')}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.language')}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langItem,
                  { borderBottomColor: colors.border },
                  currentLanguage === lang.code && { backgroundColor: colors.coralGlow },
                ]}
                onPress={() => onLanguageChange(lang.code)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.langName,
                  { color: colors.text },
                  currentLanguage === lang.code && { color: colors.coral },
                ]}>
                  {lang.name}
                </Text>
                {currentLanguage === lang.code && (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill={colors.coral}>
                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </Svg>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.appearance')}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {/* Dark Mode */}
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🌙</Text>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{t('settings.darkMode')}</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={onDarkModeToggle}
                trackColor={{ false: colors.border, true: colors.coralLight }}
                thumbColor={darkMode ? colors.coral : colors.textLight}
              />
            </View>

            {/* Text Size */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔤</Text>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{t('settings.textSize')}</Text>
              </View>
              <View style={styles.textSizeRow}>
                {[14, 16, 18, 20].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.textSizeBtn,
                      { backgroundColor: colors.border },
                      textSize === size && { backgroundColor: colors.coral },
                    ]}
                    onPress={() => onTextSizeChange(size)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={[
                      styles.textSizeBtnText,
                      { color: colors.textMuted },
                      textSize === size && { color: '#FFFFFF' },
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.accessibility')}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔊</Text>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{t('settings.readAloud')}</Text>
              </View>
              <Switch
                value={readAloud}
                onValueChange={onReadAloudToggle}
                trackColor={{ false: colors.border, true: colors.coralLight }}
                thumbColor={readAloud ? colors.coral : colors.textLight}
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.aboutApp')}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📱</Text>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{t('settings.version')}</Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.textLight }]}>1.0.1</Text>
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📖</Text>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{t('settings.appName')}</Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.textLight }]}>LearnBasilan</Text>
            </View>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetBtn, { backgroundColor: colors.coralGlow }]}
          onPress={handleReset}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.resetBtnText, { color: colors.coralDark }]}>🗑️ {t('settings.resetData')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerBack: { fontFamily: 'Nunito_700Bold', fontSize: 16 },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 20,
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
  },
  langFlag: { fontSize: 24, marginRight: 12 },
  langName: { fontFamily: 'Nunito_700Bold', fontSize: 15, flex: 1 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { fontSize: 20 },
  settingLabel: { fontFamily: 'Nunito_700Bold', fontSize: 15 },
  settingValue: { fontFamily: 'Nunito_400Regular', fontSize: 14 },
  textSizeRow: { flexDirection: 'row', gap: 6 },
  textSizeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  textSizeBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 11 },
  resetBtn: {
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  resetBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15 },
});
