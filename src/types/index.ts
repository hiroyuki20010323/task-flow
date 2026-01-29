/**
 * TaskFlow - 共有型定義
 * このファイルは全エージェントで共有されます。
 * 編集する場合は、全エージェントに影響するため注意してください。
 */

// ==================== 認証関連 ====================

/**
 * ユーザー情報
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * セッション情報
 */
export interface Session {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
  expires: string;
}

/**
 * 認証フォームデータ
 */
export interface AuthFormData {
  email: string;
  password: string;
  name?: string; // 登録時のみ
}

// ==================== プロジェクト関連 ====================

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

// ==================== タスク関連 ====================

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

// ==================== API関連 ====================

/**
 * API レスポンスの基本型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * ページネーション情報
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * ページネーション付きレスポンス
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// ==================== カンバン関連 ====================

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

// ==================== ユーティリティ型 ====================

/**
 * 部分更新用の型
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * IDのみの型
 */
export interface WithId {
  id: string;
}

/**
 * タイムスタンプ付きの型
 */
export interface WithTimestamps {
  createdAt: Date;
  updatedAt: Date;
}
