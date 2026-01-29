import type { ProjectMember, ProjectRole } from '@/types';

interface MemberListProps {
  members: ProjectMember[];
  currentUserId: string;
  ownerId: string;
  onUpdateRole?: (memberId: string, role: ProjectRole) => void;
  onRemove?: (memberId: string) => void;
  canManage?: boolean;
}

const roleLabels: Record<ProjectRole, string> = {
  [ProjectRole.OWNER]: 'オーナー',
  [ProjectRole.ADMIN]: '管理者',
  [ProjectRole.MEMBER]: 'メンバー',
  [ProjectRole.VIEWER]: '閲覧者',
};

export function MemberList({
  members,
  currentUserId,
  ownerId,
  onUpdateRole,
  onRemove,
  canManage = false,
}: MemberListProps) {
  const handleRoleChange = (memberId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as ProjectRole;
    if (onUpdateRole) {
      onUpdateRole(memberId, newRole);
    }
  };

  return (
    <div className="space-y-2">
      {members.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">メンバーがいません</p>
      ) : (
        members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const isOwner = member.userId === ownerId;
          const canEdit = canManage && !isOwner && member.userId !== currentUserId;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {member.user.name || member.user.email}
                  </span>
                  {isCurrentUser && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">（あなた）</span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {canEdit ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e)}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {Object.values(ProjectRole)
                      .filter((role) => role !== ProjectRole.OWNER)
                      .map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                  </select>
                ) : (
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {roleLabels[member.role]}
                  </span>
                )}
                {canManage && onRemove && !isOwner && member.userId !== currentUserId && (
                  <button
                    onClick={() => onRemove(member.id)}
                    className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
