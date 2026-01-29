import type { Project, ProjectInput } from '@/types';

/**
 * プロジェクトを作成
 */
export async function createProject(input: ProjectInput): Promise<Project> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'プロジェクトの作成に失敗しました' }));
    throw new Error(error.message || 'プロジェクトの作成に失敗しました');
  }

  return response.json();
}

/**
 * プロジェクトを更新
 */
export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'プロジェクトの更新に失敗しました' }));
    throw new Error(error.message || 'プロジェクトの更新に失敗しました');
  }

  return response.json();
}

/**
 * プロジェクトを削除
 */
export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'プロジェクトの削除に失敗しました' }));
    throw new Error(error.message || 'プロジェクトの削除に失敗しました');
  }
}
