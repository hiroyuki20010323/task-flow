'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { KanbanColumn as KanbanColumnType, TaskStatus } from '@/types';
import { TaskItem } from './TaskItem';

interface KanbanColumnProps {
  column: KanbanColumnType;
}

const statusLabels: Record<TaskStatus, string> = {
  TODO: '未着手',
  IN_PROGRESS: '進行中',
  REVIEW: 'レビュー',
  DONE: '完了',
};

const statusColors: Record<TaskStatus, string> = {
  TODO: 'bg-zinc-100 dark:bg-zinc-800',
  IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900',
  REVIEW: 'bg-yellow-100 dark:bg-yellow-900',
  DONE: 'bg-green-100 dark:bg-green-900',
};

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
  });

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div className="flex h-full flex-col">
      <div
        className={`mb-3 rounded-lg px-4 py-2 ${statusColors[column.status]}`}
      >
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {statusLabels[column.status]}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {column.tasks.length}件
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-lg p-2 transition-colors ${
          isOver ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-zinc-50 dark:bg-zinc-950'
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </SortableContext>
        {column.tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-zinc-400 dark:text-zinc-600">
            タスクがありません
          </div>
        )}
      </div>
    </div>
  );
}
