import { router } from 'expo-router';
import { Body, Button, Card, DisclaimerCard, Heading, Screen } from '../../components/ui';
const lessons = [
  ['What is methane?','Methane is a greenhouse gas. Liquid livestock effluent can release it when organic material breaks down without oxygen. This MVP does not assess enteric methane from cow burps.'],
  ['What is an ACCU?','An Australian Carbon Credit Unit represents one tonne of carbon dioxide equivalent. Credits must be issued under the ACCU Scheme; an app estimate is not a credit.'],
  ['Why reduce animal-effluent methane?','Capturing gas and sending it to a suitable flare can destroy methane that would otherwise be released. Route fit, baseline and project emissions need careful review.'],
  ['Why does monitoring matter?','Biogas flow, methane composition, flare operation and project energy records help establish a credible abatement estimate. Unknown information becomes a preparation task.'],
  ['Why can verification be expensive?','Projects may need equipment, quality assurance, specialist development, evidence, monitoring and audits. Some costs are fixed even for small projects.'],
  ['What does Indicative ACCU Equivalent mean?','It is a planning equivalent of preliminary net tonnes CO₂-e, not a promise of issuance. Actual issuance depends on registration, methodology compliance, monitoring, reporting and CER verification.'],
] as const;
export default function Learn() { return <Screen title="A little less mystery">{lessons.map(([title,text]) => <Card key={title}><Heading small>{title}</Heading><Body>{text}</Body></Card>)}<DisclaimerCard /><Button title="About & assumptions" secondary onPress={() => router.push('/about')} /></Screen>; }
