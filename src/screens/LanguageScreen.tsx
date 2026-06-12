import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface Language {
  id: string;
  name: string;
  native: string;
  flag: string;
}

const languages: Language[] = [
  { id: 'fil', name: 'Filipino', native: 'Tagalog', flag: '🇵🇭' },
  { id: 'chav', name: 'Chavacano', native: 'Chavacano de Zamboanga', flag: '🇪🇸' },
  { id: 'yak', name: 'Yakan', native: 'Bissa Yakan', flag: '🏝️' },
  { id: 'tau', name: 'Tausug', native: 'Bahasa Sūg', flag: '🕌' },
  { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
];

export default function LanguageScreen({ onContinue }: { onContinue: (lang: string) => void }) {
  const [selected, setSelected] = useState('fil');
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);
  const { theme } = useTheme();
  const { colors } = theme;

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <Text style={styles.headerTitle}>
          Pumili ng <Text style={styles.headerAccent}>Wika</Text>
        </Text>
        <Text style={styles.headerSub}>Choose your learning language</Text>
      </View>

      <View style={styles.list}>
        {languages.map((lang) => {
          const isSelected = selected === lang.id;
          return (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.langCard,
                isSelected && styles.langCardSelected,
              ]}
              onPress={() => setSelected(lang.id)}
              activeOpacity={0.7}
            >
              <View style={styles.flagWrap}>
                <Text style={styles.flag}>{lang.flag}</Text>
              </View>
              <View style={styles.langInfo}>
                <Text style={styles.langName}>{lang.name}</Text>
                <Text style={styles.langNative}>{lang.native}</Text>
              </View>
              <View style={[styles.check, isSelected && styles.checkSelected]}>
                {isSelected && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.btnGroup}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => onContinue(selected)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>Magpatuloy</Text>
        </TouchableOpacity>
      </View>
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
    header: {
      paddingVertical: 24,
      alignItems: 'center',
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
      marginTop: 6,
    },
    list: {
      flex: 1,
      gap: 12,
      justifyContent: 'center',
    },
    langCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 18,
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    langCardSelected: {
      borderColor: colors.coral,
      backgroundColor: `${colors.coral}1A`,
      shadowColor: colors.coral,
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 4,
    },
    flagWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    flag: {
      fontSize: 28,
    },
    langInfo: {
      flex: 1,
    },
    langName: {
      fontFamily: 'Fredoka_700Bold',
      fontSize: 18,
      color: colors.text,
    },
    langNative: {
      fontFamily: 'Nunito_400Regular',
      fontSize: 14,
      color: colors.textLight,
    },
    check: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkSelected: {
      backgroundColor: colors.coral,
      borderColor: colors.coral,
    },
    checkMark: {
      color: colors.surface,
      fontSize: 14,
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
    btnPrimaryText: {
      fontFamily: 'Fredoka_700Bold',
      fontSize: 18,
      color: colors.surface,
    },
  });
}
