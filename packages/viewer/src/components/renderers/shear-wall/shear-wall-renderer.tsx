import { type ShearWallNode, useRegistry } from '@pascal-app/core'
import { useMemo, useRef } from 'react'
import { DoubleSide, type Group, Shape } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'

const WALL_HEIGHT = 2.5
const Y_OFFSET = 0.005

export const ShearWallRenderer = ({ node }: { node: ShearWallNode }) => {
  const ref = useRef<Group>(null!)

  useRegistry(node.id, 'shear-wall', ref)

  const handlers = useNodeEvents(node, 'shear-wall')

  const shape = useMemo(() => {
    if (!node.points || node.points.length < 3) return null

    // Create shape from polygon points
    const s = new Shape()
    const firstPt = node.points[0]!
    // Shape is in X-Y plane, negate Y for correct X-Z orientation
    s.moveTo(firstPt[0], -firstPt[1])

    for (let i = 1; i < node.points.length; i++) {
      const pt = node.points[i]!
      s.lineTo(pt[0], -pt[1])
    }
    s.closePath()

    return s
  }, [node.points])

  if (!shape) return null

  return (
    <group ref={ref} visible={node.visible} {...handlers}>
      {/* Floor footprint */}
      <mesh
        position={[0, Y_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color="#7BAA77"
          transparent
          opacity={0.3}
          side={DoubleSide}
        />
      </mesh>

      {/* Extruded wall panel */}
      <mesh
        position={[0, Y_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry args={[shape, { depth: WALL_HEIGHT, bevelEnabled: false }]} />
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
