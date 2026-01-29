import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getProject } from '@/lib/projects/queries';
import { getSession } from '@/lib/auth/session';
import { canEditProject } from '@/lib/projects/permissions';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { updateProjectAction } from './actions';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
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

  // 編集権限がない場合はアクセス拒否
  if (!canEditProject(project, session.user.id)) {
    redirect(`/projects/${id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/projects/${id}`}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← プロジェクト詳細に戻る
        </Link>
        <h1 className="mb-6 mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          プロジェクトを編集
        </h1>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <ProjectForm
            initialData={{
              name: project.name,
              description: project.description,
            }}
            onSubmit={async (data) => {
              await updateProjectAction(id, data);
            }}
            submitLabel="更新"
          />
        </div>
      </div>
    </div>
  );
}
