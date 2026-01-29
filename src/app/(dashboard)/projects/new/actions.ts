'use server';

import { redirect } from 'next/navigation';
import { createProject } from '@/lib/projects/mutations';
import type { ProjectInput } from '@/types';

export async function createProjectAction(input: ProjectInput) {
  await createProject(input);
  redirect('/projects');
}
