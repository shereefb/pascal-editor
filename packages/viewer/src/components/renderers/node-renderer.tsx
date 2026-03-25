'use client'

import { type AnyNode, useScene } from '@pascal-app/core'
import { BeamRenderer } from './beam/beam-renderer'
import { BracingRenderer } from './bracing/bracing-renderer'
import { BuildingRenderer } from './building/building-renderer'
import { CeilingRenderer } from './ceiling/ceiling-renderer'
import { DoorRenderer } from './door/door-renderer'
import { GuideRenderer } from './guide/guide-renderer'
import { HeaderRenderer } from './header/header-renderer'
import { HoldDownRenderer } from './hold-down/hold-down-renderer'
import { ItemRenderer } from './item/item-renderer'
import { JoistRenderer } from './joist/joist-renderer'
import { LevelRenderer } from './level/level-renderer'
import { PostRenderer } from './post/post-renderer'
import { RoofRenderer } from './roof/roof-renderer'
import { RoofSegmentRenderer } from './roof-segment/roof-segment-renderer'
import { ScanRenderer } from './scan/scan-renderer'
import { ShearWallRenderer } from './shear-wall/shear-wall-renderer'
import { SiteRenderer } from './site/site-renderer'
import { SlabRenderer } from './slab/slab-renderer'
import { WallRenderer } from './wall/wall-renderer'
import { WindowRenderer } from './window/window-renderer'
import { ZoneRenderer } from './zone/zone-renderer'

export const NodeRenderer = ({ nodeId }: { nodeId: AnyNode['id'] }) => {
  const node = useScene((state) => state.nodes[nodeId])

  if (!node) return null

  return (
    <>
      {node.type === 'site' && <SiteRenderer node={node} />}
      {node.type === 'building' && <BuildingRenderer node={node} />}
      {node.type === 'ceiling' && <CeilingRenderer node={node} />}
      {node.type === 'level' && <LevelRenderer node={node} />}
      {node.type === 'item' && <ItemRenderer node={node} />}
      {node.type === 'slab' && <SlabRenderer node={node} />}
      {node.type === 'wall' && <WallRenderer node={node} />}
      {node.type === 'door' && <DoorRenderer node={node} />}
      {node.type === 'window' && <WindowRenderer node={node} />}
      {node.type === 'zone' && <ZoneRenderer node={node} />}
      {node.type === 'roof' && <RoofRenderer node={node} />}
      {node.type === 'roof-segment' && <RoofSegmentRenderer node={node} />}
      {node.type === 'scan' && <ScanRenderer node={node} />}
      {node.type === 'guide' && <GuideRenderer node={node} />}
      {node.type === 'post' && <PostRenderer node={node} />}
      {node.type === 'beam' && <BeamRenderer node={node} />}
      {node.type === 'header' && <HeaderRenderer node={node} />}
      {node.type === 'joist' && <JoistRenderer node={node} />}
      {node.type === 'shear-wall' && <ShearWallRenderer node={node} />}
      {node.type === 'bracing' && <BracingRenderer node={node} />}
      {node.type === 'hold-down' && <HoldDownRenderer node={node} />}
    </>
  )
}
