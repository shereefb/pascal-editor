'use client'

import { type AnyNode, type AnyNodeId, useScene, type JoistNode } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useCallback } from 'react'
import { PanelSection } from '../controls/panel-section'
import { SegmentedControl } from '../controls/segmented-control'
import { SliderControl } from '../controls/slider-control'
import { PanelWrapper } from './panel-wrapper'

export function JoistPanel() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const setSelection = useViewer((s) => s.setSelection)
  const nodes = useScene((s) => s.nodes)
  const updateNode = useScene((s) => s.updateNode)

  const selectedId = selectedIds[0]
  const node = selectedId ? (nodes[selectedId as AnyNode['id']] as JoistNode | undefined) : undefined

  const handleUpdate = useCallback(
    (updates: Partial<JoistNode>) => {
      if (!selectedId) return
      updateNode(selectedId as AnyNode['id'], updates)
      useScene.getState().dirtyNodes.add(selectedId as AnyNodeId)
    },
    [selectedId, updateNode],
  )

  const handleClose = useCallback(() => {
    setSelection({ selectedIds: [] })
  }, [setSelection])

  if (!node || node.type !== 'joist' || selectedIds.length !== 1) return null

  const designation = node.designation ?? '2x10'
  const material = node.material ?? 'wood'
  const spacingOC = node.spacingOC ?? '16'
  const direction = node.direction ?? 0

  return (
    <PanelWrapper
      icon="/icons/floor.png"
      onClose={handleClose}
      title={node.name || 'Joist'}
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
                { label: 'TJI 11-7/8', value: '11-7/8 TJI' },
              ]}
              value={designation}
            />
          </div>
          <div className="space-y-1">
            <span className="font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Spacing (o.c.)
            </span>
            <SegmentedControl
              onChange={(v) => handleUpdate({ spacingOC: v as JoistNode['spacingOC'] })}
              options={[
                { label: '12"', value: '12' },
                { label: '16"', value: '16' },
                { label: '24"', value: '24' },
              ]}
              value={spacingOC}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Orientation">
        <SliderControl
          label="Direction"
          max={360}
          min={0}
          onChange={(v) => handleUpdate({ direction: v })}
          precision={0}
          step={1}
          unit="deg"
          value={Math.round(direction)}
        />
      </PanelSection>

      <PanelSection title="Material">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <SegmentedControl
            onChange={(v) => handleUpdate({ material: v as JoistNode['material'] })}
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
