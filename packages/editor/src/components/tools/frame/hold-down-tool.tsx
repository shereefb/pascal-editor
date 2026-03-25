import { type AnyNodeId, emitter, type GridEvent, HoldDownNode, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useEffect, useRef } from 'react'
import { DoubleSide, type Group } from 'three'
import { EDITOR_LAYER } from '../../../lib/constants'
import { sfxEmitter } from '../../../lib/sfx-bus'
import { CursorSphere } from '../shared/cursor-sphere'

const BRACKET_WIDTH = 0.06
const BRACKET_HEIGHT = 0.15
const BRACKET_DEPTH = 0.06

/**
 * HoldDownTool — point-placement tool for creating hold-down connection hardware.
 * Click on the grid to place a hold-down at that location.
 */
export const HoldDownTool: React.FC = () => {
  const cursorRef = useRef<Group>(null)
  const previewRef = useRef<Group>(null!)

  useEffect(() => {
    const onGridMove = (event: GridEvent) => {
      if (!(cursorRef.current && previewRef.current)) return

      const x = event.position[0]
      const y = event.position[1]
      const z = event.position[2]

      cursorRef.current.position.set(x, y, z)
      previewRef.current.position.set(x, y + BRACKET_HEIGHT / 2, z)
      previewRef.current.visible = true
    }

    const onGridClick = (event: GridEvent) => {
      const levelId = useViewer.getState().selection.levelId
      if (!levelId) return

      const { createNode, nodes } = useScene.getState()

      const holdDownCount = Object.values(nodes).filter((n) => n.type === 'hold-down').length
      const name = `Hold-Down ${holdDownCount + 1}`

      const node = HoldDownNode.parse({
        name,
        position: [event.position[0], event.position[2]],
        model: 'HDU2',
      })

      createNode(node, levelId as AnyNodeId)
      useViewer.getState().setSelection({ selectedIds: [node.id] })
      sfxEmitter.emit('sfx:structure-build')
    }

    const onCancel = () => {
      if (previewRef.current) {
        previewRef.current.visible = false
      }
    }

    emitter.on('grid:move', onGridMove)
    emitter.on('grid:click', onGridClick)
    emitter.on('tool:cancel', onCancel)

    return () => {
      emitter.off('grid:move', onGridMove)
      emitter.off('grid:click', onGridClick)
      emitter.off('tool:cancel', onCancel)
    }
  }, [])

  return (
    <group>
      <CursorSphere ref={cursorRef} />

      {/* Hold-down preview — small L-bracket shape */}
      <group ref={previewRef}>
        {/* Vertical plate */}
        <mesh layers={EDITOR_LAYER} position={[0, 0, 0]} renderOrder={1}>
          <boxGeometry args={[BRACKET_WIDTH, BRACKET_HEIGHT, BRACKET_DEPTH / 3]} />
          <meshBasicMaterial
            color="#818cf8"
            depthTest={false}
            depthWrite={false}
            opacity={0.5}
            side={DoubleSide}
            transparent
          />
        </mesh>
        {/* Base plate */}
        <mesh
          layers={EDITOR_LAYER}
          position={[0, -BRACKET_HEIGHT / 2 + BRACKET_DEPTH / 6, BRACKET_DEPTH / 3]}
          renderOrder={1}
        >
          <boxGeometry args={[BRACKET_WIDTH, BRACKET_DEPTH / 3, BRACKET_DEPTH]} />
          <meshBasicMaterial
            color="#818cf8"
            depthTest={false}
            depthWrite={false}
            opacity={0.5}
            side={DoubleSide}
            transparent
          />
        </mesh>
      </group>
    </group>
  )
}
