import Link from 'next/link';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
            <span>{project.members.length} メンバー</span>
            <span>{project.tasks.length} タスク</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
