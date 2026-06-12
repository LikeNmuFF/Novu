import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { key: 'home', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z', label: 'Home' },
  { key: 'learn', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', label: 'Learn' },
  { key: 'rewards', icon: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v4h4v-2H5v-2zm14 0h-2v2h-2v2h4v-4z', label: 'Rewards' },
  { key: 'progress', icon: 'M22 12h-4l-3 9L9 3l-3 9H2', label: 'Progress' },
  { key: 'profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', label: 'Profile' },
];

export default function BottomNav({
  activeTab,
  onNavPress,
}: {
  activeTab: string;
  onNavPress: (screen: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.bottomNav, { paddingBottom: bottomInset, zIndex: 100, backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
      {NAV_ITEMS.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.navItem}
          onPress={() => onNavPress(item.key)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill={item.key === activeTab ? colors.coral : colors.textLight}>
            <Path d={item.icon} />
          </Svg>
          <Text style={[styles.navLabel, { color: item.key === activeTab ? colors.coral : colors.textLight }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  navLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
  },
});
