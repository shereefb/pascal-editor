'use client'

import { type AnyNode, type AnyNodeId, useScene, type HoldDownNode } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useCallback } from 'react'
import { PanelSection } from '../controls/panel-section'
import { PanelWrapper } from './panel-wrapper'

export function HoldDownPanel() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const setSelection = useViewer((s) => s.setSelection)
  const nodes = useScene((s) => s.nodes)
  const updateNode = useScene((s) => s.updateNode)

  const selectedId = selectedIds[0]
  const node = selectedId
    ? (nodes[selectedId as AnyNode['id']] as HoldDownNode | undefined)
    : undefined

  const handleUpdate = useCallback(
    (updates: Partial<HoldDownNode>) => {
      if (!selectedId) return
      updateNode(selectedId as AnyNode['id'], updates)
      useScene.getState().dirtyNodes.add(selectedId as AnyNodeId)
    },
    [selectedId, updateNode],
  )

  const handleClose = useCallback(() => {
    setSelection({ selectedIds: [] })
  }, [setSelection])

  if (!node || node.type !== 'hold-down' || selectedIds.length !== 1) return null

  const model = node.model ?? ''
  const capacityLbs = node.capacityLbs ?? 0

  return (
    <PanelWrapper
      icon="/icons/column.png"
      onClose={handleClose}
      title={node.name || 'Hold-Down'}
      width={280}
    >
      <PanelSection title="Hardware">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <div className="space-y-1">
            <span className="font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Model
            </span>
            <input
              className="h-8 w-full rounded-md border border-border/50 bg-[#2C2C2E] px-2 font-mono text-sm text-foreground outline-none focus:ring-1 focus:ring-border"
              onChange={(e) => handleUpdate({ model: e.target.value })}
              placeholder="e.g. HDU2, HDU5"
              type="text"
              value={model}
            />
          </div>
          <div className="space-y-1">
            <span className="font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Capacity
            </span>
            <div className="flex items-center gap-1">
              <input
                className="h-8 w-full rounded-md border border-border/50 bg-[#2C2C2E] px-2 font-mono text-sm text-foreground outline-none focus:ring-1 focus:ring-border"
                onChange={(e) => handleUpdate({ capacityLbs: Number(e.target.value) || 0 })}
                type="number"
                value={capacityLbs}
              />
              <span className="shrink-0 text-muted-foreground text-xs">lbs</span>
            </div>
          </div>
        </div>
      </PanelSection>
    </PanelWrapper>
  )
}
