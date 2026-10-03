import { AssessmentStep } from '../../components/AssessmentStep';
import { ScreeningFields } from '../../components/AssessmentForm';
import { screeningSchema } from '../../lib/validation';
export default function Screening() { return <AssessmentStep title="Scheme screening" step={3} schema={screeningSchema} next="/assessment/technical" Fields={ScreeningFields} />; }
