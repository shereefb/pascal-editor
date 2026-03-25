import dedent from 'dedent'
import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'
import { FrameBaseProps } from './frame-base'

export const HeaderNode = BaseNode.extend({
  id: objectId('header'),
  type: nodeType('header'),
  ...FrameBaseProps,
  start: z.tuple([z.number(), z.number()]),
  end: z.tuple([z.number(), z.number()]),
  plyCount: z.number().int().min(1).max(3).default(2),
}).describe(
  dedent`
  Header node - structural member over door/window openings
  - start/end: [x, z] endpoints in level coordinate system
  - plyCount: number of plies (default 2 for built-up headers)
  - material: wood, steel, or engineered
  - designation: member size (e.g., "2x12", "3-1/2x9-1/4 LVL")
  `,
)
export type HeaderNode = z.infer<typeof HeaderNode>
