'use client'

import NextImage from 'next/image'

import { cn } from '../../../lib/utils'
import useEditor, { type FrameTool } from '../../../store/use-editor'
import { ActionButton } from './action-button'

export type FrameToolConfig = {
  id: FrameTool
  iconSrc: string
  label: string
}

export const frameTools: FrameToolConfig[] = [
  { id: 'post', iconSrc: '/icons/post.png', label: 'Post' },
  { id: 'beam', iconSrc: '/icons/beam.png', label: 'Beam' },
  { id: 'header', iconSrc: '/icons/header.png', label: 'Header' },
  { id: 'joist', iconSrc: '/icons/joist.png', label: 'Joist' },
  { id: 'shear-wall', iconSrc: '/icons/shear-wall.png', label: 'Shear Wall' },
  { id: 'bracing', iconSrc: '/icons/bracing.png', label: 'Bracing' },
  { id: 'hold-down', iconSrc: '/icons/hold-down.png', label: 'Hold-Down' },
]

export function FrameTools() {
  const activeTool = useEditor((state) => state.tool)
  const setTool = useEditor((state) => state.setTool)

  return (
    <div className="flex items-center gap-1.5 px-1">
      {frameTools.map((tool, index) => {
        const isActive = activeTool === tool.id

        return (
          <ActionButton
            className={cn(
              'rounded-lg duration-300',
              isActive
                ? 'z-10 scale-110 bg-black/40 hover:bg-black/40'
                : 'scale-95 bg-transparent opacity-60 grayscale hover:bg-black/20 hover:opacity-100 hover:grayscale-0',
            )}
            key={`${tool.id}-${index}`}
            label={tool.label}
            onClick={() => {
              if (!isActive) {
                setTool(tool.id)

                if (useEditor.getState().mode !== 'build') {
                  useEditor.getState().setMode('build')
                }
              }
            }}
            size="icon"
            variant="ghost"
          >
            <NextImage
              alt={tool.label}
              className="size-full object-contain"
              height={28}
              src={tool.iconSrc}
              width={28}
            />
          </ActionButton>
        )
      })}
    </div>
  )
}
