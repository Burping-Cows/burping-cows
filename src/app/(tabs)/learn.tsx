import React from 'react';
import { Linking, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, Heading, Screen } from '../../components/ui';
const lessons = [
  ['What is an ACCU?', 'One Australian carbon credit unit represents one tonne of CO₂-e. Actual credits require an eligible project and verified abatement; an estimate here does not create credits.', '11:917', '11:918'],
  ['Why methane matters', 'Methane is a powerful greenhouse gas. Capturing and destroying methane from eligible manure systems can reduce emissions. This demo considers effluent methane, not methane from animal digestion.', '11:920', '11:921'],
  ['Why verification costs money', 'Project development, monitoring, reporting, and independent audits require time and expertise. Costs depend on the method and the project.', '11:923', '11:924'],
  ['Why small projects can struggle', 'Some compliance costs are fixed. A smaller carbon opportunity may produce too little gross revenue to justify those costs.', '11:926', '11:927'],
  ['Why project timing matters', 'Starting work can affect eligibility. Get advice on the applicable method and registration requirements before committing to a project.', '11:929', '11:930'],
] as const;
export default function Learn() {
  return <Screen title="A little less mystery" subtitle="The basics, without the jargon.">
    {lessons.map(([title, text, heading, body]) => <Card key={title}><Heading small design={heading}>{title}</Heading><Body muted design={body}>{text}</Body></Card>)}
    <Pressable accessibilityRole="link" accessibilityLabel="Clean Energy Regulator ACCU guidance" onPress={() => void Linking.openURL('https://cer.gov.au/schemes/australian-carbon-credit-unit-scheme')} hitSlop={10}><Body style={{ color: '#176544', textDecorationLine: 'underline' }}>Clean Energy Regulator ACCU guidance ↗</Body></Pressable>
    <Body muted design="11:932">Burping Cows provides indicative educational estimates only and does not replace Clean Energy Regulator guidance, a registered auditor, financial adviser, legal adviser or carbon project developer.</Body>
    <Button title="About & calculation assumptions" secondary onPress={() => router.push('/about')} />
  </Screen>;
}
