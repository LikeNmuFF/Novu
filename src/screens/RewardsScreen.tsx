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
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        pointerEvents="box-none"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset }]}>
          <Text style={styles.headerTitle}>{t('nav.rewards')}</Text>
        </View>

        {/* Streak Calendar */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>🔥 Streak</Text>
            <Text style={styles.streakCount}>{stats.streak} days</Text>
          </View>
          <View style={styles.streakGrid}>
            {days.map((day, i) => (
              <View
                key={i}
                style={[
                  styles.streakDay,
                  i < streakDays && styles.streakDayActive,
                ]}
              >
                <Text style={[styles.streakDayText, i < streakDays && styles.streakDayTextActive]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{earned.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{BADGES.length - earned.length}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('achievements.badges')}</Text>

        {/* Badge List */}
        {BADGES.map((badge) => {
          const isEarned = earnedIds.has(badge.id);
          const earnedBadge = earned.find(b => b.id === badge.id);
          return (
            <TouchableOpacity
              key={badge.id}
              style={[styles.badgeCard, isEarned && styles.badgeCardEarned]}
              onPress={() => setSelectedBadge({ ...badge, earnedAt: earnedBadge?.earnedAt ?? 0 })}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <View style={[styles.badgeIconWrap, isEarned && styles.badgeIconWrapEarned]}>
                <Text style={[styles.badgeIcon, !isEarned && styles.badgeIconLocked]}>
                  {isEarned ? badge.icon : '🔒'}
                </Text>
              </View>
              <View style={styles.badgeInfo}>
                <Text style={[styles.badgeName, !isEarned && styles.badgeNameLocked]}>
                  {badge.name}
                </Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
              </View>
              <View style={styles.badgeXpWrap}>
                <Text style={[styles.badgeXp, isEarned && styles.badgeXpEarned]}>
                  +{badge.xp}
                </Text>
                <Text style={styles.badgeXpLabel}>XP</Text>
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
          <View style={styles.modalContent}>
            {selectedBadge && (
              <>
                <View style={styles.modalBadgeIcon}>
                  <Text style={styles.modalBadgeEmoji}>
                    {earnedIds.has(selectedBadge.id) ? selectedBadge.icon : '🔒'}
                  </Text>
                </View>
                <Text style={styles.modalBadgeName}>{selectedBadge.name}</Text>
                <Text style={styles.modalBadgeDesc}>{selectedBadge.description}</Text>
                <View style={styles.modalXpRow}>
                  <Text style={styles.modalXp}>+{selectedBadge.xp} XP</Text>
                  {earnedIds.has(selectedBadge.id) && selectedBadge.earnedAt > 0 && (
                    <Text style={styles.modalEarnedDate}>
                      Earned {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                {!earnedIds.has(selectedBadge.id) && (
                  <Text style={styles.modalRequirement}>Complete the requirement to unlock</Text>
                )}
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedBadge(null)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.modalCloseBtnText}>Close</Text>
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
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#1A535C' },
  streakCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF0EB',
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
  streakTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#1A535C' },
  streakCount: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#E86548' },
  streakGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  streakDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDayActive: { backgroundColor: '#E86548' },
  streakDayText: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#718096' },
  streakDayTextActive: { color: '#FFFFFF' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontFamily: 'Fredoka_700Bold', fontSize: 24, color: '#FF7E5F' },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#718096', marginTop: 2 },
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: '#1A535C',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    borderColor: '#FFD93D',
  },
  badgeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeIconWrapEarned: { backgroundColor: '#FFF8E0' },
  badgeIcon: { fontSize: 24 },
  badgeIconLocked: { opacity: 0.4 },
  badgeInfo: { flex: 1 },
  badgeName: { fontFamily: 'Fredoka_700Bold', fontSize: 15, color: '#1A535C' },
  badgeNameLocked: { color: '#718096' },
  badgeDesc: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#718096', marginTop: 2 },
  badgeXpWrap: { alignItems: 'center' },
  badgeXp: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#718096' },
  badgeXpEarned: { color: '#FFD93D' },
  badgeXpLabel: { fontFamily: 'Nunito_400Regular', fontSize: 10, color: '#718096' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFF8E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBadgeEmoji: { fontSize: 40 },
  modalBadgeName: { fontFamily: 'Fredoka_700Bold', fontSize: 20, color: '#1A535C', marginBottom: 8 },
  modalBadgeDesc: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  modalXpRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalXp: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#FFD93D' },
  modalEarnedDate: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#6BCB77' },
  modalRequirement: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096', marginBottom: 16 },
  modalCloseBtn: {
    backgroundColor: '#FFF0EB',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modalCloseBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#E86548' },
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
