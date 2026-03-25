import { type AnyNodeId, emitter, type GridEvent, PostNode, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useEffect, useRef } from 'react'
import { DoubleSide, type Group, type Mesh } from 'three'
import { EDITOR_LAYER } from '../../../lib/constants'
import { sfxEmitter } from '../../../lib/sfx-bus'
import { CursorSphere } from '../shared/cursor-sphere'
import { getWallsFromScene, snapForPost } from './frame-snap'

const POST_WIDTH = 0.089
const POST_HEIGHT = 2.5

/**
 * PostTool — point-placement tool for creating vertical post members.
 * Click on the grid to place a post at that location.
 */
export const PostTool: React.FC = () => {
  const cursorRef = useRef<Group>(null)
  const previewRef = useRef<Mesh>(null!)

  useEffect(() => {
    const walls = getWallsFromScene()

    const onGridMove = (event: GridEvent) => {
      if (!(cursorRef.current && previewRef.current)) return

      const [x, z] = snapForPost(event.position[0], event.position[2], walls)
      const y = event.position[1]

      cursorRef.current.position.set(x, y, z)
      previewRef.current.position.set(x, y + POST_HEIGHT / 2, z)
      previewRef.current.visible = true
    }

    const onGridClick = (event: GridEvent) => {
      const levelId = useViewer.getState().selection.levelId
      if (!levelId) return

      const [x, z] = snapForPost(event.position[0], event.position[2], walls)

      const { createNode, nodes } = useScene.getState()

      // Count existing posts for naming
      const postCount = Object.values(nodes).filter((n) => n.type === 'post').length
      const name = `Post ${postCount + 1}`

      const node = PostNode.parse({
        name,
        position: [x, z],
        material: 'wood',
        designation: '4x4',
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

      {/* Post preview — transparent box */}
      <mesh layers={EDITOR_LAYER} ref={previewRef} renderOrder={1} visible={false}>
        <boxGeometry args={[POST_WIDTH, POST_HEIGHT, POST_WIDTH]} />
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
  )
}
