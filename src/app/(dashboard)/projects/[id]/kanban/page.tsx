import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getKanbanBoard } from '@/lib/tasks/kanban';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';

// TODO: Agent1が実装する認証を使用
// import { getSession } from '@/lib/auth';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KanbanPage({ params }: PageProps) {
  // TODO: 認証チェック
  // const session = await getSession();
  // if (!session) {
  //   redirect('/login');
  // }

  const { id } = await params;

  let board;
  try {
    board = await getKanbanBoard(id);
  } catch (error) {
    redirect('/projects');
  }

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/projects/${id}`}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← プロジェクトに戻る
        </Link>
        <Link
          href={`/projects/${id}/tasks/new`}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          新規タスク
        </Link>
      </div>

      <div className="h-full">
        <KanbanBoard initialBoard={board} />
      </div>
    </div>
  );
}
