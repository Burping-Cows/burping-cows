import { ActionTask as Task } from '../types/assessment';
import { Body, Card, Heading, Icon } from './ui';
export function ActionTask({ task }: { task: Task }) { return <Card pale={task.status === 'complete'}><Icon name={task.status === 'complete' ? 'check-circle-outline' : task.priority === 'high' ? 'alert-circle-outline' : 'clipboard-outline'} /><Body>{task.priority.toUpperCase()} PRIORITY · {task.status.replaceAll('_',' ')}</Body><Heading small>{task.title}</Heading><Body muted>{task.reason}</Body><Body>Evidence: {task.evidenceRequired}</Body></Card>; }
