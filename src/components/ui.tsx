import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { DISCLAIMER } from '../config/assumptions';
import { theme } from '../config/theme';
import { optionRows, textSlots } from '../config/figma';
import { useApp } from '../state/AppProvider';
import { cloudConfigured, incompleteCloudConfig } from '../lib/supabase';
import { Eligibility } from '../types/assessment';
import { eligibilityLabel } from '../lib/eligibility';
import { DesignAsset } from './Illustration';
const c = theme.colors;
type TextProps = { children: React.ReactNode; design?: string; style?: React.ComponentProps<typeof Text>['style'] };
export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
export function Icon({ name, color = c.primary, size = 24 }: { name: IconName; color?: string; size?: number }) { return <MaterialCommunityIcons name={name} size={size} color={color} accessible={false} />; }
export function Heading({ children, small = false, design, style }: TextProps & { small?: boolean }) { return <Text style={[styles.heading, small && { fontSize: 22, lineHeight: 29 }, design && textSlots[design], style]}>{children}</Text>; }
export function Body({ children, muted = false, design, style }: TextProps & { muted?: boolean }) { return <Text style={[styles.body, muted && { color: c.muted }, design && textSlots[design], style]}>{children}</Text>; }
export function Card({ children, pale = false, style }: { children: React.ReactNode; pale?: boolean; style?: ViewStyle }) { return <View style={[styles.card, pale && { backgroundColor: c.pale }, style]}>{children}</View>; }
export function Button({ title, onPress, secondary = false, loading = false, icon, destructive = false, disabled = false, wrapLabel = false }: { title: string; onPress: () => void; secondary?: boolean; loading?: boolean; icon?: IconName; destructive?: boolean; disabled?: boolean; wrapLabel?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={loading || disabled} onPress={() => { if (Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => {}); onPress(); }} style={({ pressed }) => [styles.button, secondary && styles.secondary, destructive && { backgroundColor: c.error }, (pressed || loading || disabled) && { opacity: 0.65 }]}>
    {loading ? <ActivityIndicator color={secondary ? c.primary : c.white} /> : <><Text style={[styles.buttonText, wrapLabel && { height: 'auto' }, secondary && { color: c.primary }]}>{title}</Text>{icon && !secondary && <DesignAsset name="arrow" />}</>}
  </Pressable>;
}
export function ErrorNotice({ message, onRetry }: { message?: string; onRetry?: () => void }) { if (!message) return null; return <View accessibilityRole="alert" style={styles.error}><Body style={{ color: c.error }}>{message}</Body>{onRetry && <Button title="Retry" secondary onPress={onRetry} />}</View>; }
export function Screen({ children, title, subtitle, step, totalSteps = 6, back = false, subtitleDesign, mode = true }: { children: React.ReactNode; title?: string; subtitle?: string; step?: number; totalSteps?: number; back?: boolean; subtitleDesign?: string; mode?: boolean }) {
  const app = useApp(), insets = useSafeAreaInsets();
  return <View style={{ flex: 1, backgroundColor: c.cream, paddingLeft: insets.left, paddingRight: insets.right }}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { paddingTop: Math.max(54, insets.top + 8), paddingBottom: Math.max(36, insets.bottom + 12) }]}>
    <View style={styles.container}>
      {(title || back) && <View style={[styles.header, Boolean(step) && { marginRight: -9 }]}>{back && <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>}<View style={{ flex: 1 }}><Heading small>{title}</Heading></View>{step && <Text style={styles.step}>{step} of {totalSteps}</Text>}</View>}
      {subtitle && <Body muted design={subtitleDesign}>{subtitle}</Body>}
      {step && <View style={styles.track}><View style={[styles.progress, { width: `${step / totalSteps * 100}%` }]} /></View>}
      {mode && !cloudConfigured && <Text style={styles.modeText}>{incompleteCloudConfig ? 'Incomplete Supabase setup · local demo mode' : 'Local demo mode · saved on this device'}</Text>}
      {app.draft.sample && title?.includes('assessment') && <Body muted>Sample farm · demonstration data</Body>}
      <ErrorNotice message={app.storageError ? `Draft could not be saved locally: ${app.storageError}` : undefined} />{children}
    </View>
  </ScrollView></KeyboardAvoidingView></View>;
}
const suffixWidths: Record<string, number> = { animals: 49, 't CH₄/yr': 56, 'm³/yr': 35, AUD: 21, 'AUD/yr': 42, years: 35, 'AUD/ACCU': 56, '%': 7 };
export function Input({ label, value, onChange, onBlur, error, suffix, helper, numeric = false, inputRef }: { label: string; value: string; onChange: (value: string) => void; onBlur?: () => void; error?: string; suffix?: string; helper?: string; numeric?: boolean; inputRef?: React.Ref<TextInput> }) {
  return <View style={{ gap: 7 }}><Text style={styles.label}>{label}</Text><View style={[styles.inputWrap, error && { borderColor: '#BD4236' }, suffix === 't CH₄/yr' && { minHeight: 68 }]}><TextInput ref={inputRef} accessibilityLabel={label} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType={numeric ? 'decimal-pad' : 'default'} inputMode={numeric ? 'decimal' : 'text'} style={styles.input} placeholderTextColor={c.muted} placeholder={numeric ? 'Enter amount' : undefined} />{suffix && <Text style={[styles.suffix, { width: suffixWidths[suffix], minHeight: 19 }]}>{suffix}</Text>}</View>{helper && <Body muted style={styles.small}>{helper}</Body>}{Boolean(error) && <Text accessibilityRole="alert" style={styles.fieldError}>{error}</Text>}</View>;
}
export function Options({ label, options, value, onChange, error, multi = false, inputRef }: { label: string; options: readonly string[]; value: string | string[]; onChange: (value: string) => void; error?: string; multi?: boolean; inputRef?: React.Ref<View> }) {
  const designRows = optionRows[label];
  const designOptions = designRows?.flat().map(option => option.label);
  // Use fixed Figma rows only when they cover the current workflow's exact choices.
  const rows = designOptions?.length === options.length && options.every(option => designOptions.includes(option))
    ? designRows! : [options.map(option => ({ label: option, width: 0 }))];
  return <View style={{ gap: 9 }}><Text style={styles.label}>{label}</Text>{rows.map((row, index) => <View key={index} style={styles.options}>{row.filter(option => options.includes(option.label)).map(option => {
    const selected = Array.isArray(value) ? value.includes(option.label) : value === option.label;
    return <Pressable ref={index === 0 && option.label === rows[0][0]?.label ? inputRef : undefined} key={option.label} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={{ checked: selected }} aria-checked={selected} accessibilityLabel={`${label}: ${option.label}`} onPress={() => onChange(option.label)} style={({ pressed }) => [styles.option, option.width ? { width: option.width, maxWidth: '100%' } : {}, selected && styles.optionSelected, pressed && { opacity: 0.7 }]}><Text style={[styles.optionText, selected && { color: c.primary }]}>{option.label}</Text></Pressable>;
  })}</View>)}{error && <Text accessibilityRole="alert" style={styles.fieldError}>{error}</Text>}</View>;
}
export function ProgressRing({ value, size = 98 }: { value: number; size?: number }) { const radius = 39, circumference = 2 * Math.PI * radius; return <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`${value}% prepared`}><Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}><Circle cx="50" cy="50" r={radius} stroke={c.pale} strokeWidth="9" fill="none" /><Circle cx="50" cy="50" r={radius} stroke={c.primary} strokeWidth="9" fill="none" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - value / 100)} strokeLinecap="round" rotation="-90" origin="50,50" /></Svg><Text style={{ fontFamily: 'DM_Sans_700Bold', color: c.dark, fontSize: 25 }}>{value}%</Text><Text style={{ color: c.muted, fontSize: 11 }}>prepared</Text></View>; }
export function MetricCard({ label, value, hint, children }: { label: string; value?: string; hint?: string; icon?: IconName; children?: React.ReactNode }) { return <Card style={{ flex: 1, minWidth: 0 }}><Text style={styles.metricLabel}>{label}</Text>{value && <Text style={styles.metricValue}>{value}</Text>}{hint && <Body muted style={[styles.small, ['Estimated ACCUs', 'Compliance burden'].includes(label) && { minHeight: 38 }]}>{hint}</Body>}{children}</Card>; }
export function StatusBadge({ status }: { status: Eligibility }) { return <View style={[styles.badge, status !== 'likely_compatible' && { backgroundColor: c.warningBg }]}><Text style={[styles.badgeText, status !== 'likely_compatible' && { color: c.warning }]}>{status === 'likely_compatible' ? '✓ ' : '○ '}{eligibilityLabel[status]}</Text></View>; }
export function DisclaimerCard() { return <Card style={{ backgroundColor: '#EEF4F9' }}><Text style={[styles.label, { color: c.dark }]}>Indicative estimate only.</Text><Body muted style={[styles.small, { minHeight: 76 }]}>{DISCLAIMER}</Body></Card>; }
export function EmptyState({ title, text, action, onPress, textHeight = 46 }: { title: string; text: string; action?: string; onPress?: () => void; textHeight?: number }) { return <Card pale><Heading small>{title}</Heading><Body muted style={{ minHeight: textHeight }}>{text}</Body>{action && onPress && <Button title={action} onPress={onPress} icon="arrow-right" />}</Card>; }
export const money = (value: number) => `A$${Math.round(value).toLocaleString('en-AU')}`;
export const number = (value: number, digits = 0) => value.toLocaleString('en-AU', { maximumFractionDigits: digits });
export const shortDate = (value: string) => new Date(value).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 54, paddingBottom: 36 }, container: { width: '100%', maxWidth: 680, alignSelf: 'center', gap: 18 },
  heading: { fontFamily: 'DM_Sans_700Bold', fontSize: 32, lineHeight: 38, color: c.dark, letterSpacing: 0 }, body: { fontFamily: 'DM_Sans_400Regular', color: c.text, fontSize: 15, lineHeight: 23 },
  card: { borderRadius: 20, paddingVertical: 18, paddingLeft: 18, paddingRight: 16, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, gap: 12 },
  button: { minHeight: 52, borderRadius: 15, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 12, paddingHorizontal: 20 }, secondary: { backgroundColor: c.pale, borderWidth: 1, borderColor: c.border }, buttonText: { flexShrink: 1, minHeight: 20, overflow: 'visible', color: c.white, fontFamily: 'DM_Sans_700Bold', fontSize: 15, lineHeight: 20, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 }, grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 }, header: { flexDirection: 'row', alignItems: 'center', gap: 9 }, back: { width: 28, height: 38, justifyContent: 'center' }, backText: { color: c.primary, fontFamily: 'DM_Sans_700Bold', fontSize: 32, lineHeight: 38 }, step: { width: 50, color: c.muted, fontFamily: 'DM_Sans_400Regular', fontSize: 12, lineHeight: 19 },
  track: { height: 5, backgroundColor: c.pale, overflow: 'hidden' }, progress: { height: 5, backgroundColor: c.leaf, borderRadius: 3 }, mode: { flexDirection: 'row', gap: 6, alignItems: 'center' }, modeText: { fontFamily: 'DM_Sans_500Medium', fontSize: 11, lineHeight: 16, color: c.muted },
  label: { fontFamily: 'DM_Sans_700Bold', fontSize: 13, lineHeight: 19, color: c.text }, inputWrap: { minHeight: 53, borderRadius: 13, borderWidth: 1, borderColor: c.border, backgroundColor: c.white, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingLeft: 14, paddingRight: 12, gap: 8 }, input: { flex: 1, minWidth: 0, padding: 0, fontFamily: 'DM_Sans_400Regular', color: c.text, fontSize: 15, lineHeight: 23, minHeight: 23 }, suffix: { fontFamily: 'DM_Sans_400Regular', fontSize: 12, lineHeight: 19, color: c.muted },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, option: { minHeight: 43, borderWidth: 1, borderColor: c.border, borderRadius: 12, backgroundColor: c.white, paddingLeft: 13, paddingRight: 11, paddingVertical: 11, justifyContent: 'center' }, optionSelected: { backgroundColor: c.pale, borderColor: c.primary }, optionText: { fontFamily: 'DM_Sans_400Regular', fontSize: 12, lineHeight: 19, color: c.muted },
  small: { fontFamily: 'DM_Sans_400Regular', fontSize: 12, lineHeight: 19 }, fieldError: { fontSize: 12, lineHeight: 19, color: c.dark, fontFamily: 'DM_Sans_400Regular' }, error: { padding: 18, backgroundColor: '#FFF0EA', borderRadius: 20, gap: 12 },
  metricLabel: { fontFamily: 'DM_Sans_400Regular', fontSize: 12, lineHeight: 19, color: c.text }, metricValue: { fontFamily: 'DM_Sans_700Bold', fontSize: 22, lineHeight: 29, color: c.dark }, badge: { alignSelf: 'flex-start', minWidth: 150, backgroundColor: c.pale, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 }, badgeText: { fontFamily: 'DM_Sans_400Regular', color: c.primary, fontSize: 12, lineHeight: 19 },
});
