import { accentPresets } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useAppState } from '@/components/AppState';

export function useThemeTokens() {
  const base = useColors();
  const { accent } = useAppState();
  return { ...base, primary: accentPresets[accent].color, tint: accentPresets[accent].color };
}