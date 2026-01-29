# Agent4: API・データベース担当

## 担当ブランチ・ディレクトリ
- **ブランチ**: `feature/api`
- **作業ディレクトリ**: 
  - `src/app/api/`
  - `prisma/`

## 具体的なタスク一覧

1. **Prisma スキーマ定義**
   - `prisma/schema.prisma` を作成
   - User, Project, ProjectMember, Task モデルを定義
   - リレーションを適切に設定
   - インデックスを設定

2. **データベースマイグレーション**
   - 初期マイグレーションファイルを作成
   - マイグレーションコマンドを実行

3. **Prisma クライアント設定**
   - `src/lib/prisma.ts` を作成
   - PrismaClient のシングルトンインスタンス

4. **認証API**
   - `src/app/api/auth/register/route.ts` - ユーザー登録
   - `src/app/api/auth/login/route.ts` - ログイン（NextAuth使用時は不要かも）

5. **プロジェクトAPI**
   - `src/app/api/projects/route.ts` - プロジェクト一覧取得・作成
   - `src/app/api/projects/[id]/route.ts` - プロジェクト取得・更新・削除
   - `src/app/api/projects/[id]/members/route.ts` - メンバー一覧・追加
   - `src/app/api/projects/[id]/members/[memberId]/route.ts` - メンバー更新・削除

6. **タスクAPI**
   - `src/app/api/tasks/route.ts` - タスク一覧取得・作成
   - `src/app/api/tasks/[id]/route.ts` - タスク取得・更新・削除
   - `src/app/api/tasks/[id]/status/route.ts` - タスクステータス更新
   - `src/app/api/projects/[id]/tasks/route.ts` - プロジェクト別タスク一覧
   - `src/app/api/projects/[id]/kanban/route.ts` - カンバンボードデータ取得

7. **API ミドルウェア**
   - 認証チェックミドルウェア
   - エラーハンドリングミドルウェア
   - バリデーションミドルウェア

8. **API ユーティリティ**
   - `src/lib/api/utils.ts` に以下を作成：
     - `createApiResponse()` - 成功レスポンス作成
     - `createErrorResponse()` - エラーレスポンス作成
     - `validateRequest()` - リクエストバリデーション

## 参照すべき型定義

```typescript
// src/types/index.ts から使用する型
import type { 
  User,
  Project, 
  ProjectInput,
  ProjectMember,
  ProjectRole,
  AddMemberInput,
  Task, 
  TaskInput,
  TaskStatus,
  TaskPriority,
  UpdateTaskStatusInput,
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  KanbanBoard
} from '@/types';

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
```

## 編集禁止ファイル
- `src/types/index.ts` - 型定義は共有ファイルのため編集禁止
- `src/lib/auth/` - Agent1が担当（ただし、NextAuth設定は連携が必要）
- `src/app/(auth)/` - Agent1が担当
- `src/app/(dashboard)/projects/` - Agent2が担当
- `src/app/(dashboard)/tasks/` - Agent3が担当

## 完了条件
- [ ] Prismaスキーマが正しく定義されている
- [ ] データベースマイグレーションが成功する
- [ ] すべてのAPIエンドポイントが実装されている
- [ ] APIレスポンスが型定義に準拠している
- [ ] 認証チェックがすべてのAPIで動作する
- [ ] エラーハンドリングが適切に実装されている
- [ ] バリデーションが実装されている
- [ ] リレーションが正しく動作する
- [ ] 権限チェックが実装されている（プロジェクトのメンバーのみアクセス可能など）

## 技術的な注意事項
- Prismaスキーマは型定義（src/types/index.ts）と整合性を保つ
- APIレスポンスは `ApiResponse<T>` 型を使用
- 認証はAgent1が実装するNextAuthと連携
- 環境変数に `DATABASE_URL` を設定する必要がある
- 本番環境では接続プールの設定を考慮
- トランザクション処理が必要な場合は適切に実装

## Prisma スキーマの参考構造

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  password  String   // ハッシュ化されたパスワード
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  ownedProjects Project[] @relation("ProjectOwner")
  projectMembers ProjectMember[]
  createdTasks Task[] @relation("TaskCreator")
  assignedTasks Task[] @relation("TaskAssignee")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  ownerId     String
  owner       User     @relation("ProjectOwner", fields: [ownerId], references: [id])
  members     ProjectMember[]
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([ownerId])
}

model ProjectMember {
  id        String      @id @default(cuid())
  projectId String
  userId    String
  role      ProjectRole @default(MEMBER)
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime    @default(now())
  
  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}

model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  projectId   String
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assigneeId String?
  assignee    User?        @relation("TaskAssignee", fields: [assigneeId], references: [id])
  creatorId   String
  creator     User         @relation("TaskCreator", fields: [creatorId], references: [id])
  dueDate     DateTime?
  order       Int          @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  @@index([projectId])
  @@index([status])
  @@index([assigneeId])
}

enum ProjectRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```
