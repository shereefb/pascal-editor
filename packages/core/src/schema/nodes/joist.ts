import dedent from 'dedent'
import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'
import { FrameBaseProps } from './frame-base'

export const JoistNode = BaseNode.extend({
  id: objectId('joist'),
  type: nodeType('joist'),
  ...FrameBaseProps,
  points: z.array(z.tuple([z.number(), z.number()])),
  spacingOC: z.enum(['12', '16', '24']).default('16'),
  direction: z.number().default(0),
}).describe(
  dedent`
  Joist node - repetitive floor/ceiling framing within a region
  - points: polygon boundary [x, z][] defining the joist region
  - spacingOC: on-center spacing in inches ("12", "16", "24")
  - direction: joist run direction in degrees
  - material: wood, steel, or engineered
  - designation: member size (e.g., "2x10", "2x12", "11-7/8 TJI")
  `,
)
export type JoistNode = z.infer<typeof JoistNode>
