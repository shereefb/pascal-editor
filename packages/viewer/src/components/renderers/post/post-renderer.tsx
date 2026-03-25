import { type PostNode, useRegistry } from '@pascal-app/core'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'
import { getUtilizationColor } from '../frame/utilization-color'

const POST_COLOR = '#C4A055'

/** Map post designation to cross-section size in meters */
const getPostSize = (designation?: string): number => {
  if (!designation) return 0.089 // default 4x4
  if (designation.includes('6x6')) return 0.14
  if (designation.includes('4x4')) return 0.089
  if (designation.includes('4x6')) return 0.089 // use smaller dimension
  return 0.089
}

export const PostRenderer = ({ node }: { node: PostNode }) => {
  const ref = useRef<Group>(null!)

  useRegistry(node.id, 'post', ref)

  const handlers = useNodeEvents(node, 'post')

  const size = useMemo(() => getPostSize(node.designation), [node.designation])
  const height = node.height ?? 2.5
  const color = getUtilizationColor(node.metadata as Record<string, unknown> | undefined, POST_COLOR)

  // Collision mesh is at least 0.15m for easier clicking
  const collisionSize = Math.max(size, 0.15)

  return (
    <group
      ref={ref}
      position={[node.position[0], height / 2, node.position[1]]}
      visible={node.visible}
    >
      {/* Visible post */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, height, size]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* Larger invisible collision mesh for easier selection */}
      <mesh visible={false} {...handlers}>
        <boxGeometry args={[collisionSize, height, collisionSize]} />
      </mesh>
    </group>
  )
}
