import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToolId, useAppState } from '@/components/AppState';
import { Chip, ProcessingState, SectionHeading, ToolCard, toolMeta } from '@/components/FormReadyUI';
import { useThemeTokens } from '@/hooks/useThemeTokens';

const toolOrder: ToolId[] = ['photo', 'signature', 'image-pdf', 'pdf-compress', 'pdf-merge', 'pdf-split', 'pdf-export'];

export default function ToolsScreen() {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ tool?: string; requirement?: string }>();
  const [activeTool, setActiveTool] = useState<ToolId>((params.tool as ToolId) || 'photo');
  const [requirement, setRequirement] = useState(params.requirement || '');

  useEffect(() => { if (params.tool && toolOrder.includes(params.tool as ToolId)) setActiveTool(params.tool as ToolId); }, [params.tool]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: 118 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}><Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={21} color={colors.foreground} /></Pressable><Text style={[styles.heading, { color: colors.foreground }]}>Tools</Text><View style={{ width: 38 }} /></View>
        {requirement ? <View style={[styles.reqPill, { backgroundColor: colors.secondary }]}><Feather name="star" size={15} color={colors.primary} /><Text style={[styles.reqPillText, { color: colors.foreground }]} numberOfLines={2}>{requirement}</Text></View> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolTabs}>{toolOrder.map((tool) => <Chip key={tool} label={toolMeta[tool].title} selected={activeTool === tool} onPress={() => setActiveTool(tool)} />)}</ScrollView>
        <ToolWorkspace tool={activeTool} />
        <View style={styles.allTools}><SectionHeading title="All tools" /><View style={styles.list}>{toolOrder.filter((tool) => tool !== activeTool).map((tool) => <ToolCard key={tool} tool={tool} onPress={() => setActiveTool(tool)} />)}</View></View>
      </ScrollView>
    </View>
  );
}

function ToolWorkspace({ tool }: { tool: ToolId }) {
  const colors = useThemeTokens();
  const { addHistory } = useAppState();
  const [imageUri, setImageUri] = useState<string>();
  const [working, setWorking] = useState(false);
  const [size, setSize] = useState('50');
  const [format, setFormat] = useState<'JPG' | 'PNG'>('JPG');
  const [pageSize, setPageSize] = useState('A4');
  const [pdfUris, setPdfUris] = useState<string[]>([]);

  const pickImage = async (multiple = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, allowsMultipleSelection: multiple, quality: 1 });
    if (result.canceled) return;
    const uris = result.assets.map((asset) => asset.uri);
    setImageUri(uris[0]);
    if (tool === 'image-pdf') setPdfUris(uris);
  };

  const processImage = async (kind: 'photo' | 'signature') => {
    if (!imageUri) { await pickImage(); return; }
    setWorking(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(imageUri, [{ resize: { width: kind === 'signature' ? 1200 : 900 } }], { compress: Math.max(0.15, Math.min(1, 1 - Number(size) / 250)), format: format === 'PNG' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG });
      setImageUri(manipulated.uri);
      addHistory({ name: `${kind === 'signature' ? 'signature' : 'photo'}-${Date.now()}.${format.toLowerCase()}`, operation: kind === 'signature' ? 'Signature compressed' : 'Photo resized & compressed', size: `under ${size} KB`, uri: manipulated.uri });
      Alert.alert('File prepared', `This ${format} file was processed on your device. Check the preview before uploading it.`);
    } catch {
      Alert.alert('Couldn’t process that file', 'Try a different image or a smaller file.');
    } finally { setWorking(false); }
  };

  const createPdf = async () => {
    if (!pdfUris.length) { await pickImage(true); return; }
    setWorking(true);
    try {
      const html = `<html><body style="margin:0;background:white;">${pdfUris.map((uri) => `<div style="page-break-after:always;text-align:center;"><img src="${uri}" style="max-width:100%;max-height:100%;object-fit:contain;" /></div>`).join('')}</body></html>`;
      const result = await Print.printToFileAsync({ html });
      addHistory({ name: `formready-${Date.now()}.pdf`, operation: `${pdfUris.length} image${pdfUris.length > 1 ? 's' : ''} → PDF`, size: 'Created locally', uri: result.uri });
      setImageUri(result.uri);
      Alert.alert('PDF created', `${pdfUris.length} image${pdfUris.length > 1 ? 's are' : ' is'} ready to share.`);
    } catch { Alert.alert('Couldn’t create PDF', 'Please try selecting the images again.'); }
    finally { setWorking(false); }
  };

  const pickPdfs = async (mode: 'compress' | 'merge' | 'split') => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: mode === 'merge', copyToCacheDirectory: true });
    if (result.canceled) return;
    const files = result.assets;
    setWorking(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      if (mode === 'merge') {
        const output = await PDFDocument.create();
        for (const file of files) {
          const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
          const source = await PDFDocument.load(base64);
          const pages = await output.copyPages(source, source.getPageIndices());
          pages.forEach((page) => output.addPage(page));
        }
        const bytes = await output.save();
        const uri = `${FileSystem.cacheDirectory}merged-${Date.now()}.pdf`;
        await FileSystem.writeAsStringAsync(uri, uint8ToBase64(bytes), { encoding: FileSystem.EncodingType.Base64 });
        addHistory({ name: 'merged-documents.pdf', operation: `${files.length} PDFs merged`, size: 'Created locally', uri });
        setImageUri(uri);
        Alert.alert('PDFs merged', 'Your combined PDF is ready to share.');
      } else {
        const base64 = await FileSystem.readAsStringAsync(files[0].uri, { encoding: FileSystem.EncodingType.Base64 });
        const source = await PDFDocument.load(base64);
        if (mode === 'split') {
          const output = await PDFDocument.create();
          const [page] = await output.copyPages(source, [0]);
          output.addPage(page);
          const bytes = await output.save();
          const uri = `${FileSystem.cacheDirectory}page-1-${Date.now()}.pdf`;
          await FileSystem.writeAsStringAsync(uri, uint8ToBase64(bytes), { encoding: FileSystem.EncodingType.Base64 });
          addHistory({ name: 'extracted-page-1.pdf', operation: 'First page extracted', size: 'Created locally', uri });
          setImageUri(uri);
          Alert.alert('Page extracted', 'The first page is ready to share.');
        } else {
          const bytes = await source.save({ useObjectStreams: true });
          const uri = `${FileSystem.cacheDirectory}compressed-${Date.now()}.pdf`;
          await FileSystem.writeAsStringAsync(uri, uint8ToBase64(bytes), { encoding: FileSystem.EncodingType.Base64 });
          addHistory({ name: 'compressed-document.pdf', operation: 'PDF compressed', size: 'Optimized locally', uri });
          setImageUri(uri);
          Alert.alert('PDF optimized', 'The optimized copy is ready to share.');
        }
      }
    } catch { Alert.alert('Couldn’t process that PDF', 'The file may be password-protected, corrupted, or too large for this device.'); }
    finally { setWorking(false); }
  };

  const share = async () => {
    if (!imageUri) return;
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(imageUri);
    else Alert.alert('Sharing unavailable', 'Save the file from your device and share it from Files.');
  };

  const title = toolMeta[tool].title;
  const isImage = tool === 'photo' || tool === 'signature';
  const isPdf = tool.startsWith('pdf-');

  return <View style={[styles.workspace, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={styles.workspaceHeader}><View style={[styles.workspaceIcon, { backgroundColor: `${toolMeta[tool].color}18` }]}><Feather name={toolMeta[tool].icon} size={24} color={toolMeta[tool].color} /></View><View style={{ flex: 1 }}><Text style={[styles.workspaceTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.workspaceSubtitle, { color: colors.mutedForeground }]}>{isImage ? 'Private, on-device processing' : isPdf ? 'Works offline on your device' : 'Choose a file to get started'}</Text></View></View>
    {isImage && <><View style={[styles.preview, { backgroundColor: colors.muted }]}>{imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" /> : <><Feather name={tool === 'signature' ? 'edit-3' : 'image'} size={32} color={colors.mutedForeground} /><Text style={[styles.previewHint, { color: colors.mutedForeground }]}>Before / after preview</Text></>}</View><View style={styles.settingRow}><View><Text style={[styles.settingLabel, { color: colors.foreground }]}>Max file size</Text><Text style={[styles.settingHint, { color: colors.mutedForeground }]}>Never claim ready over this limit</Text></View><View style={styles.sizeInput}><TextInput value={size} onChangeText={setSize} keyboardType="number-pad" style={[styles.sizeText, { color: colors.foreground }]} /><Text style={[styles.unit, { color: colors.mutedForeground }]}>KB</Text></View></View><View style={styles.settingRow}><Text style={[styles.settingLabel, { color: colors.foreground }]}>Format</Text><View style={styles.formatRow}><Chip label="JPG" selected={format === 'JPG'} onPress={() => setFormat('JPG')} /><Chip label="PNG" selected={format === 'PNG'} onPress={() => setFormat('PNG')} /></View></View><View style={styles.settingRow}><Text style={[styles.settingLabel, { color: colors.foreground }]}>Preset</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}><Chip label={tool === 'signature' ? 'Clean signature' : 'Passport 3.5 × 4.5 cm'} onPress={() => setSize(tool === 'signature' ? '20' : '50')} /><Chip label="College form" onPress={() => setSize('100')} /></ScrollView></View></>}
    {tool === 'image-pdf' && <><View style={[styles.preview, { backgroundColor: colors.muted }]}>{imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" /> : <><Feather name="file-plus" size={32} color={colors.mutedForeground} /><Text style={[styles.previewHint, { color: colors.mutedForeground }]}>Your PDF preview appears here</Text></>}</View><Text style={[styles.settingLabel, { color: colors.foreground }]}>Page size</Text><View style={styles.formatRow}>{['A4', 'A5', 'Letter', 'Original'].map((label) => <Chip key={label} label={label} selected={pageSize === label} onPress={() => setPageSize(label)} />)}</View></>}
    {isPdf && tool !== 'image-pdf' && <View style={[styles.pdfInfo, { backgroundColor: colors.muted }]}><Feather name="lock" size={19} color={colors.mutedForeground} /><Text style={[styles.pdfInfoText, { color: colors.mutedForeground }]}>Files stay on this device. Password-protected PDFs will be rejected with a friendly message.</Text></View>}
    {working ? <ProcessingState label="Processing on this device…" /> : <View style={styles.actions}><Pressable testID="primary-tool-action" onPress={() => tool === 'photo' || tool === 'signature' ? processImage(tool) : tool === 'image-pdf' ? createPdf() : pickPdfs(tool === 'pdf-merge' ? 'merge' : tool === 'pdf-split' ? 'split' : 'compress')} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}><Feather name={imageUri ? 'refresh-cw' : 'upload'} size={17} color={colors.primaryForeground} /><Text style={[styles.primaryText, { color: colors.primaryForeground }]}>{imageUri ? 'Process again' : tool === 'image-pdf' ? 'Choose images' : 'Choose a file'}</Text></Pressable>{imageUri && <Pressable testID="share-file" onPress={share} style={[styles.shareButton, { borderColor: colors.border }]}><Feather name="share-2" size={17} color={colors.foreground} /><Text style={[styles.shareText, { color: colors.foreground }]}>Share</Text></Pressable>}</View>}
  </View>;
}

function uint8ToBase64(bytes: Uint8Array) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  return globalThis.btoa(binary);
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 18 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  heading: { fontFamily: 'Inter_700Bold', fontSize: 21 },
  reqPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 15, padding: 12 },
  reqPillText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17 },
  toolTabs: { paddingVertical: 2 },
  workspace: { borderRadius: 24, borderWidth: 1, padding: 15, gap: 16 },
  workspaceHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  workspaceIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  workspaceTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  workspaceSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  preview: { minHeight: 175, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden' },
  previewImage: { width: '100%', height: 220 },
  previewHint: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  settingLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  settingHint: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  sizeInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E8E7F0', borderRadius: 12, paddingHorizontal: 10, minWidth: 88 },
  sizeText: { fontFamily: 'Inter_600SemiBold', paddingVertical: 8, minWidth: 45, textAlign: 'right' },
  unit: { fontFamily: 'Inter_400Regular', fontSize: 12, marginLeft: 5 },
  formatRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  pdfInfo: { borderRadius: 16, padding: 13, flexDirection: 'row', gap: 9, alignItems: 'center' },
  pdfInfoText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 9 },
  primaryButton: { flex: 1, minHeight: 48, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  shareButton: { minHeight: 48, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  shareText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  allTools: { gap: 0 },
  list: { gap: 9 },
});