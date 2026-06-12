import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as Font from 'expo-font';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const systemFont = Platform.select({ default: 'sans-serif', ios: 'System' });

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      Fredoka_700Bold: require('../../assets/fonts/Fredoka-Bold.ttf'),
      Nunito_400Regular: require('../../assets/fonts/Nunito-Regular.ttf'),
      Nunito_700Bold: require('../../assets/fonts/Nunito-Bold.ttf'),
    })
      .then(() => setFontsReady(true))
      .catch(() => setFontsReady(true));
  }, []);

  const animate = useCallback(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    animate();
  }, []);

  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoRing,
              { transform: [{ scale: ringScale }] },
            ]}
          />
          <View style={styles.logo}>
            <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
          Learn<Text style={styles.titleAccent}>Basilan</Text>
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Matuto, Maglaro, Magtagumpay{'\n'}— kahit walang internet
        </Animated.Text>

        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
      </View>

      <View style={styles.waves}>
        <Svg width={width} height={160} viewBox={`0 0 ${width} 160`}>
          <Path
            d={`M0,80 Q${width * 0.25},0 ${width * 0.5},80 T${width},80 L${width},160 L0,160 Z`}
            fill={`${colors.teal}14`}
          />
          <Path
            d={`M0,100 Q${width * 0.25},40 ${width * 0.5},100 T${width},100 L${width},160 L0,160 Z`}
            fill={`${colors.teal}1F`}
          />
          <Path
            d={`M0,120 Q${width * 0.25},70 ${width * 0.5},120 T${width},120 L${width},160 L0,160 Z`}
            fill={colors.background}
          />
        </Svg>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.teal,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    content: {
      alignItems: 'center',
      gap: 24,
      zIndex: 2,
    },
    logoWrapper: {
      position: 'relative',
      marginBottom: 8,
    },
    logoRing: {
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: 36,
      borderWidth: 2,
      borderColor: `${colors.gold}4D`,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 32,
      backgroundColor: colors.coral,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.coral,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 40,
      elevation: 10,
    },
    logoImage: {
      width: '100%',
      height: '100%',
      borderRadius: 32,
    },
    title: {
      fontFamily: systemFont,
      fontSize: 40,
      color: colors.surface,
      textAlign: 'center',
      letterSpacing: -0.5,
      fontWeight: '700',
    },
    titleAccent: {
      color: colors.gold,
    },
    subtitle: {
      fontFamily: systemFont,
      fontSize: 16,
      color: `${colors.surface}B3`,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 280,
    },
    dots: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 32,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: `${colors.surface}40`,
    },
    waves: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 160,
    },
  });
}
