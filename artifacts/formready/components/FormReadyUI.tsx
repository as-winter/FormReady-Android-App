import * as Haptics from 'expo-haptics';
import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { accentPresets } from '@/constants/colors';
import { ToolId } from '@/components/AppState';
import { useThemeTokens } from '@/hooks/useThemeTokens';

export const toolMeta: Record<ToolId, { title: string; subtitle: string; icon: keyof typeof Feather.glyphMap; color: string }> = {
  photo: { title: 'Photo', subtitle: 'Resize & compress', icon: 'image', color: '#6C63FF' },
  signature: { title: 'Signature', subtitle: 'Clean & resize', icon: 'edit-3', color: '#20B486' },
  'image-pdf': { title: 'Images to PDF', subtitle: 'Make a clean PDF', icon: 'file-text', color: '#F18B6A' },
  'pdf-compress': { title: 'Compress PDF', subtitle: 'Shrink file size', icon: 'minimize-2', color: '#2589D8' },
  'pdf-merge': { title: 'Merge PDFs', subtitle: 'Combine documents', icon: 'layers', color: '#D9659B' },
  'pdf-split': { title: 'Split PDF', subtitle: 'Extract pages', icon: 'scissors', color: '#B98453' },
  'pdf-export': { title: 'PDF to image', subtitle: 'Export pages', icon: 'download', color: '#4A4A75' },
};

export function BrandMark({ size = 42 }: { size?: number }) {
  const colors = useThemeTokens();
  return (
    <View style={[styles.brandMark, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: colors.primary }]}>
      <View style={[styles.brandPage, { width: size * 0.4, height: size * 0.52, borderRadius: size * 0.06 }]}>
        <View style={styles.brandFold} />
        <View style={[styles.brandCheck, { width: size * 0.24, height: size * 0.12, borderBottomWidth: size * 0.075, borderLeftWidth: size * 0.075 }]} />
      </View>
    </View>
  );
}

export function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useThemeTokens();
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action && <Pressable onPress={onAction} hitSlop={8}><Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text></Pressable>}
    </View>
  );
}

export function ToolCard({ tool, compact = false, onPress, favorite, onFavorite }: { tool: ToolId; compact?: boolean; onPress: () => void; favorite?: boolean; onFavorite?: () => void }) {
  const colors = useThemeTokens();
  const meta = toolMeta[tool];
  return (
    <Pressable testID={`tool-${tool}`} onPress={() => { Haptics.selectionAsync(); onPress(); }} style={({ pressed }) => [compact ? styles.toolCompact : styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}>
      <View style={[styles.toolIcon, { backgroundColor: `${meta.color}18` }]}><Feather name={meta.icon} size={compact ? 19 : 22} color={meta.color} /></View>
      <View style={styles.toolText}>
        <Text style={[compact ? styles.toolCompactTitle : styles.toolTitle, { color: colors.foreground }]}>{meta.title}</Text>
        <Text numberOfLines={1} style={[styles.toolSubtitle, { color: colors.mutedForeground }]}>{meta.subtitle}</Text>
      </View>
      {onFavorite ? <Pressable onPress={onFavorite} hitSlop={12}><Ionicons name={favorite ? 'star' : 'star-outline'} size={19} color={favorite ? colors.accentForeground : colors.mutedForeground} /></Pressable> : <Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export function RequirementBox({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) {
  const colors = useThemeTokens();
  return (
    <View style={[styles.requirementBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.requirementIcon}><Feather name="star" size={19} color={colors.primary} /></View>
      <TextInput
        testID="requirement-input"
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        placeholder="Tell me what your form needs..."
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="go"
        style={[styles.requirementInput, { color: colors.foreground }]}
      />
      <Pressable testID="requirement-submit" onPress={onSubmit} style={({ pressed }) => [styles.sendButton, { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 }]}><Feather name="arrow-up" size={18} color={colors.primaryForeground} /></Pressable>
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const colors = useThemeTokens();
  return <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.card, borderColor: selected ? colors.primary : colors.border }]}><Text style={[styles.chipText, { color: selected ? colors.primaryForeground : colors.foreground }]}>{label}</Text></Pressable>;
}

export function EmptyState({ icon, title, body }: { icon: keyof typeof Feather.glyphMap; title: string; body: string }) {
  const colors = useThemeTokens();
  return <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={24} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text></View>;
}

export function ProcessingState({ label = 'Working locally…' }: { label?: string }) {
  const colors = useThemeTokens();
  return <View style={styles.processing}><ActivityIndicator size="small" color={colors.primary} /><Text style={[styles.processingText, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

export function LogoPreview() {
  const colors = useThemeTokens();
  return <View style={[styles.logoPreview, { backgroundColor: colors.secondary }]}><BrandMark size={54} /><View><Text style={[styles.logoName, { color: colors.foreground }]}>FormReady</Text><Text style={[styles.logoTagline, { color: colors.mutedForeground }]}>Make it form-ready.</Text></View></View>;
}

export function AccentSwatches({ selected, onSelect }: { selected: keyof typeof accentPresets; onSelect: (key: keyof typeof accentPresets) => void }) {
  const colors = useThemeTokens();
  return <View style={styles.swatchGrid}>{Object.entries(accentPresets).map(([key, preset]) => <Pressable key={key} onPress={() => onSelect(key as keyof typeof accentPresets)} style={[styles.swatch, { borderColor: selected === key ? colors.foreground : 'transparent' }]}><View style={[styles.swatchCircle, { backgroundColor: preset.color }]} /><Text style={[styles.swatchLabel, { color: colors.mutedForeground }]}>{preset.label.replace(' ', '\n')}</Text></Pressable>)}</View>;
}

const styles = StyleSheet.create({
  brandMark: { alignItems: 'center', justifyContent: 'center' },
  brandPage: { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 5, transform: [{ rotate: '-4deg' }] },
  brandFold: { position: 'absolute', right: 0, top: 0, width: 9, height: 9, backgroundColor: '#D7D4FF', borderBottomLeftRadius: 5 },
  brandCheck: { borderColor: '#22C7A9', transform: [{ rotate: '-45deg' }], marginBottom: 5 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  sectionAction: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  toolCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, borderWidth: 1, minHeight: 78, gap: 12 },
  toolCompact: { flex: 1, minWidth: '46%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 18, borderWidth: 1, gap: 10 },
  toolIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  toolText: { flex: 1, gap: 3 },
  toolTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  toolCompactTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  toolSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  requirementBox: { minHeight: 62, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', padding: 8, gap: 9, shadowColor: '#19183A', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  requirementIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEEFFD' },
  requirementInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', paddingVertical: 9 },
  sendButton: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chip: { borderWidth: 1, borderRadius: 100, paddingHorizontal: 13, paddingVertical: 8, marginRight: 8 },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  emptyState: { borderWidth: 1, borderRadius: 20, alignItems: 'center', padding: 24, gap: 8 },
  emptyIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', lineHeight: 19, maxWidth: 270 },
  processing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 16 },
  processingText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  logoPreview: { borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoName: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  logoTagline: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: '23%', alignItems: 'center', borderWidth: 2, borderRadius: 14, paddingVertical: 8 },
  swatchCircle: { width: 27, height: 27, borderRadius: 14, marginBottom: 5 },
  swatchLabel: { fontFamily: 'Inter_500Medium', fontSize: 9, textAlign: 'center', lineHeight: 11 },
});