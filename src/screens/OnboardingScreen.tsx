import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Animated,
  useRef,
  useEffect,
} from 'react-native';

const features = [
  {
    icon: '📖',
    title: 'Mga Aralin',
    desc: 'Mga interactive na aralin sa iyong sariling wika — Math, Science, English, at higit pa',
    bg: '#FFF0EB',
  },
  {
    icon: '🎮',
    title: 'Mga Laro at Pagsusulit',
    desc: 'Sagutin ang mga quiz, kumita ng XP at badges, at makipagkompetensya sa sarili mo',
    bg: '#E8F8F6',
  },
  {
    icon: '📤',
    title: 'Ibahagi sa QR',
    desc: 'Makatanggap ng mga aralin mula sa iyong guro gamit lamang ang QR code — walang internet',
    bg: '#FFF8E0',
  },
];

export default function OnboardingScreen({ onStart }: { onStart: () => void }) {
  const cardAnims = useRef(features.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(150, cardAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Maligayang <Text style={styles.headerAccent}>Pagdating!</Text>
        </Text>
        <Text style={styles.headerSub}>Ganito ka matututo sa LearnBasilan</Text>
      </View>

      <View style={styles.list}>
        {features.map((feat, i) => {
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
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
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
    color: '#1A535C',
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
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
