'use client'

import { type AnyNode, type AnyNodeId, useScene, type PostNode } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useCallback } from 'react'
import { PanelSection } from '../controls/panel-section'
import { SegmentedControl } from '../controls/segmented-control'
import { SliderControl } from '../controls/slider-control'
import { PanelWrapper } from './panel-wrapper'

export function PostPanel() {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const setSelection = useViewer((s) => s.setSelection)
  const nodes = useScene((s) => s.nodes)
  const updateNode = useScene((s) => s.updateNode)

  const selectedId = selectedIds[0]
  const node = selectedId ? (nodes[selectedId as AnyNode['id']] as PostNode | undefined) : undefined

  const handleUpdate = useCallback(
    (updates: Partial<PostNode>) => {
      if (!selectedId) return
      updateNode(selectedId as AnyNode['id'], updates)
      useScene.getState().dirtyNodes.add(selectedId as AnyNodeId)
    },
    [selectedId, updateNode],
  )

  const handleClose = useCallback(() => {
    setSelection({ selectedIds: [] })
  }, [setSelection])

  if (!node || node.type !== 'post' || selectedIds.length !== 1) return null

  const height = node.height ?? 2.5
  const designation = node.designation ?? '4x4'
  const material = node.material ?? 'wood'

  return (
    <PanelWrapper
      icon="/icons/column.png"
      onClose={handleClose}
      title={node.name || 'Post'}
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
                { label: '4x4', value: '4x4' },
                { label: '4x6', value: '4x6' },
                { label: '6x6', value: '6x6' },
              ]}
              value={designation}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Dimensions">
        <SliderControl
          label="Height"
          max={6}
          min={0.1}
          onChange={(v) => handleUpdate({ height: Math.max(0.1, v) })}
          precision={2}
          step={0.1}
          unit="m"
          value={Math.round(height * 100) / 100}
        />
      </PanelSection>

      <PanelSection title="Material">
        <div className="flex flex-col gap-2 px-1 pb-1">
          <SegmentedControl
            onChange={(v) => handleUpdate({ material: v as PostNode['material'] })}
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
