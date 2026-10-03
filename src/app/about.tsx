import React from 'react';
import { Body, Card, DisclaimerCard, Heading, Screen } from '../components/ui';
import { Logo } from '../components/Illustration';
import { useApp } from '../state/AppProvider';
import { cloudConfigured } from '../lib/supabase';
export default function About() {
  const { assumptions: a } = useApp();
  return <Screen title="About Burping Cows" back>
    <Logo size={90} /><Heading design="11:943">From methane to money, minus the mystery.</Heading>
    <Body design="11:944">For Australian dairy and piggery farmers exploring whether a methane project may be worth investigating before paying for consultants, monitoring, and audits.</Body>
    <Card><Heading small>Demonstration assumptions</Heading><Body muted design="11:947">{a.methodologyNote}</Body><Body>CH₄ global warming potential: {a.methaneGwp}</Body><Body>Methane density: {a.methaneDensity} kg/m³</Body><Body design="11:950">Dairy effluent factor: {a.dairyFactor} kg CH₄/animal/year</Body><Body design="11:951">Piggery effluent factor: {a.pigFactor} kg CH₄/animal/year</Body><Body>Default credit price: A${a.defaultAccuPrice}</Body><Body muted design="11:953">Estimated ACCUs are rounded down from estimated CO₂-e. No official baseline, leakage, emissions deductions, method eligibility checks, or issuance rules are modelled.</Body></Card>
    <Card><Heading small>Your data</Heading><Body muted design="11:956">{cloudConfigured ? 'Saved assessments use your Supabase account, or a guest session when exploring without an account. Drafts and farm defaults stay on this device and are separated by account. Guest assessments are separate from account assessments; switching accounts does not transfer them. Clearing app data or losing a guest session can make guest cloud records inaccessible.' : 'Local demo mode saves drafts and assessments on this device. Clearing app data or browser storage removes access. Local demo records are not automatically uploaded when Supabase is configured.'}</Body></Card>
    <Card><Heading small>Important limitations</Heading><Body muted design="11:959">This app does not submit ACCU applications, certify compliance, replace auditors, or integrate with the Clean Energy Regulator. Gross value and payback are not profit forecasts. Readiness is a preparation score, not audit certification.</Body><Body muted design="11:960">Not financial, legal, or regulatory advice. Consult qualified professionals before spending money or starting work.</Body></Card>
    <DisclaimerCard />
  </Screen>;
}
