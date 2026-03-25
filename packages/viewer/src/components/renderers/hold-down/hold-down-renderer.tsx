import { type HoldDownNode, useRegistry } from '@pascal-app/core'
import { useRef } from 'react'
import type { Group } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'

const BASE_SIZE = 0.08
const BASE_THICKNESS = 0.006
const STRAP_WIDTH = 0.048
const STRAP_HEIGHT = 0.3
const STRAP_THICKNESS = 0.006

export const HoldDownRenderer = ({ node }: { node: HoldDownNode }) => {
  const ref = useRef<Group>(null!)

  useRegistry(node.id, 'hold-down', ref)

  const handlers = useNodeEvents(node, 'hold-down')

  return (
    <group
      ref={ref}
      position={[node.position[0], 0, node.position[1]]}
      visible={node.visible}
      {...handlers}
    >
      {/* Base plate */}
      <mesh castShadow receiveShadow position={[0, BASE_THICKNESS / 2, 0]}>
        <boxGeometry args={[BASE_SIZE, BASE_THICKNESS, BASE_SIZE]} />
        <meshStandardMaterial color="#8899AA" transparent opacity={0.6} />
      </mesh>

      {/* Vertical strap */}
      <mesh
        castShadow
        receiveShadow
        position={[0, BASE_THICKNESS + STRAP_HEIGHT / 2, (BASE_SIZE - STRAP_THICKNESS) / 2]}
      >
        <boxGeometry args={[STRAP_WIDTH, STRAP_HEIGHT, STRAP_THICKNESS]} />
        <meshStandardMaterial color="#8899AA" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
