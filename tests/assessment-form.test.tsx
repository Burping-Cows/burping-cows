import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { useForm, UseFormReturn } from 'react-hook-form';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NumericField, resolverFor } from '../src/components/AssessmentForm';
import { technicalSchema } from '../src/lib/validation';
import { demoInput } from '../src/lib/demo';
import { AssessmentInput } from '../src/types/assessment';
vi.mock('../src/components/ui', () => ({
  Input: (props: object) => React.createElement('input', props),
  Options: () => null, Card: () => null, Body: () => null, Button: () => null,
}));
vi.mock('../src/state/AppProvider', () => ({ useApp: () => ({ draft: { input: demoInput }, setInput: vi.fn() }) }));
let renderer: ReactTestRenderer, form: UseFormReturn<AssessmentInput>;
function Probe() {
  const current = useForm<AssessmentInput>({ defaultValues: demoInput, resolver: resolverFor(technicalSchema) });
  React.useEffect(() => { form = current; }, [current]);
  return <NumericField form={current} name="methaneFraction" label="Methane fraction" />;
}
beforeEach(async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  await act(async () => { renderer = create(<Probe />); });
});
afterEach(async () => { await act(async () => renderer.unmount()); });
it('allows typing decimal fractions without losing the decimal separator', async () => {
  const input = () => renderer.root.findByType('input');
  await act(async () => input().props.onChange('0'));
  await act(async () => input().props.onChange('0.'));
  expect(input().props.value).toBe('0.');
  await act(async () => input().props.onChange('0.60'));
  expect(input().props.value).toBe('0.60');
  expect(form.getValues('methaneFraction')).toBe(.6);
  await act(async () => { expect(await form.trigger('methaneFraction')).toBe(true); });
});
it('preserves unknown versus explicit zero and synchronizes applied defaults', async () => {
  const input = () => renderer.root.findByType('input');
  await act(async () => input().props.onChange(''));
  expect(form.getValues('methaneFraction')).toBeUndefined();
  await act(async () => input().props.onChange('0'));
  expect(form.getValues('methaneFraction')).toBe(0);
  await act(async () => form.setValue('methaneFraction', .7));
  expect(input().props.value).toBe('0.7');
});
it('rejects invalid text rather than silently turning it into zero', async () => {
  await act(async () => renderer.root.findByType('input').props.onChange('unknown'));
  await act(async () => { expect(await form.trigger('methaneFraction')).toBe(false); });
  expect(renderer.root.findByType('input').props.error).toBeTruthy();
});
