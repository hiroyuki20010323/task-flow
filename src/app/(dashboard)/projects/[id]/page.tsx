import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getProject } from '@/lib/projects/queries';
import { getSession } from '@/lib/auth/session';
import {
  canEditProject,
  canDeleteProject,
  canAddMember,
  isMember,
} from '@/lib/projects/permissions';
import { MemberList } from '@/components/projects/MemberList';
import { AddMemberForm } from '@/components/projects/AddMemberForm';
import { DeleteProjectButton } from '@/components/projects/DeleteProjectButton';
import {
  addMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
  deleteProjectAction,
} from './actions';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  let project;
  try {
    project = await getProject(id);
  } catch (error) {
    notFound();
  }

  // メンバーでない場合はアクセス拒否
  if (!isMember(project, session.user.id)) {
    redirect('/projects');
  }

  const canEdit = canEditProject(project, session.user.id);
  const canDelete = canDeleteProject(project, session.user.id);
  const canAdd = canAddMember(project, session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/projects"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← プロジェクト一覧に戻る
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              href={`/projects/${id}/edit`}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              編集
            </Link>
          )}
          {canDelete && (
            <DeleteProjectButton
              onDelete={async () => {
                await deleteProjectAction(id);
              }}
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            メンバー ({project.members.length})
          </h2>
          <MemberList
            members={project.members}
            currentUserId={session.user.id}
            ownerId={project.ownerId}
            onUpdateRole={
              canAdd
                ? async (memberId, role) => {
                    await updateMemberRoleAction(id, memberId, role);
                  }
                : undefined
            }
            onRemove={
              canAdd
                ? async (memberId) => {
                    await removeMemberAction(id, memberId);
                  }
                : undefined
            }
            canManage={canAdd}
          />
          {canAdd && (
            <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                メンバーを追加
              </h3>
              <AddMemberForm
                onSubmit={async (input) => {
                  await addMemberAction(id, input);
                }}
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            タスク ({project.tasks.length})
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            タスク機能は別のエージェントが実装予定です。
          </p>
        </div>
      </div>
    </div>
  );
}
