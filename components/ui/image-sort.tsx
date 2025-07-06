"use client"

import React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, GripVertical, RotateCcw } from "lucide-react"
import Image from "next/image"

interface ImagePosition {
  url: string
  position: number
}

interface ImageSortProps {
  images: string[]
  imagePositions?: Record<string, number>
  onUpdatePositions: (positions: Record<string, number>) => void
  onRemoveImage: (url: string, index: number) => void
}

function SortableImageItem({
  id,
  url,
  position,
  onPositionChange,
  onRemove
}: {
  id: string
  url: string
  position: number
  onPositionChange: (position: number) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-3 p-3 bg-card border rounded-lg"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex-shrink-0">
        <Image
          src={url || "/placeholder.svg"}
          alt={`Image ${position}`}
          width={80}
          height={80}
          className="object-cover rounded border"
        />
      </div>

      <div className="flex-1 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Позиция:</Label>
          <Input
            type="number"
            value={position}
            onChange={(e) => onPositionChange(Number(e.target.value))}
            className="w-20 h-8"
            min={1}
          />
        </div>

        {position === 1 && (
          <div className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
            Главное фото
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ImageSort({ images, imagePositions = {}, onUpdatePositions, onRemoveImage }: ImageSortProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Создаем массив изображений с позициями
  const sortedImages = React.useMemo(() => {
    const imagesWithPositions = images.map((url, index) => ({
      url,
      position: imagePositions[url] || index + 1,
      originalIndex: index,
    }))

    return imagesWithPositions.sort((a, b) => a.position - b.position)
  }, [images, imagePositions])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = sortedImages.findIndex(item => item.url === active.id)
      const newIndex = sortedImages.findIndex(item => item.url === over?.id)

      const newSortedImages = arrayMove(sortedImages, oldIndex, newIndex)

      // Создаем новые позиции
      const newPositions: Record<string, number> = {}
      newSortedImages.forEach((item, index) => {
        newPositions[item.url] = index + 1
      })

      onUpdatePositions(newPositions)
    }
  }

  const handlePositionChange = (url: string, newPosition: number) => {
    if (newPosition < 1) return

    const newPositions = { ...imagePositions }
    newPositions[url] = newPosition
    onUpdatePositions(newPositions)
  }

  const handleResetPositions = () => {
    onUpdatePositions({})
  }

  const handleRemove = (url: string) => {
    const originalIndex = images.findIndex(img => img === url)
    onRemoveImage(url, originalIndex)
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Порядок изображений</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetPositions}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Сбросить порядок
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Перетащите изображения для изменения порядка или укажите позиции вручную
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedImages.map(item => item.url)}
          strategy={rectSortingStrategy}
        >
          <div className="space-y-2">
            {sortedImages.map((item) => (
              <SortableImageItem
                key={item.url}
                id={item.url}
                url={item.url}
                position={item.position}
                onPositionChange={(position) => handlePositionChange(item.url, position)}
                onRemove={() => handleRemove(item.url)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
