import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getEarnedBadges, BADGES } from '../services/progress';
import { getUserStats } from '../services/auth';
import { useTheme } from '../context/ThemeContext';
import BottomNav from '../components/BottomNav';
import type { User } from '../services/auth';

interface BadgeData {
  id: string;
  name: string;
  icon: string;
  description: string;
  xp: number;
  earnedAt: number;
}

export default function RewardsScreen({
  user,
  onNavPress,
  activeTab = 'rewards',
}: {
  user: User;
  onNavPress: (screen: string) => void;
  activeTab?: string;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors } = theme;
  const topInset = Math.max(insets.top, 16);

  const [earned, setEarned] = useState<BadgeData[]>([]);
  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0 });
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getEarnedBadges(user.id).then((badges) => {
      const withXp = badges.map(b => {
        const badge = BADGES.find(x => x.id === b.id);
        return { ...b, xp: badge?.xp ?? 0 };
      });
      setEarned(withXp);
    }).catch(() => {});
    getUserStats(user.id).then(setStats).catch(() => {});
  }, [user.id]);

  const earnedIds = new Set(earned.map(b => b.id));

  const triggerConfetti = () => {
    setShowConfetti(true);
    confettiAnim.setValue(0);
    Animated.sequence([
      Animated.timing(confettiAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(confettiAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowConfetti(false));
  };

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const streakDays = Math.min(stats.streak, 7);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        pointerEvents="box-none"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('nav.rewards')}</Text>
        </View>

        {/* Streak Calendar */}
        <View style={[styles.streakCard, { backgroundColor: colors.surface }]}>
          <View style={styles.streakHeader}>
            <Text style={[styles.streakTitle, { color: colors.text }]}>🔥 Streak</Text>
            <Text style={[styles.streakCount, { color: colors.coral }]}>{stats.streak} days</Text>
          </View>
          <View style={styles.streakGrid}>
            {days.map((day, i) => (
              <View
                key={i}
                style={[
                  styles.streakDay,
                  { backgroundColor: i < streakDays ? colors.coral : colors.surface },
                ]}
              >
                <Text style={[styles.streakDayText, { color: colors.textMuted }, i < streakDays && styles.streakDayTextActive]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNum, { color: colors.coral }]}>{earned.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Earned</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNum, { color: colors.coral }]}>{BADGES.length - earned.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Remaining</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNum, { color: colors.coral }]}>{stats.xp}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>XP</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('achievements.badges')}</Text>

        {/* Badge List */}
        {BADGES.map((badge) => {
          const isEarned = earnedIds.has(badge.id);
          const earnedBadge = earned.find(b => b.id === badge.id);
          return (
            <TouchableOpacity
              key={badge.id}
              style={[styles.badgeCard, { backgroundColor: colors.surface, borderColor: isEarned ? colors.gold : 'transparent' }, isEarned && styles.badgeCardEarned]}
              onPress={() => setSelectedBadge({ ...badge, earnedAt: earnedBadge?.earnedAt ?? 0 })}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <View style={[styles.badgeIconWrap, { backgroundColor: colors.border }, isEarned && { backgroundColor: colors.gold + '30' }]}>
                <Text style={[styles.badgeIcon, !isEarned && styles.badgeIconLocked]}>
                  {isEarned ? badge.icon : '🔒'}
                </Text>
              </View>
              <View style={styles.badgeInfo}>
                <Text style={[styles.badgeName, { color: isEarned ? colors.text : colors.textMuted }]}>
                  {badge.name}
                </Text>
                <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>{badge.description}</Text>
              </View>
              <View style={styles.badgeXpWrap}>
                <Text style={[styles.badgeXp, { color: isEarned ? colors.gold : colors.textMuted }]}>
                  +{badge.xp}
                </Text>
                <Text style={[styles.badgeXpLabel, { color: colors.textMuted }]}>XP</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Badge Detail Modal */}
      <Modal
        visible={!!selectedBadge}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {selectedBadge && (
              <>
                <View style={[styles.modalBadgeIcon, { backgroundColor: colors.border }]}>
                  <Text style={styles.modalBadgeEmoji}>
                    {earnedIds.has(selectedBadge.id) ? selectedBadge.icon : '🔒'}
                  </Text>
                </View>
                <Text style={[styles.modalBadgeName, { color: colors.text }]}>{selectedBadge.name}</Text>
                <Text style={[styles.modalBadgeDesc, { color: colors.textMuted }]}>{selectedBadge.description}</Text>
                <View style={styles.modalXpRow}>
                  <Text style={[styles.modalXp, { color: colors.gold }]}>+{selectedBadge.xp} XP</Text>
                  {earnedIds.has(selectedBadge.id) && selectedBadge.earnedAt > 0 && (
                    <Text style={[styles.modalEarnedDate, { color: colors.green }]}>
                      Earned {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                {!earnedIds.has(selectedBadge.id) && (
                  <Text style={[styles.modalRequirement, { color: colors.textMuted }]}>Complete the requirement to unlock</Text>
                )}
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: colors.border }]}
                  onPress={() => setSelectedBadge(null)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={[styles.modalCloseBtnText, { color: colors.coral }]}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Confetti Overlay */}
      {showConfetti && (
        <Animated.View style={[styles.confettiOverlay, { opacity: confettiAnim }]} pointerEvents="none">
          {[...Array(20)].map((_, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.confettiPiece,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: [{ rotate: `${Math.random() * 360}deg` }],
                },
              ]}
            >
              {['🎉', '⭐', '✨', '🏆', '🎊'][i % 5]}
            </Animated.Text>
          ))}
        </Animated.View>
      )}

      <BottomNav activeTab={activeTab} onNavPress={onNavPress} />
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
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18 },
  streakCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  streakCount: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  streakGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  streakDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDayActive: { },
  streakDayText: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
  streakDayTextActive: { color: '#FFFFFF' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontFamily: 'Fredoka_700Bold', fontSize: 24 },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeCardEarned: {
    borderWidth: 2,
  },
  badgeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeIconWrapEarned: { },
  badgeIcon: { fontSize: 24 },
  badgeIconLocked: { opacity: 0.4 },
  badgeInfo: { flex: 1 },
  badgeName: { fontFamily: 'Fredoka_700Bold', fontSize: 15 },
  badgeNameLocked: { },
  badgeDesc: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  badgeXpWrap: { alignItems: 'center' },
  badgeXp: { fontFamily: 'Nunito_700Bold', fontSize: 13 },
  badgeXpEarned: { },
  badgeXpLabel: { fontFamily: 'Nunito_400Regular', fontSize: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  modalBadgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBadgeEmoji: { fontSize: 40 },
  modalBadgeName: { fontFamily: 'Fredoka_700Bold', fontSize: 20, marginBottom: 8 },
  modalBadgeDesc: { fontFamily: 'Nunito_400Regular', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  modalXpRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalXp: { fontFamily: 'Fredoka_700Bold', fontSize: 18 },
  modalEarnedDate: { fontFamily: 'Nunito_400Regular', fontSize: 12 },
  modalRequirement: { fontFamily: 'Nunito_400Regular', fontSize: 13, marginBottom: 16 },
  modalCloseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modalCloseBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    fontSize: 20,
  },
});
