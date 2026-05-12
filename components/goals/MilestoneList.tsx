'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Check, Plus, Trash2 } from 'lucide-react'

interface Milestone {
  id: string
  title: string
  completed: boolean | null
  display_order: number | null
  due_date: string | null
}

interface MilestoneItemProps {
  milestone: Milestone
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

function MilestoneItem({ milestone, onToggle, onDelete }: MilestoneItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: milestone.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-900 rounded-lg bg-white dark:bg-black transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-700 hover:text-gray-400 dark:hover:text-gray-600">
        <GripVertical className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggle(milestone.id, !milestone.completed)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          milestone.completed ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 dark:border-gray-700 hover:border-emerald-600'
        }`}
      >
        {milestone.completed && <Check className="w-3 h-3 text-white" />}
      </button>

      <span className={`flex-1 text-sm ${milestone.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-black dark:text-white'}`}>
        {milestone.title}
      </span>

      {milestone.due_date && (
        <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0">
          {new Date(milestone.due_date).toLocaleDateString()}
        </span>
      )}

      <button
        onClick={() => onDelete(milestone.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-700 hover:text-red-500 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

interface MilestoneListProps {
  goalId: string
  initialMilestones: Milestone[]
}

export function MilestoneList({ goalId, initialMilestones }: MilestoneListProps) {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [showInput, setShowInput] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = milestones.findIndex(m => m.id === active.id)
    const newIndex = milestones.findIndex(m => m.id === over.id)
    const reordered = arrayMove(milestones, oldIndex, newIndex)
    setMilestones(reordered)

    await Promise.all(
      reordered.map((m, i) =>
        fetch(`/api/milestones/${m.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: i }),
        })
      )
    )
  }

  const handleToggle = async (id: string, completed: boolean) => {
    setMilestones(ms => ms.map(m => m.id === id ? { ...m, completed } : m))
    await fetch(`/api/milestones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
  }

  const handleDelete = async (id: string) => {
    setMilestones(ms => ms.filter(m => m.id !== id))
    await fetch(`/api/milestones/${id}`, { method: 'DELETE' })
  }

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    const res = await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal_id: goalId, title: newTitle.trim(), display_order: milestones.length }),
    })
    const data = await res.json()
    if (res.ok) {
      setMilestones(ms => [...ms, data.milestone])
      setNewTitle('')
      setShowInput(false)
    }
    setAdding(false)
  }

  const completed = milestones.filter(m => m.completed).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-black dark:text-white">Milestones</h3>
          {milestones.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{completed}/{milestones.length} completed</p>
          )}
        </div>
        <button
          onClick={() => setShowInput(true)}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> Add milestone
        </button>
      </div>

      {milestones.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={milestones.map(m => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {milestones.map(m => (
                <MilestoneItem key={m.id} milestone={m} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showInput && (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowInput(false) }}
            placeholder="Milestone title..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
          <button onClick={() => setShowInput(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-black dark:hover:text-white">
            Cancel
          </button>
        </div>
      )}

      {milestones.length === 0 && !showInput && (
        <p className="text-xs text-gray-400 dark:text-gray-600 py-2">No milestones yet. Break your goal into smaller steps.</p>
      )}
    </div>
  )
}
