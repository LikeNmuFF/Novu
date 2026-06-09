import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 32,
    alignItems: 'center',
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
    marginTop: 6,
  },
  list: {
    flex: 1,
    gap: 12,
    paddingVertical: 12,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  langCardSelected: {
    borderColor: '#FF7E5F',
    backgroundColor: '#FFF0EB',
    shadowColor: '#FF7E5F',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 4,
  },
  flagWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
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
    color: '#1A535C',
  },
  langNative: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#718096',
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F5E6D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkSelected: {
    backgroundColor: '#FF7E5F',
    borderColor: '#FF7E5F',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
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
});
