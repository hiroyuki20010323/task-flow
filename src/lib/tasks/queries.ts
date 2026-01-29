import type { Task, TaskStatus, TaskPriority } from '@/types';

/**
 * タスク一覧を取得
 * @param projectId - プロジェクトID（オプション）
 * @param status - ステータスでフィルタ（オプション）
 * @param priority - 優先度でフィルタ（オプション）
 * @param assigneeId - 担当者IDでフィルタ（オプション）
 */
export async function getTasks(params?: {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
}): Promise<Task[]> {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.assigneeId) queryParams.append('assigneeId', params.assigneeId);

  const response = await fetch(`/api/tasks?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'タスクの取得に失敗しました' }));
    throw new Error(error.message || 'タスクの取得に失敗しました');
  }

  return response.json();
}

/**
 * タスク詳細を取得
 * @param id - タスクID
 */
export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'タスクの取得に失敗しました' }));
    throw new Error(error.message || 'タスクの取得に失敗しました');
  }

  return response.json();
}
