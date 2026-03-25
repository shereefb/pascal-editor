import { type PostNode, useScene, type WallNode } from '@pascal-app/core'

export type PlanPoint = [number, number]

/** Snap radius in meters — how close the cursor must be to a wall to snap */
export const FRAME_SNAP_RADIUS = 0.35

function distanceSquared(a: PlanPoint, b: PlanPoint): number {
  const dx = a[0] - b[0]
  const dz = a[1] - b[1]
  return dx * dx + dz * dz
}

/**
 * Project a point onto a wall segment, returning the closest point on the
 * segment (excluding endpoints — those are checked separately).
 */
function projectPointOntoWall(point: PlanPoint, wall: WallNode): PlanPoint | null {
  const [x1, z1] = wall.start
  const [x2, z2] = wall.end
  const dx = x2 - x1
  const dz = z2 - z1
  const lengthSq = dx * dx + dz * dz
  if (lengthSq < 1e-9) return null

  const t = ((point[0] - x1) * dx + (point[1] - z1) * dz) / lengthSq
  if (t <= 0 || t >= 1) return null

  return [x1 + dx * t, z1 + dz * t]
}

/**
 * Find the intersection point of two wall segments (if they cross).
 * Returns null if segments are parallel or don't intersect.
 */
function wallIntersection(a: WallNode, b: WallNode): PlanPoint | null {
  const [x1, y1] = a.start
  const [x2, y2] = a.end
  const [x3, y3] = b.start
  const [x4, y4] = b.end

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(denom) < 1e-9) return null

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  if (t < 0 || t > 1 || u < 0 || u > 1) return null

  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]
}

/**
 * Get all walls on the current level from the scene store.
 */
export function getWallsFromScene(): WallNode[] {
  const { nodes } = useScene.getState()
  return Object.values(nodes).filter((n): n is WallNode => n.type === 'wall')
}

/**
 * Find the closest wall snap target for a given plan-view point.
 *
 * Checks (in priority order — closest wins):
 * 1. Wall endpoints (corners, wall ends)
 * 2. Wall intersection points (where two walls cross)
 * 3. Perpendicular projection onto wall segments (along a wall)
 */
export function findFrameSnapTarget(
  point: PlanPoint,
  walls: WallNode[],
  radius = FRAME_SNAP_RADIUS,
): PlanPoint | null {
  const radiusSq = radius * radius
  let best: PlanPoint | null = null
  let bestDistSq = Number.POSITIVE_INFINITY

  const tryCandidate = (candidate: PlanPoint | null) => {
    if (!candidate) return
    const d = distanceSquared(point, candidate)
    if (d < radiusSq && d < bestDistSq) {
      best = candidate
      bestDistSq = d
    }
  }

  for (const wall of walls) {
    // Wall endpoints
    tryCandidate(wall.start)
    tryCandidate(wall.end)

    // Projection onto wall segment
    tryCandidate(projectPointOntoWall(point, wall))
  }

  // Wall-to-wall intersections
  for (let i = 0; i < walls.length; i++) {
    const wallA = walls[i]
    for (let j = i + 1; j < walls.length; j++) {
      const wallB = walls[j]
      if (wallA && wallB) {
        tryCandidate(wallIntersection(wallA, wallB))
      }
    }
  }

  return best
}

/**
 * Get all posts on the current level from the scene store.
 */
export function getPostsFromScene(): PostNode[] {
  const { nodes } = useScene.getState()
  return Object.values(nodes).filter((n): n is PostNode => n.type === 'post')
}

/**
 * Snap a 3D grid event position to the nearest wall feature.
 * Returns the snapped [x, z] plan coordinates, or the original position if
 * nothing is within snap range.
 */
export function snapToWalls(x: number, z: number, walls?: WallNode[]): PlanPoint {
  const allWalls = walls ?? getWallsFromScene()
  const snapped = findFrameSnapTarget([x, z], allWalls)
  return snapped ?? [x, z]
}

/**
 * Snap to the nearest wall feature OR post location.
 * Used by beam and header tools — these elements typically span between
 * posts and bear on walls, so both are valid snap targets.
 */
export function snapToWallsAndPosts(
  x: number,
  z: number,
  walls?: WallNode[],
  posts?: PostNode[],
): PlanPoint {
  const allWalls = walls ?? getWallsFromScene()
  const allPosts = posts ?? getPostsFromScene()

  const radiusSq = FRAME_SNAP_RADIUS * FRAME_SNAP_RADIUS
  let best: PlanPoint | null = null
  let bestDistSq = Number.POSITIVE_INFINITY

  const tryCandidate = (candidate: PlanPoint | null) => {
    if (!candidate) return
    const d = distanceSquared([x, z], candidate)
    if (d < radiusSq && d < bestDistSq) {
      best = candidate
      bestDistSq = d
    }
  }

  // Check wall targets
  const wallSnap = findFrameSnapTarget([x, z], allWalls)
  tryCandidate(wallSnap)

  // Check post positions
  for (const post of allPosts) {
    tryCandidate(post.position)
  }

  return best ?? [x, z]
}
