import z from 'zod'
import { BeamNode } from './nodes/beam'
import { BracingNode } from './nodes/bracing'
import { BuildingNode } from './nodes/building'
import { CeilingNode } from './nodes/ceiling'
import { DoorNode } from './nodes/door'
import { GuideNode } from './nodes/guide'
import { HeaderNode } from './nodes/header'
import { HoldDownNode } from './nodes/hold-down'
import { ItemNode } from './nodes/item'
import { JoistNode } from './nodes/joist'
import { LevelNode } from './nodes/level'
import { PostNode } from './nodes/post'
import { RoofNode } from './nodes/roof'
import { RoofSegmentNode } from './nodes/roof-segment'
import { ScanNode } from './nodes/scan'
import { ShearWallNode } from './nodes/shear-wall'
import { SiteNode } from './nodes/site'
import { SlabNode } from './nodes/slab'
import { WallNode } from './nodes/wall'
import { WindowNode } from './nodes/window'
import { ZoneNode } from './nodes/zone'

export const AnyNode = z.discriminatedUnion('type', [
  SiteNode,
  BuildingNode,
  LevelNode,
  WallNode,
  ItemNode,
  ZoneNode,
  SlabNode,
  CeilingNode,
  RoofNode,
  RoofSegmentNode,
  ScanNode,
  GuideNode,
  WindowNode,
  DoorNode,
  PostNode,
  BeamNode,
  HeaderNode,
  JoistNode,
  ShearWallNode,
  BracingNode,
  HoldDownNode,
])

export type AnyNode = z.infer<typeof AnyNode>
export type AnyNodeType = AnyNode['type']
export type AnyNodeId = AnyNode['id']
