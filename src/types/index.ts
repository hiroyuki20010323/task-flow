/**
 * ユーザー
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

/**
 * プロジェクトのロール
 */
export enum ProjectRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

/**
 * プロジェクトメンバー
 */
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  user: User;
  createdAt: Date;
}

/**
 * タスク（簡易版）
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * プロジェクト
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: User;
  members: ProjectMember[];
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * プロジェクト作成/更新用のデータ
 */
export interface ProjectInput {
  name: string;
  description?: string | null;
}

/**
 * プロジェクトメンバー追加用のデータ
 */
export interface AddMemberInput {
  email: string;
  role: ProjectRole;
}
