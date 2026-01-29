/**
 * タスクのステータス
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

/**
 * タスクの優先度
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * ユーザー
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * タスク
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  project: Project;
  assigneeId: string | null;
  assignee: User | null;
  creatorId: string;
  creator: User;
  dueDate: Date | null;
  order: number; // カンバン表示順序
  createdAt: Date;
  updatedAt: Date;
}

/**
 * タスク作成/更新用のデータ
 */
export interface TaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: Date | null;
  order?: number;
}

/**
 * タスクステータス更新用のデータ
 */
export interface UpdateTaskStatusInput {
  status: TaskStatus;
  order?: number; // カンバン内での順序変更時
}

/**
 * カンバン表示用のタスクグループ
 */
export interface KanbanColumn {
  status: TaskStatus;
  tasks: Task[];
}

/**
 * カンバンボード全体のデータ
 */
export interface KanbanBoard {
  columns: KanbanColumn[];
  project: Project;
}
