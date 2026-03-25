import { type BeamNode, useRegistry } from '@pascal-app/core'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'
import { getUtilizationColor } from '../frame/utilization-color'

const BEAM_COLOR = '#C4A055'

const CEILING_HEIGHT = 2.5

/** Map beam designation to cross-section dimensions [width, height] in meters */
const getBeamSection = (designation?: string): [number, number] => {
  if (!designation) return [0.038, 0.235] // default 2x10
  // Common lumber sizes (nominal to actual)
  if (designation.includes('2x8')) return [0.038, 0.184]
  if (designation.includes('2x10')) return [0.038, 0.235]
  if (designation.includes('2x12')) return [0.038, 0.286]
  if (designation.includes('LVL') || designation.includes('lvl')) return [0.044, 0.241]
  return [0.038, 0.235]
}

export const BeamRenderer = ({ node }: { node: BeamNode }) => {
  const ref = useRef<Mesh>(null!)

  useRegistry(node.id, 'beam', ref)

  const handlers = useNodeEvents(node, 'beam')
  const color = getUtilizationColor(node.metadata as Record<string, unknown> | undefined, BEAM_COLOR)

  const geometry = useMemo(() => {
    const [singleWidth, height] = getBeamSection(node.designation)
    const width = singleWidth * (node.plyCount ?? 1)

    const dx = node.end[0] - node.start[0]
    const dz = node.end[1] - node.start[1]
    const length = Math.sqrt(dx * dx + dz * dz)
    const angle = Math.atan2(dx, dz)

    const midX = (node.start[0] + node.end[0]) / 2
    const midZ = (node.start[1] + node.end[1]) / 2
    const y = CEILING_HEIGHT - height / 2

    // Use minimum clickable dimensions so thin beams are easier to select
    const clickableWidth = Math.max(width, 0.15)
    const clickableHeight = Math.max(height, 0.15)

    return { width: clickableWidth, height: clickableHeight, length, angle, midX, midZ, y }
  }, [node.start, node.end, node.designation, node.plyCount])

  return (
    <mesh
      castShadow
      receiveShadow
      ref={ref}
      position={[geometry.midX, geometry.y, geometry.midZ]}
      rotation={[0, geometry.angle, 0]}
      visible={node.visible}
      {...handlers}
    >
      <boxGeometry args={[geometry.width, geometry.height, geometry.length]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </mesh>
  )
}
