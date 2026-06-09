import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getImportedContent, ImportedItem } from '../services/contentStore';
import { getUserStats } from '../services/auth';
import { getSubjectProgress } from '../services/progress';
import { getDb } from '../services/database';
import type { User } from '../services/auth';

const { width } = Dimensions.get('window');

interface SubjectCard {
  id: number;
  name: string;
  icon: string;
  color: string;
  bg_color: string;
  completed: number;
  total: number;
  pct: number;
}

export default function HomeScreen({
  user,
  onSubjectPress,
  onScanPress,
  onNavPress,
}: {
  user: User;
  onSubjectPress: (subjectId: number) => void;
  onScanPress: () => void;
  onNavPress: (screen: string) => void;
}) {
  const xpAnim = useRef(new Animated.Value(0)).current;
  const [subjects, setSubjects] = useState<SubjectCard[]>([]);
  const barAnims = useRef<Animated.Value[]>([]).current;
  const [importedCount, setImportedCount] = useState(0);
  const [stats, setStats] = useState({ xp: 0, level: 1, streak: 0 });
  const [importedItems, setImportedItems] = useState<ImportedItem[]>([]);
  const badgeScale = useRef(new Animated.Value(0)).current;

  const refreshImported = useCallback(() => {
    getImportedContent(user.id).then((items) => {
      setImportedItems(items);
      setImportedCount(items.length);
      if (items.length > 0) {
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }).start();
      }
    }).catch(() => {});
  }, [user.id]);

  useEffect(() => {
    refreshImported();
    getUserStats(user.id).then(setStats).catch(() => {});

    const loadSubjects = async () => {
      try {
        const db = await getDb();
        const rows = await db.getAllAsync<{ id: number; name: string; icon: string; color: string; bg_color: string }>(
          'SELECT id, name, icon, color, bg_color FROM subjects ORDER BY subject_order ASC'
        );
        const cards: SubjectCard[] = [];
        for (const row of rows) {
          const progress = await getSubjectProgress(user.id, row.id);
          cards.push({
            id: row.id,
            name: row.name,
            icon: row.icon,
            color: row.color,
            bg_color: row.bg_color,
            completed: progress.completed,
            total: progress.total,
            pct: progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0,
          });
        }
        setSubjects(cards);
        barAnims.splice(0, barAnims.length, ...cards.map(() => new Animated.Value(0)));
        setTimeout(() => {
          Animated.stagger(200, barAnims.map((anim) =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false,
            })
          )).start();
        }, 300);
      } catch {}
    };
    loadSubjects();

    const interval = setInterval(refreshImported, 2000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(xpAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }).start();
      Animated.stagger(200, barAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        })
      )).start();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const xpPercent = Math.min(100, (stats.xp / (stats.level * 100)) * 100);
  const xpWidth = xpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${xpPercent}%`],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, <Text style={styles.greetingAccent}>{user.name}!</Text> 👋
            </Text>
            <Text style={styles.greetingSub}>{user.grade} • Last active today</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.scanBtn} onPress={onScanPress} activeOpacity={0.7}>
              <Text style={styles.scanBtnIcon}>📷</Text>
              {importedCount > 0 && (
                <Animated.View
                  style={[styles.scanBadge, { transform: [{ scale: badgeScale }] }]}
                >
                  <Text style={styles.scanBadgeText}>{importedCount}</Text>
                </Animated.View>
              )}
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.avatar}</Text>
            </View>
          </View>
        </View>

        {/* XP Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpRow}>
            <View style={styles.xpLevel}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{stats.level}</Text>
              </View>
              <View>
                <Text style={styles.levelLabel}>Level</Text>
                <Text style={styles.levelNum}>{stats.level}</Text>
              </View>
            </View>
            <View style={styles.streak}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="#E86548">
                <Path d="M12 2C12 2 7 8 7 13c0 2.76 2.24 5 5 5s5-2.24 5-5c0-5-5-11-5-11z" />
                <Path d="M12 18c-2.76 0-5-2.24-5-5 0-1.5.6-3 1.5-4.2C9.5 10 12 14 12 14s2.5-4 3.5-5.2C16.4 10 17 11.5 17 13c0 2.76-2.24 5-5 5z" opacity="0.3" />
              </Svg>
              <Text style={styles.streakText}>{stats.streak}-day streak!</Text>
            </View>
          </View>
          <View style={styles.xpBar}>
            <View style={styles.xpBarBg}>
              <Animated.View style={[styles.xpBarFill, { width: xpWidth }]} />
            </View>
            <Text style={styles.xpText}>{stats.xp} / {(stats.level) * 100} XP</Text>
          </View>
        </View>

        {/* Continue Learning */}
        <TouchableOpacity style={styles.continueCard} onPress={() => onSubjectPress(subjects.length > 0 ? subjects[0].id : 1)} activeOpacity={0.8}>
          <View style={styles.continueContent}>
            <Text style={styles.continueTitle}>Ipagpatuloy ang Pag-aaral</Text>
            <Text style={styles.continueDesc}>Math — Addition with Regrouping</Text>
            <View style={styles.continueChip}>
              <Text style={styles.continueChipText}>▶ Ipagpatuloy</Text>
            </View>
          </View>
          <Text style={styles.continueEmoji}>📚</Text>
        </TouchableOpacity>

        {/* Imported Content via QR */}
        {importedItems.length > 0 && (
          <View style={styles.importedSection}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>
                📥 Recently Imported
              </Text>
              <Text style={styles.sectionTitleCount}>{importedItems.length}</Text>
            </View>
            {importedItems.slice(-3).reverse().map((item) => (
              <View key={item.id} style={styles.importedCard}>
                <Text style={styles.importedIcon}>
                  {item.type === 'lesson' ? '📖' : item.type === 'quiz' ? '❓' : '📦'}
                </Text>
                <View style={styles.importedInfo}>
                  <Text style={styles.importedTitle}>{item.title}</Text>
                  <Text style={styles.importedType}>
                    {item.type.toUpperCase()} • New
                  </Text>
                </View>
                <Text style={styles.importedArrow}>→</Text>
              </View>
            ))}
          </View>
        )}

        {/* Subjects */}
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Mga Asignatura</Text>
        </View>

        <View style={styles.subjectGrid}>
          {subjects.map((subj, i) => {
            const barW = (barAnims[i] || new Animated.Value(0)).interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', `${subj.pct}%`],
            });
            return (
              <TouchableOpacity
                key={subj.id}
                style={styles.subjectCard}
                onPress={() => onSubjectPress(subj.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.subjIcon, { backgroundColor: subj.bg_color }]}>
                  <Text style={styles.subjIconText}>{subj.icon}</Text>
                </View>
                <Text style={styles.subjName}>{subj.name}</Text>
                <Text style={styles.subjProgress}>{subj.completed} / {subj.total} lessons</Text>
                <View style={styles.subjBar}>
                  <Animated.View
                    style={[styles.subjBarInner, { backgroundColor: subj.color, width: barW }]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { key: 'home', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z', label: 'Home' },
          { key: 'learn', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', label: 'Learn' },
          { key: 'rewards', icon: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v4h4v-2H5v-2zm14 0h-2v2h-2v2h4v-4z', label: 'Rewards' },
          { key: 'progress', icon: 'M22 12h-4l-3 9L9 3l-3 9H2', label: 'Progress' },
          { key: 'profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', label: 'Profile' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.navItem} onPress={() => onNavPress(item.key)}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill={item.key === 'home' ? '#FF7E5F' : '#718096'}>
              <Path d={item.icon} />
            </Svg>
            <Text style={[styles.navLabel, item.key === 'home' && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: { fontFamily: 'Fredoka_700Bold', fontSize: 24, color: '#1A535C' },
  greetingAccent: { color: '#FF7E5F' },
  greetingSub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: '#718096', marginTop: 2 },
  scanBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  scanBtnIcon: { fontSize: 22 },
  scanBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF7E5F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF8F0',
  },
  scanBadgeText: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: '#FFFFFF' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFA68F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarText: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: '#FFFFFF' },
  xpCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF8E0',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLevel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD93D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  levelBadgeText: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#1A535C' },
  levelLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 14, color: '#4A5568' },
  levelNum: { fontFamily: 'Fredoka_700Bold', fontSize: 22, color: '#1A535C' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { fontFamily: 'Fredoka_700Bold', fontSize: 14, color: '#E86548' },
  xpBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  xpBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255, 126, 95, 0.15)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  xpBarFill: { height: '100%', backgroundColor: '#FF7E5F', borderRadius: 999 },
  xpText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#4A5568' },
  continueCard: {
    marginHorizontal: 20,
    backgroundColor: '#2EC4B6',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#2EC4B6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 6,
  },
  continueContent: { flex: 1 },
  continueEmoji: { fontSize: 48, opacity: 0.3, position: 'absolute', right: 20, bottom: 20 },
  continueTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 18, color: '#FFFFFF' },
  continueDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  continueChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
  },
  continueChipText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#FFFFFF' },
  importedSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  importedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF8EF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#94D99D',
  },
  importedIcon: { fontSize: 24, marginRight: 12 },
  importedInfo: { flex: 1 },
  importedTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 15, color: '#1A535C' },
  importedType: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: '#6BCB77', marginTop: 2 },
  importedArrow: { fontSize: 18, color: '#6BCB77' },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleText: { fontFamily: 'Fredoka_700Bold', fontSize: 20, color: '#1A535C' },
  sectionTitleCount: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#718096',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  subjectCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  subjIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  subjIconText: { fontSize: 24 },
  subjName: { fontFamily: 'Fredoka_700Bold', fontSize: 16, color: '#1A535C' },
  subjProgress: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#718096', marginTop: 2 },
  subjBar: { height: 4, backgroundColor: '#F5E6D5', borderRadius: 999, marginTop: 8, overflow: 'hidden' },
  subjBarInner: { height: '100%', borderRadius: 999 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5E6D5',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  navItem: { alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 6 },
  navLabel: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: '#718096' },
  navLabelActive: { color: '#FF7E5F' },
});
