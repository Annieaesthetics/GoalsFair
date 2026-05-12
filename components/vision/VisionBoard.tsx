'use client'

import { useState, useRef } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Upload, X, Loader2, GripVertical, Image as ImageIcon, Plus } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

interface VisionImage {
  id: string
  image_url: string
  caption: string | null
  display_order: number
}

function SortableImage({ image, onDelete }: { image: VisionImage; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-square ${isDragging ? 'opacity-40 shadow-2xl scale-105 z-50' : 'hover:shadow-lg transition-shadow'}`}
    >
      <img src={image.image_url} alt={image.caption || ''} className="w-full h-full object-cover" />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-all"
      >
        <GripVertical className="w-3 h-3 text-white" />
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(image.id)}
        className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80"
      >
        <X className="w-3 h-3 text-white" />
      </button>

      {/* Caption */}
      {image.caption && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-xs text-white font-medium truncate">{image.caption}</p>
        </div>
      )}
    </div>
  )
}

interface VisionBoardProps {
  goalId: string
  initialImages: VisionImage[]
  userId: string
}

export function VisionBoard({ goalId, initialImages, userId }: VisionBoardProps) {
  const [images, setImages] = useState(initialImages)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const sensors = useSensors(useSensor(PointerSensor))

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')

    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200 })
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${userId}/${goalId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage.from('vision-images').upload(path, compressed)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('vision-images').getPublicUrl(path)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: dbError } = await (supabase.from('goal_images') as any)
        .insert({ goal_id: goalId, image_url: publicUrl, caption: caption || null, display_order: images.length })
        .select().single()

      if (dbError) throw dbError
      setImages(prev => [...prev, data])
      setCaption('')
      setShowUpload(false)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
    const supabase = createClient()
    await supabase.from('goal_images').delete().eq('id', id)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex(img => img.id === active.id)
    const newIndex = images.findIndex(img => img.id === over.id)
    const reordered = arrayMove(images, oldIndex, newIndex)
    setImages(reordered)
    const supabase = createClient()
    await Promise.all(reordered.map((img, i) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('goal_images') as any).update({ display_order: i }).eq('id', img.id)
    ))
  }

  return (
    <div className="space-y-4">
      {/* Upload trigger */}
      {!showUpload ? (
        <button
          onClick={() => setShowUpload(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-sm text-gray-500 dark:text-gray-400 hover:border-emerald-400 dark:hover:border-emerald-700 hover:text-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add image
        </button>
      ) : (
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3 bg-gray-50 dark:bg-gray-950">
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:border-emerald-400 transition-colors"
          >
            {uploading
              ? <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mb-1" />
              : <Upload className="w-5 h-5 text-gray-400 mb-1" />
            }
            <p className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Click to choose image'}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowUpload(false)} className="flex-1 py-2 text-xs border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:border-gray-400 transition-colors">
              Cancel
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex-1 py-2 text-xs bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
              Choose file
            </button>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map(img => (
                <SortableImage key={img.id} image={img} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <ImageIcon className="w-10 h-10 text-gray-200 dark:text-gray-800 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No images yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Add images to visualize your goal</p>
        </div>
      )}
    </div>
  )
}
