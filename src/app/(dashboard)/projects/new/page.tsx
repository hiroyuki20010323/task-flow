import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { createProjectAction } from './actions';

export default async function NewProjectPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          新しいプロジェクトを作成
        </h1>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <ProjectForm onSubmit={createProjectAction} />
        </div>
      </div>
    </div>
  );
}
