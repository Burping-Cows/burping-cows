import { AssessmentStep } from '../../components/AssessmentStep';
import { FinanceFields } from '../../components/AssessmentForm';
import { financeSchema } from '../../lib/validation';
export default function Finance() { return <AssessmentStep title="Financial scenario" step={5} schema={financeSchema} next="/assessment/results" Fields={FinanceFields} />; }
