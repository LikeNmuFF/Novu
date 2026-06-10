import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { getUserStats } from '../services/auth';
import { getEarnedBadges } from '../services/progress';
import { getDb } from '../services/database';
import type { User } from '../services/auth';

export default function ProfileScreen({
  user,
  onBack,
  onLogout,
}: {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}) {
  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0 });
  const [badgeCount, setBadgeCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    getUserStats(user.id).then(setStats).catch(() => {});
    getEarnedBadges(user.id).then(b => setBadgeCount(b.length)).catch(() => {});

    const loadCompleted = async () => {
      try {
        const db = await getDb();
        const result = await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND status = 'completed'",
          [user.id]
        );
        setCompletedCount(result?.count ?? 0);
      } catch {}
    };
    loadCompleted();
  }, [user.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.headerBack}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userGrade}>{user.grade}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{user.role === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{completedCount}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{badgeCount}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>✏️</Text>
            <Text style={styles.menuLabel}>Edit Profile</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📷</Text>
            <Text style={styles.menuLabel}>Share Progress QR</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuLabel}>Settings</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF7E5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarText: { fontFamily: 'Fredoka_700Bold', fontSize: 36, color: '#FFFFFF' },
  userName: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: '#1A535C' },
  userGrade: { fontFamily: 'Nunito_400Regular', fontSize: 15, color: '#718096', marginTop: 2 },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: '#E8F8F6',
    borderRadius: 999,
  },
  roleBadgeText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#2EC4B6' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: '#FF7E5F' },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#718096', marginTop: 2 },
  menuSection: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E6D5',
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#1A535C', flex: 1 },
  menuArrow: { fontSize: 18, color: '#718096' },
  logoutBtn: {
    marginHorizontal: 20,
    backgroundColor: '#FFF0EB',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  logoutBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#E86548' },
});
