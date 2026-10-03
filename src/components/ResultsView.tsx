import React from 'react';
import { View, Text } from 'react-native';
import { AssessmentInput, CalculationResult } from '../types/assessment';
import { Body, Card, DisclaimerCard, Heading, MetricCard, StatusBadge, money, number, styles } from './ui';
import { FarmIllustration } from './Illustration';
import { theme } from '../config/theme';

export function OpportunityMetrics({ input, result }: { input: AssessmentInput; result: CalculationResult }) {
  return <>
    <View style={styles.grid}>
      <MetricCard label="Estimated ACCUs" value={number(result.accus)} hint="ACCUs / year · indicative" />
      <MetricCard label="Gross carbon value" value={money(result.annualValue) + '/yr'} hint={'At ' + money(input.accuPrice) + '/ACCU'} />
    </View>
    <View style={styles.grid}>
      <MetricCard label="Compliance burden" value={result.burden} hint="Demonstration planning category" />
      <MetricCard label="Readiness" value={result.readiness + '%'} hint={result.readinessLabel} />
    </View>
  </>;
}
export function NextSteps({ steps }: { steps: string[] }) {
  return <>{steps.map((step, index) => <Card key={step}><Body muted style={{ minHeight: 46 }}>{index + 1}. {step}</Body></Card>)}</>;
}
export function ResultsView({ input, result, details = false }: { input: AssessmentInput; result: CalculationResult; details?: boolean }) {
  return <>
    <Card pale>
      <Body design="11:510">Estimated emissions reduction</Body>
      <Heading design="11:511">{number(result.co2e, 1)} tCO₂-e/yr</Heading>
      <Body muted design="11:512">{number(result.methaneTonnes, 2)} tonnes CH₄ captured / reduced each year</Body>
      <FarmIllustration height={115} captured variant={details ? 'details' : undefined} />
    </Card>
    <StatusBadge status={result.eligibility} />
    <Card><Heading small design="11:560">{result.verdict}</Heading>{result.eligibilityReasons.map(reason => <Body muted design="11:561" key={reason}>{reason}</Body>)}</Card>
    <OpportunityMetrics input={input} result={result} />
    <Card>
      <Heading small>Planning costs</Heading>
      <Body muted style={styles.small}>Implementation</Body>
      <Body>{input.implementationCost === undefined ? 'Not supplied' : money(input.implementationCost)}</Body>
      <Body muted style={styles.small}>Annual operating costs</Body>
      <Body>{input.annualOperatingCost === undefined ? 'Not supplied' : money(input.annualOperatingCost)}</Body>
      <Body muted style={styles.small}>Indicative compliance range</Body>
      <Body>{money(result.complianceRange[0])}–{money(result.complianceRange[1])}{result.burden === 'High' ? '+' : ''}</Body>
      <Body muted design="11:588">Indicative planning range only. Actual project development, audit and compliance costs vary significantly.</Body>
      <Text style={styles.label}>Indicative payback: {result.breakEvenYears === null ? 'Not available' : number(result.breakEvenYears, 1) + ' years'}</Text>
      <Body muted design="11:590">Implementation plus midpoint compliance cost ÷ annual gross carbon value. Excludes operating costs, financing, tax, energy revenue, and changes in credit issuance or price.</Body>
    </Card>
    <Card>
      <Heading small>Five-year gross value</Heading><Heading>{money(result.fiveYearValue)}</Heading>
      <Body muted design="11:594">Cumulative value at a constant price · indicative only</Body>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }} accessibilityLabel={'Cumulative gross value for years one to five: ' + [1, 2, 3, 4, 5].map(year => money(year * result.annualValue)).join(', ')}>
        {[1, 2, 3, 4, 5].map(year => <View key={year} style={{ flex: 1, alignItems: 'flex-start', gap: 5 }}>
          <Text style={[styles.small, { color: theme.colors.muted, textAlign: 'center', width: '100%' }]}>{result.annualValue * year >= 1000 ? Math.round(year * result.annualValue / 1000) + 'k' : number(year * result.annualValue)}</Text>
          <View style={{ height: result.annualValue > 0 ? year * 23 : 2, width: 46, maxWidth: '100%', backgroundColor: year === 5 ? theme.colors.primary : theme.colors.leaf, borderRadius: 5 }} />
          <Text style={[styles.modeText, { textAlign: 'center', width: '100%' }]}>Year {year}</Text>
        </View>)}
      </View>
      <Body muted design="11:616">Illustrates five years of constant annual estimates, not a forecast or net profit. Project lifetime: {input.projectLifetimeYears ?? '—'} years.</Body>
    </Card>
    <DisclaimerCard />
  </>;
}
