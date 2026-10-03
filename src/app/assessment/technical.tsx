import { AssessmentStep } from '../../components/AssessmentStep';
import { TechnicalFields } from '../../components/AssessmentForm';
import { technicalSchema } from '../../lib/validation';
export default function Technical() { return <AssessmentStep title="Technical estimate" step={4} schema={technicalSchema} next="/assessment/finance" Fields={TechnicalFields} />; }
