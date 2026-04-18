import { useAppStore } from '@/lib/store';

const maleTheme = {
  primary: '#b8860b',
  primaryRgb: '184,134,11',
  gradient: 'from-amber-500 to-yellow-600',
  gradientBg: 'bg-gradient-to-r from-amber-500 to-yellow-600',
  bg: 'bg-idm-male',
  text: 'text-idm-male',
  border: 'border-idm-male',
  ring: 'ring-idm-male',
  glow: 'shadow-idm-male/30',
  navActive: 'bg-amber-500/15 text-amber-400',
  accent: 'amber',
};

const femaleTheme = {
  primary: '#e91e8c',
  primaryRgb: '233,30,140',
  gradient: 'from-pink-500 to-rose-600',
  gradientBg: 'bg-gradient-to-r from-pink-500 to-rose-600',
  bg: 'bg-idm-female',
  text: 'text-idm-female',
  border: 'border-idm-female',
  ring: 'ring-idm-female',
  glow: 'shadow-pink-500/30',
  navActive: 'bg-pink-500/15 text-pink-400',
  accent: 'pink',
};

export function useDivisionTheme() {
  const { division } = useAppStore();
  return division === 'male' ? maleTheme : femaleTheme;
}
