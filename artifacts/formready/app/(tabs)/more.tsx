import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccentKey, useAppState } from '@/components/AppState';
import { AccentSwatches, Chip, LogoPreview, SectionHeading } from '@/components/FormReadyUI';
import { accentPresets } from '@/constants/colors';
import { useThemeTokens } from '@/hooks/useThemeTokens';

export default function MoreScreen() {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { theme, accent, setTheme, setAccent, favorites, toggleFavorite } = useAppState();
  const tools = [
    ['photo', 'Photo resize & compression', 'image'],
    ['signature', 'Signature tool', 'edit-3'],
    ['image-pdf', 'Images to PDF', 'file-text'],
    ['pdf-compress', 'PDF compression', 'minimize-2'],
  ] as const;
  return <View style={[styles.root, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: 118 }]}><View style={styles.titleRow}><View><Text style={[styles.heading, { color: colors.foreground }]}>More</Text><Text style={[styles.subheading, { color: colors.mutedForeground }]}>Make FormReady feel like yours.</Text></View><View style={[styles.plusBadge, { backgroundColor: colors.accent }]}><Text style={[styles.plusText, { color: colors.accentForeground }]}>PLUS</Text></View></View><LogoPreview /><View style={styles.section}><SectionHeading title="Appearance" /><Text style={[styles.label, { color: colors.mutedForeground }]}>Theme</Text><View style={styles.choiceRow}>{(['system', 'light', 'dark'] as const).map((mode) => <Chip key={mode} label={mode[0].toUpperCase() + mode.slice(1)} selected={theme === mode} onPress={() => setTheme(mode)} />)}</View><Text style={[styles.label, { color: colors.mutedForeground, marginTop: 16 }]}>Accent color</Text><AccentSwatches selected={accent} onSelect={(key) => setAccent(key as AccentKey)} /><View style={[styles.livePreview, { backgroundColor: accentPresets[accent].color }]}><View><Text style={styles.previewLabel}>Live preview</Text><Text style={styles.previewTitle}>Your files, sorted.</Text></View><Feather name="check-circle" size={27} color="#FFFFFF" /></View></View><View style={styles.section}><SectionHeading title="Quick tools" /><Text style={[styles.helper, { color: colors.mutedForeground }]}>Choose what appears on Home.</Text>{tools.map(([id, label, icon]) => <View key={id} style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.smallIcon, { backgroundColor: colors.secondary }]}><Feather name={icon as keyof typeof Feather.glyphMap} size={17} color={colors.primary} /></View><Text style={[styles.settingText, { color: colors.foreground }]}>{label}</Text><Switch value={favorites.includes(id)} onValueChange={() => toggleFavorite(id)} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor="#FFFFFF" /></View>)}</View><View style={styles.section}><SectionHeading title="Document checklists" /><ChecklistCard icon="book-open" title="College admission" count="8 common documents" /><ChecklistCard icon="award" title="Jobs & internships" count="6 common documents" /><ChecklistCard icon="file" title="Exams & scholarships" count="7 common documents" /></View><View style={styles.section}><SectionHeading title="Preferences" /><PreferenceRow icon="sliders" title="Default image format" value="JPG" onPress={() => Alert.alert('Default format', 'JPG is selected for the fastest compatibility.')} /><PreferenceRow icon="database" title="Save location" value="Device storage" onPress={() => Alert.alert('Save location', 'Files are saved to the device cache until you share them.')} /><PreferenceRow icon="shield" title="Privacy & offline processing" value="On-device first" onPress={() => Alert.alert('Your privacy', 'FormReady processes core files on your device and never uploads documents silently.')} /><PreferenceRow icon="message-circle" title="Feedback" value="" onPress={() => Alert.alert('Feedback', 'Thanks for helping make FormReady better.')} /></View><Text style={[styles.version, { color: colors.mutedForeground }]}>FormReady 1.0.0 · Made for form days</Text></ScrollView></View>;
}

function ChecklistCard({ icon, title, count }: { icon: keyof typeof Feather.glyphMap; title: string; count: string }) {
  const colors = useThemeTokens();
  return <Pressable style={[styles.checklist, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.smallIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={17} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.settingText, { color: colors.foreground }]}>{title}</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>{count} · commonly requested</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}

function PreferenceRow({ icon, title, value, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; value: string; onPress: () => void }) {
  const colors = useThemeTokens();
  return <Pressable onPress={onPress} style={[styles.preference, { borderBottomColor: colors.border }]}><Feather name={icon} size={18} color={colors.primary} /><Text style={[styles.settingText, { color: colors.foreground, flex: 1 }]}>{title}</Text>{value ? <Text style={[styles.preferenceValue, { color: colors.mutedForeground }]}>{value}</Text> : null}<Feather name="chevron-right" size={16} color={colors.mutedForeground} /></Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 25 },
  subheading: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4 },
  plusBadge: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 },
  plusText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1 },
  section: { gap: 9 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 1 },
  choiceRow: { flexDirection: 'row', gap: 2 },
  livePreview: { marginTop: 15, borderRadius: 18, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewLabel: { color: '#FFFFFFB8', fontFamily: 'Inter_500Medium', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  previewTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 5 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  settingRow: { borderRadius: 17, borderWidth: 1, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  checklist: { borderRadius: 17, borderWidth: 1, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  preference: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1 },
  preferenceValue: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  version: { fontFamily: 'Inter_400Regular', textAlign: 'center', fontSize: 11, marginTop: -6 },
});