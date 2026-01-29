import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTask } from '@/lib/tasks/queries';
import { deleteTask } from '@/lib/tasks/mutations';
import { TaskForm } from '@/components/tasks/TaskForm';
import { updateTask } from '@/lib/tasks/mutations';
import type { TaskInput } from '@/types';

// TODO: Agent1が実装する認証を使用
// import { getSession } from '@/lib/auth';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
  // TODO: 認証チェック
  // const session = await getSession();
  // if (!session) {
  //   redirect('/login');
  // }

  const { id } = await params;

  let task;
  try {
    task = await getTask(id);
  } catch (error) {
    redirect('/tasks');
  }

  async function handleUpdate(input: TaskInput & { projectId?: string }) {
    'use server';
    await updateTask(id, input);
    redirect(`/tasks/${id}`);
  }

  async function handleDelete() {
    'use server';
    await deleteTask(id);
    redirect('/tasks');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/tasks"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← タスク一覧に戻る
        </Link>
        <Link
          href={`/projects/${task.projectId}/kanban`}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          カンバンボードを見る →
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">タスク詳細</h1>
        <form action={handleDelete}>
          <button
            type="submit"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={(e) => {
              if (!confirm('このタスクを削除しますか？')) {
                e.preventDefault();
              }
            }}
          >
            削除
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <TaskForm task={task} onSubmit={handleUpdate} />
      </div>

      {/* タスク情報の表示 */}
      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">タスク情報</h2>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">作成日時</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
              {new Date(task.createdAt).toLocaleString('ja-JP')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">更新日時</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
              {new Date(task.updatedAt).toLocaleString('ja-JP')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">作成者</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{task.creator.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">プロジェクト</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{task.project.name}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
