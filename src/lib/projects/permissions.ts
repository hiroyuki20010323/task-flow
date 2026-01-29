import type { Project, ProjectMember, ProjectRole } from '@/types';

/**
 * ユーザーIDとプロジェクトから、ユーザーのメンバー情報を取得
 */
function getUserMember(project: Project, userId: string): ProjectMember | undefined {
  return project.members.find((member) => member.userId === userId);
}

/**
 * ユーザーがプロジェクトのオーナーかどうかをチェック
 */
export function isOwner(project: Project, userId: string): boolean {
  return project.ownerId === userId;
}

/**
 * ユーザーがプロジェクトの管理者以上かどうかをチェック
 */
export function isAdminOrOwner(project: Project, userId: string): boolean {
  if (isOwner(project, userId)) {
    return true;
  }
  const member = getUserMember(project, userId);
  return member?.role === ProjectRole.ADMIN;
}

/**
 * ユーザーがプロジェクトの編集権限を持っているかどうかをチェック
 */
export function canEditProject(project: Project, userId: string): boolean {
  return isAdminOrOwner(project, userId);
}

/**
 * ユーザーがプロジェクトの削除権限を持っているかどうかをチェック
 */
export function canDeleteProject(project: Project, userId: string): boolean {
  return isOwner(project, userId);
}

/**
 * ユーザーがメンバー追加権限を持っているかどうかをチェック
 */
export function canAddMember(project: Project, userId: string): boolean {
  return isAdminOrOwner(project, userId);
}

/**
 * ユーザーがメンバー管理権限を持っているかどうかをチェック
 */
export function canManageMember(project: Project, userId: string, targetMemberId: string): boolean {
  // オーナーは常に管理可能
  if (isOwner(project, userId)) {
    return true;
  }

  // 管理者は自分以外を管理可能
  const member = getUserMember(project, userId);
  if (member?.role === ProjectRole.ADMIN) {
    const targetMember = project.members.find((m) => m.id === targetMemberId);
    return targetMember?.userId !== userId;
  }

  return false;
}

/**
 * ユーザーがプロジェクトのメンバーかどうかをチェック
 */
export function isMember(project: Project, userId: string): boolean {
  return isOwner(project, userId) || getUserMember(project, userId) !== undefined;
}
