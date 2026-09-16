import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState, ToolId } from '@/components/AppState';
import { BrandMark, Chip, EmptyState, RequirementBox, SectionHeading, ToolCard } from '@/components/FormReadyUI';
import { useThemeTokens } from '@/hooks/useThemeTokens';

function parseRequirement(input: string) {
  const lower = input.toLowerCase();
  const type = lower.includes('png') ? 'PNG' : lower.includes('jpeg') ? 'JPEG' : 'JPG';
  const kb = input.match(/(\d+(?:\.\d+)?)\s*(kb|mb)/i);
  const dimensions = input.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*(cm|px)?/i);
  const tool: ToolId = lower.includes('signature') ? 'signature' : lower.includes('pdf') ? 'image-pdf' : 'photo';
  return { type, size: kb ? `${kb[1]} ${kb[2].toUpperCase()}` : 'Flexible size', dimensions: dimensions ? `${dimensions[1]} × ${dimensions[2]} ${dimensions[3] ?? ''}`.trim() : 'Custom dimensions', tool };
}

export default function HomeScreen() {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history, favorites, toggleFavorite } = useAppState();
  const [requirement, setRequirement] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseRequirement> | null>(null);
  const favoriteTools = favorites.slice(0, 4);
  const popular = useMemo(() => (['photo', 'signature', 'image-pdf', 'pdf-compress'] as ToolId[]), []);

  const openRequirement = () => {
    if (!requirement.trim()) return;
    const result = parseRequirement(requirement);
    setParsed(result);
    router.push({ pathname: '/tools', params: { tool: result.tool, requirement: requirement.trim() } });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: 118 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}><BrandMark size={42} /><View><Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Good morning,</Text><Text style={[styles.greeting, { color: colors.foreground }]}>Make it form-ready.</Text></View></View>
          <Pressable testID="notifications" style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="notifications-outline" size={20} color={colors.foreground} /></Pressable>
        </View>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroKicker}>FORMREADY</Text>
          <Text style={styles.heroTitle}>Your files,{'\n'}sorted in seconds.</Text>
          <Text style={styles.heroBody}>Resize, compress and convert for every form without the guesswork.</Text>
          <View style={styles.heroBadge}><Feather name="shield" size={13} color="#FFFFFF" /><Text style={styles.heroBadgeText}>Works offline · private by default</Text></View>
        </View>
        <View style={styles.requirementSection}>
          <SectionHeading title="Tell me the requirement" />
          <RequirementBox value={requirement} onChange={setRequirement} onSubmit={openRequirement} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {['Photo 3.5 × 4.5 cm, max 50 KB', 'Signature under 20 KB', 'Images to A4 PDF'].map((example) => <Chip key={example} label={example} onPress={() => setRequirement(example)} />)}
          </ScrollView>
        </View>
        {parsed && <Pressable onPress={() => router.push({ pathname: '/tools', params: { tool: parsed.tool } })} style={[styles.understood, { backgroundColor: colors.secondary }]}>
          <View style={styles.understoodIcon}><Feather name="check" size={17} color={colors.success} /></View>
          <View style={{ flex: 1 }}><Text style={[styles.understoodTitle, { color: colors.foreground }]}>Requirement understood</Text><Text style={[styles.understoodBody, { color: colors.mutedForeground }]}>{parsed.tool === 'signature' ? 'Signature' : 'Photo'} · {parsed.dimensions} · {parsed.type} · max {parsed.size}</Text></View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>}
        {favoriteTools.length > 0 && <View style={styles.section}><SectionHeading title="Your quick tools" action="Reorder" onAction={() => router.push('/more')} /><View style={styles.toolGrid}>{favoriteTools.map((tool) => <ToolCard key={tool} tool={tool} compact favorite onFavorite={() => toggleFavorite(tool)} onPress={() => router.push({ pathname: '/tools', params: { tool } })} />)}</View></View>}
        <View style={styles.section}><SectionHeading title="Popular tasks" action="See all" onAction={() => router.push('/tools')} />{popular.slice(0, 3).map((tool) => <View key={tool} style={{ marginBottom: 9 }}><ToolCard tool={tool} onPress={() => router.push({ pathname: '/tools', params: { tool } })} /></View>)}</View>
        <View style={styles.section}><SectionHeading title="Recent files" action={history.length ? 'View history' : undefined} onAction={() => router.push('/history')} />{history.length ? history.slice(0, 2).map((item) => <View key={item.id} style={[styles.recentRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.recentIcon, { backgroundColor: colors.secondary }]}><Feather name={item.name.toLowerCase().includes('pdf') ? 'file-text' : 'image'} size={18} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.recentName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text><Text style={[styles.recentMeta, { color: colors.mutedForeground }]}>{item.operation} · {item.size}</Text></View><Ionicons name="ellipsis-horizontal" size={19} color={colors.mutedForeground} /></View>) : <EmptyState icon="clock" title="Your workspace is fresh" body="Processed files will show up here for quick access." />}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 22 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  eyebrow: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 3 },
  greeting: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  iconButton: { width: 42, height: 42, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 26, padding: 21, overflow: 'hidden', minHeight: 190 },
  heroBlob: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#FFFFFF18', right: -45, top: -60 },
  heroKicker: { color: '#D8D5FF', fontFamily: 'Inter_700Bold', letterSpacing: 1.6, fontSize: 10 },
  heroTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 27, lineHeight: 31, marginTop: 9 },
  heroBody: { color: '#E5E3FF', fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, marginTop: 9, maxWidth: 260 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  heroBadgeText: { color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 11 },
  requirementSection: { gap: 0 },
  chipsRow: { paddingTop: 10 },
  understood: { borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  understoodIcon: { width: 30, height: 30, borderRadius: 11, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  understoodTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  understoodBody: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  section: { gap: 0 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  recentRow: { borderWidth: 1, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 8 },
  recentIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  recentName: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  recentMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
});
