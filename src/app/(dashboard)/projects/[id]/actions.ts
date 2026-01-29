'use server';

import { redirect } from 'next/navigation';
import { addMember, updateMemberRole, removeMember } from '@/lib/projects/members';
import { deleteProject } from '@/lib/projects/mutations';
import type { ProjectRole, AddMemberInput } from '@/types';

export async function addMemberAction(projectId: string, input: AddMemberInput) {
  await addMember(projectId, input);
  redirect(`/projects/${projectId}`);
}

export async function updateMemberRoleAction(
  projectId: string,
  memberId: string,
  role: ProjectRole
) {
  await updateMemberRole(projectId, memberId, role);
  redirect(`/projects/${projectId}`);
}

export async function removeMemberAction(projectId: string, memberId: string) {
  await removeMember(projectId, memberId);
  redirect(`/projects/${projectId}`);
}

export async function deleteProjectAction(projectId: string) {
  await deleteProject(projectId);
  redirect('/projects');
}
