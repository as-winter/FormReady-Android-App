import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '@/components/AppState';
import { EmptyState } from '@/components/FormReadyUI';
import { useThemeTokens } from '@/hooks/useThemeTokens';

export default function HistoryScreen() {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history, deleteHistory } = useAppState();
  const share = async (uri?: string) => { if (uri && await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri); else Alert.alert('File unavailable', 'This file is no longer in the local cache. Process it again to create a fresh copy.'); };
  return <View style={[styles.root, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: 118 }]}><View style={styles.topbar}><Text style={[styles.heading, { color: colors.foreground }]}>History</Text><Pressable onPress={() => history.length && Alert.alert('Clear history?', 'This removes your local activity list.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: () => history.forEach((item) => deleteHistory(item.id)) }])}><Text style={[styles.clear, { color: colors.primary }]}>Clear</Text></Pressable></View><Text style={[styles.subheading, { color: colors.mutedForeground }]}>Your processed files, kept on this device.</Text>{history.length ? history.map((item) => <View key={item.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.fileIcon, { backgroundColor: colors.secondary }]}><Feather name={item.name.endsWith('.pdf') ? 'file-text' : 'image'} size={18} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.fileName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text><Text style={[styles.meta, { color: colors.mutedForeground }]}>{item.operation} · {item.date}</Text><Text style={[styles.meta, { color: colors.mutedForeground }]}>{item.size}</Text></View><View style={styles.rowActions}><Pressable onPress={() => share(item.uri)} hitSlop={10}><Ionicons name="share-outline" size={19} color={colors.foreground} /></Pressable><Pressable onPress={() => Alert.alert('Delete file?', 'Remove this item from history?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteHistory(item.id) }])} hitSlop={10}><Ionicons name="trash-outline" size={19} color={colors.destructive} /></Pressable></View></View>) : <EmptyState icon="clock" title="Nothing here yet" body="When you process a photo or PDF, it will appear in this timeline." />}<Pressable onPress={() => router.push('/tools')} style={[styles.cta, { backgroundColor: colors.secondary }]}><Feather name="plus" size={18} color={colors.primary} /><Text style={[styles.ctaText, { color: colors.primary }]}>Process a new file</Text></Pressable></ScrollView></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 10 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 25 },
  clear: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  subheading: { fontFamily: 'Inter_400Regular', fontSize: 13, marginBottom: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 18, padding: 13, marginBottom: 8 },
  fileIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  fileName: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  rowActions: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  cta: { borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 5 },
  ctaText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});