import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function OnboardingScreen({ onStart }: { onStart: () => void }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const cardAnims = useRef(features(colors).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(150, cardAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  const styles = makeStyles(colors);
  const feats = features(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Maligayang <Text style={styles.headerAccent}>Pagdating!</Text>
        </Text>
        <Text style={styles.headerSub}>Ganito ka matututo sa LearnBasilan</Text>
      </View>

      <View style={styles.list}>
        {feats.map((feat, i) => {
          const scale = cardAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          });
          const opacity = cardAnims[i];

          return (
            <Animated.View
              key={i}
              style={[
                styles.card,
                { backgroundColor: feat.bg, opacity, transform: [{ scale }] },
              ]}
            >
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>{feat.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{feat.title}</Text>
              <Text style={styles.cardDesc}>{feat.desc}</Text>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.btnGroup}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>Magsimula Na!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function features(colors: any) {
  return [
    {
      icon: '📖',
      title: 'Mga Aralin',
      desc: 'Mga interactive na aralin sa iyong sariling wika — Math, Science, English, at higit pa',
      bg: `${colors.coral}1A`,
    },
    {
      icon: '🎮',
      title: 'Mga Laro at Pagsusulit',
      desc: 'Sagutin ang mga quiz, kumita ng XP at badges, at makipagkompetensya sa sarili mo',
      bg: `${colors.teal}1A`,
    },
    {
      icon: '📤',
      title: 'Ibahagi sa QR',
      desc: 'Makatanggap ng mga aralin mula sa iyong guro gamit lamang ang QR code — walang internet',
      bg: `${colors.gold}1A`,
    },
  ];
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    header: {
      paddingVertical: 32,
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
      textAlign: 'center',
    },
    list: {
      flex: 1,
      gap: 14,
      paddingVertical: 8,
      justifyContent: 'center',
    },
    card: {
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 18,
      backgroundColor: `${colors.surface}B3`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    icon: {
      fontSize: 36,
    },
    cardTitle: {
      fontFamily: 'Fredoka_700Bold',
      fontSize: 22,
      color: colors.text,
      marginBottom: 6,
    },
    cardDesc: {
      fontFamily: 'Nunito_400Regular',
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
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
