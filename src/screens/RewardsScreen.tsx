import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { getEarnedBadges, BADGES } from '../services/progress';
import type { User } from '../services/auth';

export default function RewardsScreen({
  user,
  onBack,
}: {
  user: User;
  onBack: () => void;
}) {
  const [earned, setEarned] = useState<Array<{ id: string; name: string; icon: string; description: string; earnedAt: number }>>([]);

  useEffect(() => {
    getEarnedBadges(user.id).then(setEarned).catch(() => {});
  }, [user.id]);

  const earnedIds = new Set(earned.map(b => b.id));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.headerBack}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rewards</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{earned.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{BADGES.length - earned.length}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>All Badges</Text>

        {BADGES.map((badge) => {
          const isEarned = earnedIds.has(badge.id);
          const earnedBadge = earned.find(b => b.id === badge.id);
          return (
            <View
              key={badge.id}
              style={[styles.badgeCard, isEarned && styles.badgeCardEarned]}
            >
              <Text style={[styles.badgeIcon, !isEarned && styles.badgeIconLocked]}>
                {isEarned ? badge.icon : '🔒'}
              </Text>
              <View style={styles.badgeInfo}>
                <Text style={[styles.badgeName, !isEarned && styles.badgeNameLocked]}>
                  {badge.name}
                </Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
                {earnedBadge && (
                  <Text style={styles.badgeEarnedAt}>
                    Earned {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <Text style={styles.badgeXp}>+{badge.xp} XP</Text>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
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
    paddingVertical: 12,
  },
  headerBack: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#718096' },
  headerTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#1A535C' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontFamily: 'Fredoka_700Bold', fontSize: 28, color: '#FFD93D' },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096', marginTop: 2 },
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
    padding: 16,
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
  badgeIcon: { fontSize: 32, marginRight: 14 },
  badgeIconLocked: { opacity: 0.4 },
  badgeInfo: { flex: 1 },
  badgeName: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#1A535C' },
  badgeNameLocked: { color: '#718096' },
  badgeDesc: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096', marginTop: 2 },
  badgeEarnedAt: { fontFamily: 'Nunito_400Regular', fontSize: 11, color: '#6BCB77', marginTop: 2 },
  badgeXp: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#FFD93D' },
});
