import { type JoistNode, useRegistry } from '@pascal-app/core'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'

const CEILING_HEIGHT = 2.5

/** Map joist designation to cross-section dimensions [width, height] in meters */
const getJoistSection = (designation?: string): [number, number] => {
  if (!designation) return [0.038, 0.235] // default 2x10
  if (designation.includes('2x8')) return [0.038, 0.184]
  if (designation.includes('2x10')) return [0.038, 0.235]
  if (designation.includes('2x12')) return [0.038, 0.286]
  if (designation.includes('TJI') || designation.includes('tji')) return [0.044, 0.302]
  return [0.038, 0.235]
}

/** Convert OC spacing string to meters */
const spacingToMeters = (spacingOC: string): number => {
  const inches = Number.parseInt(spacingOC, 10)
  return inches * 0.0254 // inches to meters
}

/** Point-in-polygon test using ray casting */
const pointInPolygon = (x: number, z: number, polygon: Array<[number, number]>): boolean => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]![0]
    const zi = polygon[i]![1]
    const xj = polygon[j]![0]
    const zj = polygon[j]![1]

    const intersect = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/** Compute axis-aligned bounding box of polygon */
const getPolygonBounds = (
  polygon: Array<[number, number]>,
): { minX: number; maxX: number; minZ: number; maxZ: number } => {
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  for (const [x, z] of polygon) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
  }
  return { minX, maxX, minZ, maxZ }
}

interface JoistLine {
  startX: number
  startZ: number
  endX: number
  endZ: number
}

export const JoistRenderer = ({ node }: { node: JoistNode }) => {
  const ref = useRef<Group>(null!)

  useRegistry(node.id, 'joist', ref)

  const handlers = useNodeEvents(node, 'joist')

  const joists = useMemo(() => {
    if (!node.points || node.points.length < 3) return []

    const [width, height] = getJoistSection(node.designation)
    const spacing = spacingToMeters(node.spacingOC ?? '16')
    const dirRad = ((node.direction ?? 0) * Math.PI) / 180
    const cosDir = Math.cos(dirRad)
    const sinDir = Math.sin(dirRad)

    // Direction along joists
    const dirX = cosDir
    const dirZ = sinDir
    // Perpendicular direction (spacing direction)
    const perpX = -sinDir
    const perpZ = cosDir

    const bounds = getPolygonBounds(node.points)
    const diagonal = Math.sqrt(
      (bounds.maxX - bounds.minX) ** 2 + (bounds.maxZ - bounds.minZ) ** 2,
    )
    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerZ = (bounds.minZ + bounds.maxZ) / 2

    const lines: JoistLine[] = []
    const halfSpan = diagonal / 2 + spacing

    // Generate parallel lines perpendicular to joist direction
    const numJoists = Math.ceil((diagonal + spacing) / spacing)
    for (let i = -numJoists; i <= numJoists; i++) {
      const offset = i * spacing
      const lineOriginX = centerX + perpX * offset
      const lineOriginZ = centerZ + perpZ * offset

      // Find intersections of this joist line with the polygon
      const startX = lineOriginX - dirX * halfSpan
      const startZ = lineOriginZ - dirZ * halfSpan
      const endX = lineOriginX + dirX * halfSpan
      const endZ = lineOriginZ + dirZ * halfSpan

      // Sample along the line to find entry/exit points within polygon
      const steps = Math.max(20, Math.ceil(diagonal / 0.1))
      let entryT: number | null = null
      let exitT: number | null = null

      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const px = startX + (endX - startX) * t
        const pz = startZ + (endZ - startZ) * t
        const inside = pointInPolygon(px, pz, node.points)

        if (inside && entryT === null) {
          entryT = t
        }
        if (!inside && entryT !== null && exitT === null) {
          exitT = t
        }
      }

      if (entryT !== null) {
        if (exitT === null) exitT = 1
        lines.push({
          startX: startX + (endX - startX) * entryT,
          startZ: startZ + (endZ - startZ) * entryT,
          endX: startX + (endX - startX) * exitT,
          endZ: startZ + (endZ - startZ) * exitT,
        })
      }
    }

    return lines.map((line) => {
      const dx = line.endX - line.startX
      const dz = line.endZ - line.startZ
      const length = Math.sqrt(dx * dx + dz * dz)
      if (length < 0.01) return null

      const angle = Math.atan2(dx, dz)
      const midX = (line.startX + line.endX) / 2
      const midZ = (line.startZ + line.endZ) / 2
      const y = CEILING_HEIGHT - height / 2

      return { width, height, length, angle, midX, midZ, y }
    }).filter(Boolean)
  }, [node.points, node.spacingOC, node.direction, node.designation])

  return (
    <group ref={ref} visible={node.visible} {...handlers}>
      {joists.map((joist, i) =>
        joist ? (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[joist.midX, joist.y, joist.midZ]}
            rotation={[0, joist.angle, 0]}
          >
            <boxGeometry args={[joist.width, joist.height, joist.length]} />
            <meshStandardMaterial color="#D4B87A" transparent opacity={0.6} />
          </mesh>
        ) : null,
      )}
    </group>
  )
}
