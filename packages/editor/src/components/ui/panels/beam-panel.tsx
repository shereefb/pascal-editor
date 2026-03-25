'use client'

import { type AnyNode, type AnyNodeId, useScene, type BeamNode } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useCallback } from 'react'
import { PanelSection } from '../controls/panel-section'
import { SegmentedControl } from '../controls/segmented-control'
import { PanelWrapper } from './panel-wrapper'

export function BeamPanel() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const setSelection = useViewer((s) => s.setSelection)
  const nodes = useScene((s) => s.nodes)
  const updateNode = useScene((s) => s.updateNode)

  const selectedId = selectedIds[0]
  const node = selectedId ? (nodes[selectedId as AnyNode['id']] as BeamNode | undefined) : undefined

  const handleUpdate = useCallback(
    (updates: Partial<BeamNode>) => {
      if (!selectedId) return
      updateNode(selectedId as AnyNode['id'], updates)
      useScene.getState().dirtyNodes.add(selectedId as AnyNodeId)
    },
    [selectedId, updateNode],
  )

  const handleClose = useCallback(() => {
    setSelection({ selectedIds: [] })
  }, [setSelection])

  if (!node || node.type !== 'beam' || selectedIds.length !== 1) return null

  const designation = node.designation ?? '2x10'
  const material = node.material ?? 'wood'
  const plyCount = String(node.plyCount ?? 1)

  const dx = node.end[0] - node.start[0]
  const dz = node.end[1] - node.start[1]
  const span = Math.sqrt(dx * dx + dz * dz)

  return (
    <PanelWrapper
      icon="/icons/beam.png"
      onClose={handleClose}
      title={node.name || 'Beam'}
      width={280}
    >
      <PanelSection title="Member">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <div className="space-y-1">
            <span className="font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Designation
            </span>
            <SegmentedControl
              onChange={(v) => handleUpdate({ designation: v })}
              options={[
                { label: '2x10', value: '2x10' },
                { label: '2x12', value: '2x12' },
                { label: 'LVL 9-1/4', value: '3-1/2x9-1/4 LVL' },
                { label: 'LVL 11-7/8', value: '3-1/2x11-7/8 LVL' },
              ]}
              value={designation}
            />
          </div>
          <div className="space-y-1">
            <span className="font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Ply Count
            </span>
            <SegmentedControl
              onChange={(v) => handleUpdate({ plyCount: Number(v) })}
              options={[
                { label: '1', value: '1' },
                { label: '2', value: '2' },
                { label: '3', value: '3' },
              ]}
              value={plyCount}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Info">
        <div className="flex items-center justify-between px-2 py-1 text-muted-foreground text-sm">
          <span>Span</span>
          <span className="font-mono text-white">{span.toFixed(2)} m</span>
        </div>
      </PanelSection>

      <PanelSection title="Material">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <SegmentedControl
            onChange={(v) => handleUpdate({ material: v as BeamNode['material'] })}
            options={[
              { label: 'Wood', value: 'wood' },
              { label: 'Steel', value: 'steel' },
              { label: 'Engineered', value: 'engineered' },
            ]}
            value={material}
          />
        </div>
      </PanelSection>
    </PanelWrapper>
  )
}
