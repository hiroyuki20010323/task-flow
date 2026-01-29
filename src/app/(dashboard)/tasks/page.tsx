import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTasks } from '@/lib/tasks/queries';
import { TaskCard } from '@/components/tasks/TaskCard';
import type { TaskStatus, TaskPriority } from '@/types';
import { TaskStatus as TaskStatusEnum, TaskPriority as TaskPriorityEnum } from '@/types';

// TODO: Agent1が実装する認証を使用
// import { getSession } from '@/lib/auth';

type SortBy = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
type SortOrder = 'asc' | 'desc';

interface SearchParams {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function TasksPage({ searchParams }: PageProps) {
  // TODO: 認証チェック
  // const session = await getSession();
  // if (!session) {
  //   redirect('/login');
  // }

  const params = await searchParams;
  let tasks = await getTasks({
    projectId: params.projectId,
    status: params.status,
    priority: params.priority,
    assigneeId: params.assigneeId,
  });

  // ソート処理
  const sortBy = params.sortBy || 'updatedAt';
  const sortOrder = params.sortOrder || 'desc';
  tasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title, 'ja');
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">タスク一覧</h1>
        {params.projectId ? (
          <Link
            href={`/projects/${params.projectId}/tasks/new`}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            新規タスク
          </Link>
        ) : (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            プロジェクトを選択してタスクを作成
          </span>
        )}
      </div>

      {/* フィルター・ソート */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <form method="get" className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              ステータス
            </label>
            <select
              id="status"
              name="status"
              defaultValue={params.status || ''}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">すべて</option>
              <option value={TaskStatusEnum.TODO}>TODO</option>
              <option value={TaskStatusEnum.IN_PROGRESS}>IN_PROGRESS</option>
              <option value={TaskStatusEnum.REVIEW}>REVIEW</option>
              <option value={TaskStatusEnum.DONE}>DONE</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              優先度
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={params.priority || ''}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">すべて</option>
              <option value={TaskPriorityEnum.LOW}>低</option>
              <option value={TaskPriorityEnum.MEDIUM}>中</option>
              <option value={TaskPriorityEnum.HIGH}>高</option>
              <option value={TaskPriorityEnum.URGENT}>緊急</option>
            </select>
          </div>

          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              プロジェクトID
            </label>
            <input
              id="projectId"
              name="projectId"
              type="text"
              defaultValue={params.projectId || ''}
              placeholder="プロジェクトID"
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              並び替え
            </label>
            <select
              id="sortBy"
              name="sortBy"
              defaultValue={params.sortBy || 'updatedAt'}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="updatedAt">更新日時</option>
              <option value="createdAt">作成日時</option>
              <option value="dueDate">期限</option>
              <option value="priority">優先度</option>
              <option value="title">タイトル</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              順序
            </label>
            <select
              id="sortOrder"
              name="sortOrder"
              defaultValue={params.sortOrder || 'desc'}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              適用
            </button>
          </div>
        </form>
      </div>

      {/* タスク一覧 */}
      {tasks.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">タスクがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
