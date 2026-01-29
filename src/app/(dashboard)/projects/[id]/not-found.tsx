import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        プロジェクトが見つかりません
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        指定されたプロジェクトは存在しないか、アクセス権限がありません。
      </p>
      <Link
        href="/projects"
        className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        プロジェクト一覧に戻る
      </Link>
    </div>
  );
}
