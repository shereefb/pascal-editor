import { type HeaderNode, useRegistry } from '@pascal-app/core'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'
import { getUtilizationColor } from '../frame/utilization-color'

const HEADER_COLOR = '#C4A055'

const CEILING_HEIGHT = 2.5

/** Map header designation to cross-section dimensions [width, height] in meters */
const getHeaderSection = (designation?: string): [number, number] => {
  if (!designation) return [0.038, 0.286] // default 2x12
  if (designation.includes('2x8')) return [0.038, 0.184]
  if (designation.includes('2x10')) return [0.038, 0.235]
  if (designation.includes('2x12')) return [0.038, 0.286]
  if (designation.includes('LVL') || designation.includes('lvl')) return [0.044, 0.235]
  return [0.038, 0.286]
}

export const HeaderRenderer = ({ node }: { node: HeaderNode }) => {
  const ref = useRef<Mesh>(null!)

  useRegistry(node.id, 'header', ref)

  const handlers = useNodeEvents(node, 'header')
  const color = getUtilizationColor(node.metadata as Record<string, unknown> | undefined, HEADER_COLOR)

  const geometry = useMemo(() => {
    const [singleWidth, height] = getHeaderSection(node.designation)
    const plyCount = node.plyCount ?? 2
    const width = singleWidth * plyCount

    const dx = node.end[0] - node.start[0]
    const dz = node.end[1] - node.start[1]
    const length = Math.sqrt(dx * dx + dz * dz)
    const angle = Math.atan2(dx, dz)

    const midX = (node.start[0] + node.end[0]) / 2
    const midZ = (node.start[1] + node.end[1]) / 2
    const y = CEILING_HEIGHT - height / 2

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
