import dedent from 'dedent'
import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'
import { FrameBaseProps } from './frame-base'

export const BeamNode = BaseNode.extend({
  id: objectId('beam'),
  type: nodeType('beam'),
  ...FrameBaseProps,
  start: z.tuple([z.number(), z.number()]),
  end: z.tuple([z.number(), z.number()]),
  plyCount: z.number().int().min(1).max(3).default(1),
}).describe(
  dedent`
  Beam node - horizontal spanning structural member
  - start/end: [x, z] endpoints in level coordinate system
  - plyCount: number of plies (1=single, 2=double, 3=triple)
  - material: wood, steel, or engineered
  - designation: member size (e.g., "2x10", "3-1/2x11-7/8 LVL", "W8x10")
  `,
)
export type BeamNode = z.infer<typeof BeamNode>
