import { z } from 'zod';
import { FlareResult, Assumptions } from '../types/assessment';
import { defaultAssumptions } from '../config/assumptions';
const core = z.object({ biogasVolumeM3: z.number().finite().min(0), methaneFraction: z.number().finite().min(0).max(1), destructionEfficiency: z.number().finite().min(0).max(1), projectEmissionsTCO2e: z.number().finite().min(0) });
export function calculateFlare(values: z.infer<typeof core>, assumptions: Assumptions = defaultAssumptions): FlareResult {
  const i = core.parse(values);
  const methaneDestroyedM3 = i.biogasVolumeM3 * i.methaneFraction * i.destructionEfficiency;
  const methaneMassTonnes = methaneDestroyedM3 * assumptions.methaneDensityTonnesPerM3;
  const grossAbatementTCO2e = methaneMassTonnes * assumptions.methaneGwp;
  const rawNetAbatementTCO2e = grossAbatementTCO2e - i.projectEmissionsTCO2e;
  const netAbatementTCO2e = Math.max(0, rawNetAbatementTCO2e);
  return { ...i, methaneDestroyedM3, methaneMassTonnes, grossAbatementTCO2e, rawNetAbatementTCO2e, netAbatementTCO2e, indicativeAccuEquivalent: netAbatementTCO2e, wholePlanningUnits: Math.floor(netAbatementTCO2e) };
}
