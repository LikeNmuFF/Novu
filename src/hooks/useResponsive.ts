import { useWindowDimensions } from 'react-native';

const BREAKPOINT_TABLET = 768;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= BREAKPOINT_TABLET;
  const isPhone = !isTablet;
  return { width, height, isTablet, isPhone };
}
