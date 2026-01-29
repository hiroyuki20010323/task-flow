import type { Project } from '@/types';

/**
 * ユーザーが参加しているプロジェクト一覧を取得
 */
export async function getProjects(): Promise<Project[]> {
  const response = await fetch('/api/projects', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // 常に最新のデータを取得
  });

  if (!response.ok) {
    throw new Error('プロジェクトの取得に失敗しました');
  }

  return response.json();
}

/**
 * プロジェクトIDでプロジェクトを取得
 */
export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // 常に最新のデータを取得
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('プロジェクトが見つかりません');
    }
    throw new Error('プロジェクトの取得に失敗しました');
  }

  return response.json();
}
