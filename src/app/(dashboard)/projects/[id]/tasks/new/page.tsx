import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TaskForm } from '@/components/tasks/TaskForm';
import { createTask } from '@/lib/tasks/mutations';
import type { TaskInput } from '@/types';

// TODO: Agent1が実装する認証を使用
// import { getSession } from '@/lib/auth';
// TODO: Agent2が実装するプロジェクト取得を使用
// import { getProject } from '@/lib/projects/queries';
// TODO: Agent2が実装するユーザー取得を使用
// import { getUsers } from '@/lib/users/queries';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewTaskPage({ params }: PageProps) {
  // TODO: 認証チェック
  // const session = await getSession();
  // if (!session) {
  //   redirect('/login');
  // }

  const { id: projectId } = await params;

  // TODO: プロジェクトの存在確認
  // const project = await getProject(projectId);
  // if (!project) {
  //   redirect('/projects');
  // }

  // TODO: ユーザー一覧の取得
  // const users = await getUsers();

  async function handleSubmit(input: TaskInput & { projectId?: string }) {
    'use server';
    await createTask({
      ...input,
      projectId,
    });
    redirect(`/projects/${projectId}/kanban`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}/kanban`}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← カンバンボードに戻る
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">新規タスク作成</h1>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <TaskForm projectId={projectId} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
