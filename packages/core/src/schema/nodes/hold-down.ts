import dedent from 'dedent'
import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'

export const HoldDownNode = BaseNode.extend({
  id: objectId('hold-down'),
  type: nodeType('hold-down'),
  position: z.tuple([z.number(), z.number()]),
  model: z.string().optional(),
  capacityLbs: z.number().optional(),
}).describe(
  dedent`
  Hold-down node - connection hardware/anchor
  - position: [x, z] placement point in level coordinate system
  - model: hardware model (e.g., "HDU2", "HDU5", "PAHD")
  - capacityLbs: rated capacity in pounds
  `,
)
export type HoldDownNode = z.infer<typeof HoldDownNode>
