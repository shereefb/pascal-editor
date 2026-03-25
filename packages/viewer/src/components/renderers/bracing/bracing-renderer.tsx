import { type BracingNode, useRegistry } from '@pascal-app/core'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'

const CEILING_HEIGHT = 2.5
const CROSS_SECTION = 0.038

export const BracingRenderer = ({ node }: { node: BracingNode }) => {
  const ref = useRef<Group>(null!)

  useRegistry(node.id, 'bracing', ref)

  const handlers = useNodeEvents(node, 'bracing')

  const geometry = useMemo(() => {
    const dx = node.end[0] - node.start[0]
    const dz = node.end[1] - node.start[1]
    const horizontalLength = Math.sqrt(dx * dx + dz * dz)

    // Diagonal from floor (y=0) to ceiling (y=CEILING_HEIGHT)
    const totalLength = Math.sqrt(horizontalLength * horizontalLength + CEILING_HEIGHT * CEILING_HEIGHT)
    const pitchAngle = Math.atan2(CEILING_HEIGHT, horizontalLength)
    const yawAngle = Math.atan2(dx, dz)

    const midX = (node.start[0] + node.end[0]) / 2
    const midZ = (node.start[1] + node.end[1]) / 2
    const midY = CEILING_HEIGHT / 2

    return { totalLength, pitchAngle, yawAngle, midX, midY, midZ }
  }, [node.start, node.end])

  return (
    <group ref={ref} visible={node.visible} {...handlers}>
      <mesh
        castShadow
        receiveShadow
        position={[geometry.midX, geometry.midY, geometry.midZ]}
        rotation={[geometry.pitchAngle, geometry.yawAngle, 0]}
      >
        <boxGeometry args={[CROSS_SECTION, CROSS_SECTION, geometry.totalLength]} />
        <meshStandardMaterial color="#D4893F" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
