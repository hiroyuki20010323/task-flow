import type { Task, TaskStatus, KanbanColumn, KanbanBoard, Project } from '@/types';
import { TaskStatus as TaskStatusEnum } from '@/types';

/**
 * タスクリストをカンバン形式に変換
 * @param tasks - タスクリスト
 * @param project - プロジェクト情報
 */
export function tasksToKanbanBoard(tasks: Task[], project: Project): KanbanBoard {
  const statusOrder: TaskStatus[] = [
    TaskStatusEnum.TODO,
    TaskStatusEnum.IN_PROGRESS,
    TaskStatusEnum.REVIEW,
    TaskStatusEnum.DONE,
  ];

  const columns: KanbanColumn[] = statusOrder.map((status) => {
    const statusTasks = tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);

    return {
      status,
      tasks: statusTasks,
    };
  });

  return {
    columns,
    project,
  };
}

/**
 * カンバンボードのタスクを取得
 * @param projectId - プロジェクトID
 */
export async function getKanbanBoard(projectId: string): Promise<KanbanBoard> {
  const response = await fetch(`/api/projects/${projectId}/kanban`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'カンバンボードの取得に失敗しました' }));
    throw new Error(error.message || 'カンバンボードの取得に失敗しました');
  }

  return response.json();
}
