import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AssessmentExit } from '../src/components/AssessmentExit';
import Home from '../src/app/(tabs)/home';
import { demoInput } from '../src/lib/demo';
const mocks = vi.hoisted(() => ({
  pause: vi.fn(), dismissTo: vi.fn(), push: vi.fn(), startNew: vi.fn(),
  draft: { started: true, step: 4 },
}));
vi.mock('expo-router', () => ({ router: { dismissTo: mocks.dismissTo, push: mocks.push } }));
vi.mock('react-native', () => ({ View: 'View' }));
vi.mock('../src/components/Illustration', () => ({ Logo: 'Logo', FarmIllustration: 'FarmIllustration' }));
vi.mock('../src/components/ui', () => ({ Button: 'Button', ErrorNotice: 'ErrorNotice', Screen: 'Screen', Body: 'Body', Card: 'Card', Heading: 'Heading', MetricCard: 'MetricCard', StatusBadge: 'StatusBadge', number: String, styles: {} }));
vi.mock('../src/state/AppProvider', () => ({
  useApp: () => ({ pauseAssessment: mocks.pause, records: [], draft: mocks.draft, startNew: mocks.startNew }),
  errorMessage: (error: Error) => error.message,
}));
let renderer: ReactTestRenderer;
const button = (title: string) => renderer.root.findAllByType('Button' as React.ElementType).find(node => node.props.title === title)!;
beforeEach(() => {
  mocks.pause.mockReset().mockResolvedValue(undefined);
  mocks.dismissTo.mockReset(); mocks.push.mockReset(); mocks.startNew.mockReset();
  mocks.draft.step = 4;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});
afterEach(async () => { if (renderer) await act(async () => renderer.unmount()); });
it('waits for the current form to be persisted before returning Home', async () => {
  let finish!: () => void;
  mocks.pause.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
  const incomplete = { ...demoInput, flareType: '' as const };
  await act(async () => { renderer = create(<AssessmentExit step={2} getValues={() => incomplete} />); });
  await act(async () => button('Save & exit').props.onPress());
  expect(mocks.pause).toHaveBeenCalledWith(2, incomplete);
  expect(mocks.dismissTo).not.toHaveBeenCalled();
  expect(button('Save & exit').props.loading).toBe(true);
  await act(async () => finish());
  expect(mocks.dismissTo).toHaveBeenCalledWith('/(tabs)/home');
});
it('keeps the user on the form with a retryable error when saving fails', async () => {
  mocks.pause.mockRejectedValueOnce(new Error('Storage unavailable'));
  await act(async () => { renderer = create(<AssessmentExit step={3} />); });
  await act(async () => button('Save & exit').props.onPress());
  expect(mocks.dismissTo).not.toHaveBeenCalled();
  expect(renderer.root.findByType('ErrorNotice' as React.ElementType).props.message).toBe('Storage unavailable');
  expect(button('Save & exit').props.loading).toBe(false);
  await act(async () => button('Save & exit').props.onPress());
  expect(mocks.dismissTo).toHaveBeenCalledWith('/(tabs)/home');
});
it('resumes the saved step from Home without starting a new assessment', async () => {
  await act(async () => { renderer = create(<Home />); });
  await act(async () => button('Resume assessment').props.onPress());
  expect(mocks.push).toHaveBeenCalledWith('/assessment/technical');
  expect(mocks.startNew).not.toHaveBeenCalled();
  mocks.draft.step = 7;
  await act(async () => renderer.update(<Home />));
  await act(async () => button('Resume assessment').props.onPress());
  expect(mocks.push).toHaveBeenLastCalledWith('/assessment/action-plan');
});
