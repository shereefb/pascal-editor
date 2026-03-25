import dedent from 'dedent'
import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'
import { FrameBaseProps } from './frame-base'

export const PostNode = BaseNode.extend({
  id: objectId('post'),
  type: nodeType('post'),
  ...FrameBaseProps,
  position: z.tuple([z.number(), z.number()]),
  height: z.number().optional(),
}).describe(
  dedent`
  Post node - vertical structural support member
  - position: [x, z] placement point in level coordinate system
  - height: height in meters (defaults to floor height)
  - material: wood, steel, or engineered
  - designation: member size (e.g., "4x4", "6x6", "W8x10")
  - species: wood species (df, spf, sp, hem-fir)
  - grade: wood grade (no1, no2, select-structural)
  `,
)
export type PostNode = z.infer<typeof PostNode>
