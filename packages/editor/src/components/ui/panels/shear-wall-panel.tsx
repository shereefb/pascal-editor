'use client'

import { type AnyNode, type AnyNodeId, useScene, type ShearWallNode } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useCallback } from 'react'
import { PanelSection } from '../controls/panel-section'
import { SegmentedControl } from '../controls/segmented-control'
import { PanelWrapper } from './panel-wrapper'

export function ShearWallPanel() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const setSelection = useViewer((s) => s.setSelection)
  const nodes = useScene((s) => s.nodes)
  const updateNode = useScene((s) => s.updateNode)

  const selectedId = selectedIds[0]
  const node = selectedId
    ? (nodes[selectedId as AnyNode['id']] as ShearWallNode | undefined)
    : undefined

  const handleUpdate = useCallback(
    (updates: Partial<ShearWallNode>) => {
      if (!selectedId) return
      updateNode(selectedId as AnyNode['id'], updates)
      useScene.getState().dirtyNodes.add(selectedId as AnyNodeId)
    },
    [selectedId, updateNode],
  )

  const handleClose = useCallback(() => {
    setSelection({ selectedIds: [] })
  }, [setSelection])

  if (!node || node.type !== 'shear-wall' || selectedIds.length !== 1) return null

  const sheathingType = node.sheathingType ?? 'osb'
  const nailingSchedule = node.nailingSchedule ?? '8d @ 6/12'

  return (
    <PanelWrapper
      icon="/icons/shear-wall.png"
      onClose={handleClose}
      title={node.name || 'Shear Wall'}
      width={280}
    >
      <PanelSection title="Sheathing">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <div className="space-y-1">
            <span className="font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Type
            </span>
            <SegmentedControl
              onChange={(v) => handleUpdate({ sheathingType: v as ShearWallNode['sheathingType'] })}
              options={[
                { label: 'OSB', value: 'osb' },
                { label: 'Plywood', value: 'plywood' },
              ]}
              value={sheathingType}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Nailing">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <div className="space-y-1">
            <span className="font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Schedule
            </span>
            <input
              className="h-8 w-full rounded-md border border-border/50 bg-[#2C2C2E] px-2 font-mono text-sm text-foreground outline-none focus:ring-1 focus:ring-border"
              onChange={(e) => handleUpdate({ nailingSchedule: e.target.value })}
              type="text"
              value={nailingSchedule}
            />
          </div>
        </div>
      </PanelSection>
    </PanelWrapper>
  )
}
