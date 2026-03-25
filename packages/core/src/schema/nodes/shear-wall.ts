import dedent from 'dedent'
import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'

export const ShearWallNode = BaseNode.extend({
  id: objectId('shear-wall'),
  type: nodeType('shear-wall'),
  points: z.array(z.tuple([z.number(), z.number()])),
  sheathingType: z.enum(['osb', 'plywood']).default('osb'),
  nailingSchedule: z.string().default('8d @ 6/12'),
}).describe(
  dedent`
  Shear wall node - lateral force-resisting panel
  - points: polygon boundary [x, z][] defining the panel
  - sheathingType: osb or plywood
  - nailingSchedule: nail size and spacing (e.g., "8d @ 4/12")
  `,
)
export type ShearWallNode = z.infer<typeof ShearWallNode>
