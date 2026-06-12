import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { getUserStats, updateUserProfile } from '../services/auth';
import { getEarnedBadges } from '../services/progress';
import { getDb } from '../services/database';
import { createQRPackage } from '../utils/qr/package';
import { QRContentType } from '../types/qr';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../context/ThemeContext';
import type { User } from '../services/auth';

export default function ProfileScreen({
  user,
  onLogout,
  onSettings,
  onUserUpdate,
  onNavPress,
  activeTab = 'profile',
}: {
  user: User;
  onLogout: () => void;
  onSettings: () => void;
  onUserUpdate: (user: User) => void;
  onNavPress: (screen: string) => void;
  activeTab?: string;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 16);
  const { theme } = useTheme();
  const { colors } = theme;

  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0 });
  const [badgeCount, setBadgeCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editGrade, setEditGrade] = useState(user.grade);

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

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.nameEmpty'));
      return;
    }
    try {
      await updateUserProfile(user.id, editName.trim(), editGrade.trim());
      onUserUpdate({ ...user, name: editName.trim(), grade: editGrade.trim() });
      setShowEditModal(false);
      Alert.alert(t('app.saved'), t('alerts.profileUpdated'));
    } catch {
      Alert.alert(t('alerts.error'), t('alerts.profileUpdateFailed'));
    }
  };

  const handleExportQR = async () => {
    try {
      const qrData = {
        student: user.name,
        grade: user.grade,
        xp: stats.xp,
        level: stats.level,
        streak: stats.streak,
        badges: badgeCount,
        lessons: completedCount,
      };
      const qr = createQRPackage(qrData, QRContentType.Progress);
      Alert.alert(t('alerts.progressQRGenerated'), t('alerts.qrGenerated', { count: qr.length }));
    } catch {
      Alert.alert('Error', 'Failed to generate QR');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        pointerEvents="box-none"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('nav.profile')}</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.coral }]}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.userGrade, { color: colors.textLight }]}>{user.grade}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.tealGlow }]}>
            <Text style={[styles.roleBadgeText, { color: colors.teal }]}>
              {user.role === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNum, { color: colors.coral }]}>{stats.level}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>{t('profile.level')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNum, { color: colors.coral }]}>{stats.xp}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>{t('profile.xp')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNum, { color: colors.coral }]}>{completedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>{t('profile.lessonsCompleted')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNum, { color: colors.coral }]}>{badgeCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>{t('profile.badges')}</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => {
              setEditName(user.name);
              setEditGrade(user.grade);
              setShowEditModal(true);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.background }]}>
              <Text style={styles.menuIcon}>✏️</Text>
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{t('profile.editProfile')}</Text>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill={colors.textLight}>
              <Path d="M9 18l6-6-6-6" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={handleExportQR}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.background }]}>
              <Text style={styles.menuIcon}>📷</Text>
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{t('profile.generateQR')}</Text>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill={colors.textLight}>
              <Path d="M9 18l6-6-6-6" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={onSettings}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.background }]}>
              <Text style={styles.menuIcon}>⚙️</Text>
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{t('nav.settings')}</Text>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill={colors.textLight}>
              <Path d="M9 18l6-6-6-6" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.coralGlow }]}
          onPress={onLogout}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.logoutBtnText, { color: colors.coralDark }]}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profile.editProfile')}</Text>

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('profile.name')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
              value={editName}
              onChangeText={setEditName}
              placeholder={t('profile.name')}
              placeholderTextColor={colors.textLight}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('profile.grade')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
              value={editGrade}
              onChangeText={setEditGrade}
              placeholder={t('profile.grade')}
              placeholderTextColor={colors.textLight}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: colors.border }]}
                onPress={() => setShowEditModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.textMuted }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.coral }]}
                onPress={handleSaveProfile}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.modalSaveBtnText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  profileCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  userName: { fontFamily: 'Fredoka_700Bold', fontSize: 22 },
  userGrade: { fontFamily: 'Nunito_400Regular', fontSize: 15, marginTop: 2 },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleBadgeText: { fontFamily: 'Nunito_700Bold', fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontFamily: 'Fredoka_700Bold', fontSize: 22 },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  menuSection: {
    marginHorizontal: 20,
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
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontFamily: 'Nunito_700Bold', fontSize: 15, flex: 1 },
  logoutBtn: {
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  logoutBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 16 },
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
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 20, marginBottom: 20 },
  inputLabel: { fontFamily: 'Nunito_700Bold', fontSize: 13, marginBottom: 6 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    marginBottom: 16,
  },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#FFFFFF' },
});
