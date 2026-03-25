'use client'

import { type AnyNode, type AnyNodeId, useScene, type BracingNode } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useCallback } from 'react'
import { PanelSection } from '../controls/panel-section'
import { SegmentedControl } from '../controls/segmented-control'
import { PanelWrapper } from './panel-wrapper'

export function BracingPanel() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const setSelection = useViewer((s) => s.setSelection)
  const nodes = useScene((s) => s.nodes)
  const updateNode = useScene((s) => s.updateNode)

  const selectedId = selectedIds[0]
  const node = selectedId
    ? (nodes[selectedId as AnyNode['id']] as BracingNode | undefined)
    : undefined

  const handleUpdate = useCallback(
    (updates: Partial<BracingNode>) => {
      if (!selectedId) return
      updateNode(selectedId as AnyNode['id'], updates)
      useScene.getState().dirtyNodes.add(selectedId as AnyNodeId)
    },
    [selectedId, updateNode],
  )

  const handleClose = useCallback(() => {
    setSelection({ selectedIds: [] })
  }, [setSelection])

  if (!node || node.type !== 'bracing' || selectedIds.length !== 1) return null

  const designation = node.designation ?? ''
  const material = node.material ?? 'wood'
  const connectionType = node.connectionType ?? ''

  return (
    <PanelWrapper
      icon="/icons/wall.png"
      onClose={handleClose}
      title={node.name || 'Bracing'}
      width={280}
    >
      <PanelSection title="Member">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <div className="space-y-1">
            <span className="font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Designation
            </span>
            <input
              className="h-8 w-full rounded-md border border-border/50 bg-[#2C2C2E] px-2 font-mono text-sm text-foreground outline-none focus:ring-1 focus:ring-border"
              onChange={(e) => handleUpdate({ designation: e.target.value })}
              type="text"
              value={designation}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Material">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <SegmentedControl
            onChange={(v) => handleUpdate({ material: v as BracingNode['material'] })}
            options={[
              { label: 'Wood', value: 'wood' },
              { label: 'Steel', value: 'steel' },
              { label: 'Engineered', value: 'engineered' },
            ]}
            value={material}
          />
        </div>
      </PanelSection>

      <PanelSection title="Connection">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <div className="space-y-1">
            <span className="font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Type
            </span>
            <input
              className="h-8 w-full rounded-md border border-border/50 bg-[#2C2C2E] px-2 font-mono text-sm text-foreground outline-none focus:ring-1 focus:ring-border"
              onChange={(e) => handleUpdate({ connectionType: e.target.value })}
              type="text"
              value={connectionType}
            />
          </div>
        </div>
      </PanelSection>
    </PanelWrapper>
  )
}
