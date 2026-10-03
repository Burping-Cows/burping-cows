import { expect, it } from 'vitest';
import { calculateFlare } from '../src/lib/flare';
const input = { biogasVolumeM3: 100000, methaneFraction: .60, destructionEfficiency: .98, projectEmissionsTCO2e: 20 };
it('F01: preserves unrounded methane and abatement values', () => {
  const r = calculateFlare(input);
  expect(r.methaneDestroyedM3).toBeCloseTo(58800, 8);
  expect(r.methaneMassTonnes).toBeCloseTo(39.88992, 8);
  expect(r.grossAbatementTCO2e).toBeCloseTo(1116.91776, 8);
  expect(r.netAbatementTCO2e).toBeCloseTo(1096.91776, 8);
  expect(r.wholePlanningUnits).toBe(1096);
});
it('accepts explicit zero gas and retains a negative raw diagnostic without negative credits', () => {
  expect(calculateFlare({ ...input, biogasVolumeM3: 0 }).grossAbatementTCO2e).toBe(0);
  const r = calculateFlare({ ...input, projectEmissionsTCO2e: 2000 });
  expect(r.rawNetAbatementTCO2e).toBeLessThan(0); expect(r.netAbatementTCO2e).toBe(0);
});
it.each([{ biogasVolumeM3: -1 }, { methaneFraction: 1.1 }, { destructionEfficiency: 1.1 }, { projectEmissionsTCO2e: -1 }])('rejects invalid physical inputs %j', bad => expect(() => calculateFlare({ ...input, ...bad })).toThrow());
