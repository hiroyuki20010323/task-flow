# Agent3: タスク管理機能担当

## 担当ブランチ・ディレクトリ
- **ブランチ**: `feature/tasks`
- **作業ディレクトリ**: 
  - `src/app/(dashboard)/tasks/`
  - `src/lib/tasks/`

## 具体的なタスク一覧

1. **タスク一覧ページ**
   - `src/app/(dashboard)/tasks/page.tsx` を作成
   - プロジェクト別のタスク一覧表示
   - フィルタリング（ステータス、優先度、担当者）
   - ソート機能

2. **タスク詳細ページ**
   - `src/app/(dashboard)/tasks/[id]/page.tsx` を作成
   - タスク情報の詳細表示
   - タスク編集フォーム
   - コメント機能（オプション）

3. **カンバンボードページ**
   - `src/app/(dashboard)/projects/[id]/kanban/page.tsx` を作成
   - カンバン形式でのタスク表示
   - ドラッグ&ドロップでステータス変更
   - タスクの順序変更

4. **タスク作成ページ**
   - `src/app/(dashboard)/projects/[id]/tasks/new/page.tsx` を作成
   - タスク作成フォーム
   - プロジェクト選択
   - 担当者選択

5. **タスクライブラリ**
   - `src/lib/tasks/queries.ts` - タスク取得関数
   - `src/lib/tasks/mutations.ts` - タスク作成・更新・削除関数
   - `src/lib/tasks/kanban.ts` - カンバン関連関数

6. **タスクコンポーネント**
   - `src/components/tasks/TaskCard.tsx` - タスクカード
   - `src/components/tasks/TaskForm.tsx` - タスクフォーム
   - `src/components/tasks/KanbanBoard.tsx` - カンバンボード
   - `src/components/tasks/KanbanColumn.tsx` - カンバンカラム
   - `src/components/tasks/TaskItem.tsx` - カンバン内のタスクアイテム

7. **ドラッグ&ドロップ機能**
   - `react-beautiful-dnd` または `@dnd-kit/core` を使用
   - タスクのステータス変更
   - タスクの順序変更

## 参照すべき型定義

```typescript
// src/types/index.ts から使用する型
import type { 
  Task, 
  TaskInput, 
  TaskStatus, 
  TaskPriority,
  UpdateTaskStatusInput,
  KanbanBoard,
  KanbanColumn,
  Project,
  User 
} from '@/types';

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
```

## 編集禁止ファイル
- `src/types/index.ts` - 型定義は共有ファイルのため編集禁止
- `src/app/api/` 配下のAPIエンドポイント（Agent4が担当）
- `prisma/schema.prisma` - Agent4が担当
- `src/lib/auth/` - Agent1が担当
- `src/lib/projects/` - Agent2が担当

## 完了条件
- [ ] タスク一覧ページが表示される
- [ ] タスク作成ができる
- [ ] タスク詳細ページが表示される
- [ ] タスクの編集・削除ができる
- [ ] タスクのステータス変更ができる
- [ ] タスクの優先度変更ができる
- [ ] タスクの担当者割り当てができる
- [ ] カンバンボードが表示される
- [ ] ドラッグ&ドロップでステータス変更ができる
- [ ] カンバン内でのタスク順序変更ができる
- [ ] フィルタリング・ソート機能が動作する
- [ ] 適切なエラーハンドリングが実装されている

## 技術的な注意事項
- APIエンドポイントはAgent4が作成するため、型定義に基づいて実装
- 認証はAgent1が実装するため、`getSession()` を使用
- カンバンのドラッグ&ドロップには適切なライブラリを使用
- タスクの順序（order）はカンバン表示用の数値
- プロジェクトに紐づくタスクのみ表示・操作可能
