import { type AnyNodeId, emitter, type GridEvent, HeaderNode, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { useEffect, useRef } from 'react'
import { DoubleSide, type Group, type Mesh, Shape, ShapeGeometry, Vector3 } from 'three'
import { EDITOR_LAYER } from '../../../lib/constants'
import { sfxEmitter } from '../../../lib/sfx-bus'
import { CursorSphere } from '../shared/cursor-sphere'

const HEADER_HEIGHT = 0.286 // ~11.25" (2x12 depth)

/**
 * Update header preview mesh to show a vertical plane between two points.
 */
const updateHeaderPreview = (mesh: Mesh, start: Vector3, end: Vector3) => {
  const direction = new Vector3(end.x - start.x, 0, end.z - start.z)
  const length = direction.length()

  if (length < 0.01) {
    mesh.visible = false
    return
  }

  mesh.visible = true
  direction.normalize()

  const shape = new Shape()
  shape.moveTo(0, 0)
  shape.lineTo(length, 0)
  shape.lineTo(length, HEADER_HEIGHT)
  shape.lineTo(0, HEADER_HEIGHT)
  shape.closePath()

  const geometry = new ShapeGeometry(shape)
  const angle = -Math.atan2(direction.z, direction.x)

  mesh.position.set(start.x, start.y, start.z)
  mesh.rotation.y = angle

  if (mesh.geometry) {
    mesh.geometry.dispose()
  }
  mesh.geometry = geometry
}

/**
 * HeaderTool — two-point line tool for creating header members over openings.
 * First click sets start, second click sets end and creates the header.
 */
export const HeaderTool: React.FC = () => {
  const cursorRef = useRef<Group>(null)
  const previewRef = useRef<Mesh>(null!)
  const startingPoint = useRef(new Vector3(0, 0, 0))
  const endingPoint = useRef(new Vector3(0, 0, 0))
  const buildingState = useRef(0)

  useEffect(() => {
    const onGridMove = (event: GridEvent) => {
      if (!(cursorRef.current && previewRef.current)) return

      const x = event.position[0]
      const y = event.position[1]
      const z = event.position[2]

      if (buildingState.current === 1) {
        endingPoint.current.set(x, y, z)
        cursorRef.current.position.set(x, y, z)
        updateHeaderPreview(previewRef.current, startingPoint.current, endingPoint.current)
      } else {
        cursorRef.current.position.set(x, y, z)
      }
    }

    const onGridClick = (event: GridEvent) => {
      const x = event.position[0]
      const y = event.position[1]
      const z = event.position[2]

      if (buildingState.current === 0) {
        startingPoint.current.set(x, y, z)
        endingPoint.current.copy(startingPoint.current)
        buildingState.current = 1
        previewRef.current.visible = true
      } else if (buildingState.current === 1) {
        endingPoint.current.set(x, y, z)

        const dx = endingPoint.current.x - startingPoint.current.x
        const dz = endingPoint.current.z - startingPoint.current.z
        if (dx * dx + dz * dz < 0.01 * 0.01) return

        const levelId = useViewer.getState().selection.levelId
        if (!levelId) return

        const { createNode, nodes } = useScene.getState()
        const headerCount = Object.values(nodes).filter((n) => n.type === 'header').length
        const name = `Header ${headerCount + 1}`

        const node = HeaderNode.parse({
          name,
          start: [startingPoint.current.x, startingPoint.current.z],
          end: [endingPoint.current.x, endingPoint.current.z],
          material: 'wood',
          designation: '2x12',
          plyCount: 2,
        })

        createNode(node, levelId as AnyNodeId)
        useViewer.getState().setSelection({ selectedIds: [node.id] })
        sfxEmitter.emit('sfx:structure-build')

        previewRef.current.visible = false
        buildingState.current = 0
      }
    }

    const onCancel = () => {
      if (buildingState.current === 1) {
        buildingState.current = 0
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

      <mesh layers={EDITOR_LAYER} ref={previewRef} renderOrder={1} visible={false}>
        <shapeGeometry />
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
