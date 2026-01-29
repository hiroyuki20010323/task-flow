import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProjects } from '@/lib/projects/queries';
import { getSession } from '@/lib/auth/session';
import { ProjectCard } from '@/components/projects/ProjectCard';

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  let projects;
  try {
    projects = await getProjects();
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    projects = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">プロジェクト</h1>
        <Link
          href="/projects/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          プロジェクトを作成
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">プロジェクトがありません</p>
          <Link
            href="/projects/new"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            最初のプロジェクトを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
