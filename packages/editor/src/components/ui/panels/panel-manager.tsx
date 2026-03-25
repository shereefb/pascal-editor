'use client'

import { type AnyNodeId, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import useEditor from '../../../store/use-editor'
import { CeilingPanel } from './ceiling-panel'
import { DoorPanel } from './door-panel'
import { ItemPanel } from './item-panel'
import { ReferencePanel } from './reference-panel'
import { RoofPanel } from './roof-panel'
import { RoofSegmentPanel } from './roof-segment-panel'
import { SlabPanel } from './slab-panel'
import { WallPanel } from './wall-panel'
import { WindowPanel } from './window-panel'
import { PostPanel } from './post-panel'
import { BeamPanel } from './beam-panel'
import { HeaderPanel } from './header-panel'
import { JoistPanel } from './joist-panel'
import { ShearWallPanel } from './shear-wall-panel'
import { BracingPanel } from './bracing-panel'
import { HoldDownPanel } from './hold-down-panel'

export function PanelManager() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const selectedReferenceId = useEditor((s) => s.selectedReferenceId)
  const nodes = useScene((s) => s.nodes)

  // Show reference panel if a reference is selected
  if (selectedReferenceId) {
    return <ReferencePanel />
  }

  // Show appropriate panel based on selected node type
  if (selectedIds.length === 1) {
    const selectedNode = selectedIds[0]
    const node = nodes[selectedNode as AnyNodeId]
    if (node) {
      switch (node.type) {
        case 'item':
          return <ItemPanel />
        case 'roof':
          return <RoofPanel />
        case 'roof-segment':
          return <RoofSegmentPanel />
        case 'slab':
          return <SlabPanel />
        case 'ceiling':
          return <CeilingPanel />
        case 'wall':
          return <WallPanel />
        case 'door':
          return <DoorPanel />
        case 'window':
          return <WindowPanel />
        case 'post':
          return <PostPanel />
        case 'beam':
          return <BeamPanel />
        case 'header':
          return <HeaderPanel />
        case 'joist':
          return <JoistPanel />
        case 'shear-wall':
          return <ShearWallPanel />
        case 'bracing':
          return <BracingPanel />
        case 'hold-down':
          return <HoldDownPanel />
      }
    }
  }

  return null
}
