import {
  type BeamEvent,
  type BeamNode,
  type BracingEvent,
  type BracingNode,
  type BuildingEvent,
  type BuildingNode,
  type CeilingEvent,
  type CeilingNode,
  type DoorEvent,
  type DoorNode,
  type EventSuffix,
  type HeaderEvent,
  type HeaderNode,
  type HoldDownEvent,
  type HoldDownNode,
  type ItemEvent,
  type ItemNode,
  type JoistEvent,
  type JoistNode,
  type LevelEvent,
  type LevelNode,
  type PostEvent,
  type PostNode,
  type RoofEvent,
  type RoofNode,
  type RoofSegmentEvent,
  type RoofSegmentNode,
  type ShearWallEvent,
  type ShearWallNode,
  type SiteEvent,
  type SiteNode,
  type SlabEvent,
  type SlabNode,
  type WallEvent,
  type WallNode,
  type WindowEvent,
  type WindowNode,
  type ZoneEvent,
  type ZoneNode,
  emitter,
} from '@pascal-app/core'
import type { ThreeEvent } from '@react-three/fiber'
import useViewer from '../store/use-viewer'

type NodeConfig = {
  site: { node: SiteNode; event: SiteEvent }
  item: { node: ItemNode; event: ItemEvent }
  wall: { node: WallNode; event: WallEvent }
  building: { node: BuildingNode; event: BuildingEvent }
  level: { node: LevelNode; event: LevelEvent }
  zone: { node: ZoneNode; event: ZoneEvent }
  slab: { node: SlabNode; event: SlabEvent }
  ceiling: { node: CeilingNode; event: CeilingEvent }
  roof: { node: RoofNode; event: RoofEvent }
  'roof-segment': { node: RoofSegmentNode; event: RoofSegmentEvent }
  window: { node: WindowNode; event: WindowEvent }
  door: { node: DoorNode; event: DoorEvent }
  post: { node: PostNode; event: PostEvent }
  beam: { node: BeamNode; event: BeamEvent }
  header: { node: HeaderNode; event: HeaderEvent }
  joist: { node: JoistNode; event: JoistEvent }
  'shear-wall': { node: ShearWallNode; event: ShearWallEvent }
  bracing: { node: BracingNode; event: BracingEvent }
  'hold-down': { node: HoldDownNode; event: HoldDownEvent }
}

type NodeType = keyof NodeConfig

// Frame element types — these are leaf nodes whose events should not bubble
// up through the Three.js scene graph to parent meshes (walls, levels, buildings)
const FRAME_TYPES = new Set<string>([
  'post', 'beam', 'header', 'joist', 'shear-wall', 'bracing', 'hold-down',
])

export function useNodeEvents<T extends NodeType>(node: NodeConfig[T]['node'], type: T) {
  const isFrame = FRAME_TYPES.has(type)

  const emit = (suffix: EventSuffix, e: ThreeEvent<PointerEvent>) => {
    const eventKey = `${type}:${suffix}` as `${T}:${EventSuffix}`
    const localPoint = e.object.worldToLocal(e.point.clone())
    const payload = {
      node,
      position: [e.point.x, e.point.y, e.point.z],
      localPosition: [localPoint.x, localPoint.y, localPoint.z],
      normal: e.face ? [e.face.normal.x, e.face.normal.y, e.face.normal.z] : undefined,
      stopPropagation: () => e.stopPropagation(),
      nativeEvent: e,
    } as NodeConfig[T]['event']

    emitter.emit(eventKey, payload)
  }

  return {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      if (e.button !== 0) return
      // Frame elements stop R3F propagation so events don't bubble to walls/levels
      if (isFrame) e.stopPropagation()
      emit('pointerdown', e)
    },
    onPointerUp: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      if (e.button !== 0) return
      if (isFrame) e.stopPropagation()
      emit('pointerup', e)
      // Synthesize a click event on pointer up to be more forgiving than R3F's default onClick
      // which often fails if the mouse moves even 1 pixel.
      emit('click', e)
    },
    onClick: (e: ThreeEvent<PointerEvent>) => {
      // Disable default R3F click since we synthesize it on pointerup
      // This prevents double-clicks from firing twice.
    },
    onPointerEnter: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      if (isFrame) e.stopPropagation()
      emit('enter', e)
    },
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      if (isFrame) e.stopPropagation()
      emit('leave', e)
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      if (isFrame) e.stopPropagation()
      emit('move', e)
    },
    onDoubleClick: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      emit('double-click', e)
    },
    onContextMenu: (e: ThreeEvent<PointerEvent>) => {
      if (useViewer.getState().cameraDragging) return
      emit('context-menu', e)
    },
  }
}
