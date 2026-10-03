import { AssessmentStep } from '../../components/AssessmentStep';
import { FarmFields } from '../../components/AssessmentForm';
import { farmSchema } from '../../lib/validation';
export default function Farm() { return <AssessmentStep title="Farm & baseline" step={1} schema={farmSchema} next="/assessment/project" Fields={FarmFields} />; }
