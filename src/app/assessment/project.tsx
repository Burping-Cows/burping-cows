import { AssessmentStep } from '../../components/AssessmentStep';
import { ProjectFields } from '../../components/AssessmentForm';
import { projectSchema } from '../../lib/validation';
export default function Project() { return <AssessmentStep title="Project route" step={2} schema={projectSchema} next="/assessment/screening" Fields={ProjectFields} />; }
