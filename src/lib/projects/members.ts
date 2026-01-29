import type { ProjectMember, AddMemberInput, ProjectRole } from '@/types';

/**
 * プロジェクトにメンバーを追加
 */
export async function addMember(projectId: string, input: AddMemberInput): Promise<ProjectMember> {
  const response = await fetch(`/api/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'メンバーの追加に失敗しました' }));
    throw new Error(error.message || 'メンバーの追加に失敗しました');
  }

  return response.json();
}

/**
 * メンバーのロールを更新
 */
export async function updateMemberRole(
  projectId: string,
  memberId: string,
  role: ProjectRole
): Promise<ProjectMember> {
  const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'メンバーのロール更新に失敗しました' }));
    throw new Error(error.message || 'メンバーのロール更新に失敗しました');
  }

  return response.json();
}

/**
 * メンバーを削除
 */
export async function removeMember(projectId: string, memberId: string): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'メンバーの削除に失敗しました' }));
    throw new Error(error.message || 'メンバーの削除に失敗しました');
  }
}
