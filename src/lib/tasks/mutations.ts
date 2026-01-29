import type { Task, TaskInput, UpdateTaskStatusInput } from '@/types';

/**
 * タスクを作成
 * @param input - タスク作成データ
 */
export async function createTask(input: TaskInput & { projectId: string }): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'タスクの作成に失敗しました' }));
    throw new Error(error.message || 'タスクの作成に失敗しました');
  }

  return response.json();
}

/**
 * タスクを更新
 * @param id - タスクID
 * @param input - タスク更新データ
 */
export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'タスクの更新に失敗しました' }));
    throw new Error(error.message || 'タスクの更新に失敗しました');
  }

  return response.json();
}

/**
 * タスクのステータスを更新（カンバン用）
 * @param id - タスクID
 * @param input - ステータス更新データ
 */
export async function updateTaskStatus(
  id: string,
  input: UpdateTaskStatusInput
): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'タスクステータスの更新に失敗しました' }));
    throw new Error(error.message || 'タスクステータスの更新に失敗しました');
  }

  return response.json();
}

/**
 * タスクを削除
 * @param id - タスクID
 */
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'タスクの削除に失敗しました' }));
    throw new Error(error.message || 'タスクの削除に失敗しました');
  }
}
