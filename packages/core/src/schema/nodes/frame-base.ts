import { z } from 'zod'

export const FrameMaterial = z.enum(['wood', 'steel', 'engineered']).default('wood')
export type FrameMaterial = z.infer<typeof FrameMaterial>

export const WoodSpecies = z.enum(['df', 'spf', 'sp', 'hem-fir'])
export type WoodSpecies = z.infer<typeof WoodSpecies>

export const WoodGrade = z.enum(['no1', 'no2', 'select-structural'])
export type WoodGrade = z.infer<typeof WoodGrade>

/** Shared properties for all framing nodes */
export const FrameBaseProps = {
  material: FrameMaterial,
  species: WoodSpecies.optional(),
  grade: WoodGrade.optional(),
  designation: z.string().optional(),
}
