import dedent from 'dedent'
import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'
import { FrameBaseProps } from './frame-base'

export const BracingNode = BaseNode.extend({
  id: objectId('bracing'),
  type: nodeType('bracing'),
  ...FrameBaseProps,
  start: z.tuple([z.number(), z.number()]),
  end: z.tuple([z.number(), z.number()]),
  connectionType: z.string().optional(),
}).describe(
  dedent`
  Bracing node - diagonal structural member
  - start/end: [x, z] endpoints in level coordinate system
  - connectionType: connection detail (e.g., "bolted", "nailed")
  - material: wood, steel, or engineered
  - designation: member size
  `,
)
export type BracingNode = z.infer<typeof BracingNode>
