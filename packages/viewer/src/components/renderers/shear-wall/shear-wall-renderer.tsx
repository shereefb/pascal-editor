import { type ShearWallNode, useRegistry } from '@pascal-app/core'
import { useMemo, useRef } from 'react'
import { DoubleSide, ExtrudeGeometry, type Group, Shape, ShapeGeometry } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'

const WALL_HEIGHT = 2.5
const Y_OFFSET = 0.005

export const ShearWallRenderer = ({ node }: { node: ShearWallNode }) => {
  const ref = useRef<Group>(null!)

  useRegistry(node.id, 'shear-wall', ref)

  const handlers = useNodeEvents(node, 'shear-wall')

  const { floorGeometry, wallGeometry } = useMemo(() => {
    if (!node.points || node.points.length < 3) {
      return { floorGeometry: null, wallGeometry: null }
    }

    // Create shape from polygon points
    const shape = new Shape()
    const firstPt = node.points[0]!
    // Shape is in X-Y plane, negate Y for correct X-Z orientation
    shape.moveTo(firstPt[0], -firstPt[1])

    for (let i = 1; i < node.points.length; i++) {
      const pt = node.points[i]!
      shape.lineTo(pt[0], -pt[1])
    }
    shape.closePath()

    const floor = new ShapeGeometry(shape)
    const wall = new ExtrudeGeometry(shape, {
      depth: WALL_HEIGHT,
      bevelEnabled: false,
    })

    return { floorGeometry: floor, wallGeometry: wall }
  }, [node.points])

  if (!floorGeometry || !wallGeometry) return null

  return (
    <group ref={ref} visible={node.visible} {...handlers}>
      {/* Floor footprint */}
      <mesh
        geometry={floorGeometry}
        position={[0, Y_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#7BAA77"
          transparent
          opacity={0.3}
          side={DoubleSide}
        />
      </mesh>

      {/* Extruded wall panel */}
      <mesh
        geometry={wallGeometry}
        position={[0, Y_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#7BAA77"
          transparent
          opacity={0.6}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}
