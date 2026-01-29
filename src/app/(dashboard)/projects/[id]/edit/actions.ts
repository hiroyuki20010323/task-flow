'use server';

import { redirect } from 'next/navigation';
import { updateProject } from '@/lib/projects/mutations';
import type { ProjectInput } from '@/types';

export async function updateProjectAction(projectId: string, input: ProjectInput) {
  await updateProject(projectId, input);
  redirect(`/projects/${projectId}`);
}
