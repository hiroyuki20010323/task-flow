import Link from 'next/link';
import type { Task, TaskPriority } from '@/types';
import { TaskPriority as TaskPriorityEnum } from '@/types';

interface TaskCardProps {
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

export function TaskCard({ task }: TaskCardProps) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'DONE';

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority]}`}
            >
              {priorityLabels[task.priority]}
            </span>
            {task.assignee && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                担当: {task.assignee.name}
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
                期限: {dueDate.toLocaleDateString('ja-JP')}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {task.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
