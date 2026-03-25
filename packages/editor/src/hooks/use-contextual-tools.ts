import { type AnyNodeId, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useMemo } from 'react'
import useEditor, { type FrameTool, type StructureTool, type Tool } from '../store/use-editor'

export function useContextualTools(): Tool[] {
  const selection = useViewer((s) => s.selection)
  const nodes = useScene((s) => s.nodes)
  const phase = useEditor((s) => s.phase)
  const structureLayer = useEditor((s) => s.structureLayer)

  return useMemo(() => {
    // Frame phase tools
    if (phase === 'frame') {
      const defaultFrameTools: FrameTool[] = ['post', 'beam', 'header', 'joist', 'shear-wall', 'bracing', 'hold-down']

      if (selection.selectedIds.length === 0) return defaultFrameTools

      const selectedTypes = new Set(
        selection.selectedIds.map((id) => nodes[id as AnyNodeId]?.type).filter(Boolean),
      )

      if (selectedTypes.has('post')) return ['beam', 'bracing', 'hold-down', 'post'] as FrameTool[]
      if (selectedTypes.has('beam')) return ['post', 'joist', 'beam'] as FrameTool[]

      return defaultFrameTools
    }

    // If we are in the zones layer, only zone tool is relevant
    if (structureLayer === 'zones') {
      return ['zone'] as StructureTool[]
    }

    // Default tools when nothing is selected
    const defaultTools: StructureTool[] = ['wall', 'slab', 'ceiling', 'roof', 'door', 'window']

    if (selection.selectedIds.length === 0) {
      return defaultTools
    }

    // Get types of selected nodes
    const selectedTypes = new Set(
      selection.selectedIds.map((id) => nodes[id as AnyNodeId]?.type).filter(Boolean),
    )

    // If a wall is selected, prioritize wall-hosted elements
    if (selectedTypes.has('wall')) {
      return ['window', 'door', 'wall'] as StructureTool[]
    }

    // If a slab is selected, prioritize slab editing
    if (selectedTypes.has('slab')) {
      return ['slab', 'wall'] as StructureTool[]
    }

    // If a ceiling is selected, prioritize ceiling editing
    if (selectedTypes.has('ceiling')) {
      return ['ceiling'] as StructureTool[]
    }

    // If a roof is selected, prioritize roof editing
    if (selectedTypes.has('roof')) {
      return ['roof'] as StructureTool[]
    }

    return defaultTools
  }, [selection.selectedIds, nodes, phase, structureLayer])
}
