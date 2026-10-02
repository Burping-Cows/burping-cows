import React from 'react';
import { View, Text } from 'react-native';
import { AssessmentInput, CalculationResult } from '../types/assessment';
import { Body, Card, DisclaimerCard, Heading, Icon, MetricCard, ProgressRing, StatusBadge, money, number, styles } from './ui';
import { FarmIllustration } from './Illustration';
import { theme } from '../config/theme';
export function ResultsView({ input, result }: { input: AssessmentInput; result: CalculationResult }) {
  return <>
    <Card pale><View style={styles.row}><Icon name="leaf" size={36} /><View style={{ flex: 1, gap: 3 }}><Body style={{ fontSize: 12 }}>Estimated emissions reduction</Body><Heading>{number(result.co2e, 1)} <Text style={{ fontSize: 17 }}>tCO₂-e/yr</Text></Heading><Body muted>{number(result.methaneTonnes, 2)} tonnes CH₄ captured / reduced each year</Body></View></View><FarmIllustration height={115} captured /></Card>
    <StatusBadge status={result.eligibility} />
    <Card><Heading small>{result.verdict}</Heading>{result.eligibilityReasons.map(reason => <Body muted key={reason}>{reason}</Body>)}</Card>
    <View style={styles.grid}>
      <MetricCard label="Estimated ACCUs" value={number(result.accus)} hint="ACCUs / year · indicative" icon="chart-bar" />
      <MetricCard label="Gross carbon value" value={`${money(result.annualValue)}/yr`} hint={`At ${money(input.accuPrice)}/ACCU`} icon="cash-multiple" />
      <MetricCard label="Compliance burden" value={result.burden} hint="Demonstration planning category" icon="scale-balance" />
      <MetricCard label="Readiness" icon="check-circle-outline" hint={result.readinessLabel}><ProgressRing value={result.readiness} /></MetricCard>
    </View>
    <Card><Heading small>Planning costs</Heading><Detail label="Implementation" value={input.implementationCost === undefined ? 'Not supplied' : money(input.implementationCost)} /><Detail label="Annual operating costs" value={input.annualOperatingCost === undefined ? 'Not supplied' : money(input.annualOperatingCost)} /><Detail label="Indicative compliance range" value={`${money(result.complianceRange[0])}–${money(result.complianceRange[1])}${result.burden === 'High' ? '+' : ''}`} /><Body muted style={{ fontSize: 12 }}>Indicative planning range only. Actual project development, audit and compliance costs vary significantly.</Body><View style={{ borderTopWidth: 1, borderColor: theme.colors.border, paddingTop: 12 }}><Body style={{ fontFamily: 'DM_Sans_700Bold' }}>Indicative payback: {result.breakEvenYears === null ? 'Not available' : `${number(result.breakEvenYears, 1)} years`}</Body><Body muted style={{ fontSize: 12 }}>Implementation plus midpoint compliance cost ÷ annual gross carbon value. Excludes operating costs, financing, tax, energy revenue, and changes in credit issuance or price.</Body></View></Card>
    <Card><Heading small>Five-year gross value</Heading><Heading>{money(result.fiveYearValue)}</Heading><Body muted>Cumulative value at a constant price · indicative only</Body><View style={{ height: 165, flexDirection: 'row', alignItems: 'flex-end', gap: 10, borderBottomWidth: 1, borderColor: theme.colors.border, paddingTop: 20 }} accessibilityLabel={`Cumulative gross value for years one to five: ${[1, 2, 3, 4, 5].map(year => money(year * result.annualValue)).join(', ')}`}>
      {[1, 2, 3, 4, 5].map(year => <View key={year} style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 5 }}><Text style={{ color: theme.colors.muted, fontSize: 10 }}>{money(year * result.annualValue)}</Text><View style={{ height: result.annualValue > 0 ? `${year * 16}%` : 2, width: '80%', backgroundColor: year === 5 ? theme.colors.primary : '#7DBA99', borderTopLeftRadius: 5, borderTopRightRadius: 5 }} /><Text style={{ color: theme.colors.muted, fontSize: 11, paddingBottom: 6 }}>Year {year}</Text></View>)}
    </View><Body muted style={{ fontSize: 12 }}>Illustrates five years of constant annual estimates, not a forecast or net profit. Project lifetime: {input.projectLifetimeYears ?? '—'} years.</Body></Card>
    <DisclaimerCard />
  </>;
}
function Detail({ label, value }: { label: string; value: string }) { return <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}><Body muted>{label}</Body><Body style={{ fontFamily: 'DM_Sans_500Medium' }}>{value}</Body></View>; }
