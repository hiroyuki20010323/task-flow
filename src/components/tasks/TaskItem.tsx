'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import type { Task, TaskPriority } from '@/types';
import { TaskPriority as TaskPriorityEnum } from '@/types';

interface TaskItemProps {
  task: Task;
}

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriorityEnum.LOW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [TaskPriorityEnum.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [TaskPriorityEnum.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  [TaskPriorityEnum.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const priorityLabels: Record<TaskPriority, string> = {
  [TaskPriorityEnum.LOW]: '低',
  [TaskPriorityEnum.MEDIUM]: '中',
  [TaskPriorityEnum.HIGH]: '高',
  [TaskPriorityEnum.URGENT]: '緊急',
};

export function TaskItem({ task }: TaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 両方のrefを結合
  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    setDroppableRef(node);
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'DONE';

  return (
    <div
      ref={combinedRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${
        isOver
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
      }`}
    >
      <Link href={`/tasks/${task.id}`} className="block">
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">{task.title}</h4>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}
          >
            {priorityLabels[task.priority]}
          </span>
          {task.assignee && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {task.assignee.name}
            </span>
          )}
          {dueDate && (
            <span
              className={`text-xs ${
                isOverdue
                  ? 'font-semibold text-red-600 dark:text-red-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {dueDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
