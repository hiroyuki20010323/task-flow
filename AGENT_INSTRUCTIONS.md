# TaskFlow 並列開発 - エージェント指示書

このドキュメントには、4つのエージェントそれぞれへの指示が含まれています。
各エージェントは指定されたブランチとディレクトリで作業を行います。

---

## Agent1: 認証機能担当

### 担当ブランチ・ディレクトリ
- **ブランチ**: `feature/auth`
- **作業ディレクトリ**: 
  - `src/app/(auth)/`
  - `src/lib/auth/`

### 具体的なタスク一覧

1. **NextAuth.js のセットアップ**
   - `src/lib/auth/config.ts` にNextAuth設定を作成
   - Credentials Provider を実装（email/password認証）
   - JWT セッション戦略を使用
   - セッションコールバックでユーザー情報を返す

2. **認証API エンドポイント**
   - `src/app/api/auth/[...nextauth]/route.ts` を作成
   - NextAuth のハンドラーを実装

3. **ログインページ**
   - `src/app/(auth)/login/page.tsx` を作成
   - フォームバリデーション（email, password）
   - エラーハンドリング
   - ログイン成功後のリダイレクト

4. **登録ページ**
   - `src/app/(auth)/register/page.tsx` を作成
   - フォームバリデーション（email, password, name）
   - パスワード確認フィールド
   - エラーハンドリング
   - 登録成功後のリダイレクト

5. **認証レイアウト**
   - `src/app/(auth)/layout.tsx` を作成
   - 認証済みユーザーはダッシュボードへリダイレクト

6. **認証ユーティリティ**
   - `src/lib/auth/utils.ts` に以下を作成：
     - `getSession()` - サーバーサイドでセッション取得
     - `requireAuth()` - 認証必須のミドルウェア
     - `hashPassword()` - パスワードハッシュ化
     - `verifyPassword()` - パスワード検証

7. **認証ミドルウェア**
   - `src/middleware.ts` を作成（認証保護ルートの設定）

### 参照すべき型定義

```typescript
// src/types/index.ts から使用する型
import type { User, Session, AuthFormData } from '@/types';
```

### 編集禁止ファイル
- `src/types/index.ts` - 型定義は共有ファイルのため編集禁止
- `prisma/schema.prisma` - Agent4が担当
- `src/app/api/` 配下の他のエンドポイント（Agent4が担当）

### 完了条件
- [ ] ログインページが動作し、認証が成功する
- [ ] 登録ページが動作し、新規ユーザーが作成される
- [ ] 認証済みユーザーはダッシュボードへリダイレクトされる
- [ ] 未認証ユーザーは認証ページへリダイレクトされる
- [ ] セッション管理が正しく動作する
- [ ] パスワードが安全にハッシュ化される
- [ ] エラーハンドリングが適切に実装されている

### 技術的な注意事項
- NextAuth.js v5 (Auth.js) を使用する場合は、適切なバージョンを確認
- パスワードハッシュ化には `bcryptjs` または `argon2` を使用
- 環境変数に `NEXTAUTH_SECRET` と `NEXTAUTH_URL` を設定する必要がある
- PrismaスキーマはAgent4が作成するが、Userモデルが必要

---

## Agent2: プロジェクト管理機能担当

### 担当ブランチ・ディレクトリ
- **ブランチ**: `feature/projects`
- **作業ディレクトリ**: 
  - `src/app/(dashboard)/projects/`
  - `src/lib/projects/`

### 具体的なタスク一覧

1. **プロジェクト一覧ページ**
   - `src/app/(dashboard)/projects/page.tsx` を作成
   - ユーザーが参加しているプロジェクト一覧を表示
   - プロジェクト作成ボタン
   - 検索・フィルタリング機能

2. **プロジェクト詳細ページ**
   - `src/app/(dashboard)/projects/[id]/page.tsx` を作成
   - プロジェクト情報の表示
   - メンバー一覧の表示
   - メンバー追加フォーム
   - プロジェクト編集・削除機能

3. **プロジェクト作成ページ**
   - `src/app/(dashboard)/projects/new/page.tsx` を作成
   - プロジェクト作成フォーム
   - バリデーション

4. **プロジェクト編集ページ**
   - `src/app/(dashboard)/projects/[id]/edit/page.tsx` を作成
   - プロジェクト情報編集フォーム

5. **プロジェクトライブラリ**
   - `src/lib/projects/queries.ts` - プロジェクト取得関数
   - `src/lib/projects/mutations.ts` - プロジェクト作成・更新・削除関数
   - `src/lib/projects/members.ts` - メンバー管理関数

6. **プロジェクトコンポーネント**
   - `src/components/projects/ProjectCard.tsx` - プロジェクトカード
   - `src/components/projects/ProjectForm.tsx` - プロジェクトフォーム
   - `src/components/projects/MemberList.tsx` - メンバー一覧
   - `src/components/projects/AddMemberForm.tsx` - メンバー追加フォーム

7. **権限チェック**
   - `src/lib/projects/permissions.ts` に権限チェック関数を作成
   - プロジェクトの編集・削除権限チェック
   - メンバー追加権限チェック

### 参照すべき型定義

```typescript
// src/types/index.ts から使用する型
import type { 
  Project, 
  ProjectInput, 
  ProjectMember, 
  ProjectRole,
  AddMemberInput,
  User 
} from '@/types';
```

### 編集禁止ファイル
- `src/types/index.ts` - 型定義は共有ファイルのため編集禁止
- `src/app/api/` 配下のAPIエンドポイント（Agent4が担当）
- `prisma/schema.prisma` - Agent4が担当
- `src/lib/auth/` - Agent1が担当

### 完了条件
- [ ] プロジェクト一覧ページが表示される
- [ ] プロジェクト作成ができる
- [ ] プロジェクト詳細ページが表示される
- [ ] プロジェクトの編集・削除ができる
- [ ] メンバー一覧が表示される
- [ ] メンバー追加ができる
- [ ] メンバーのロール変更ができる
- [ ] メンバー削除ができる
- [ ] 権限チェックが正しく動作する
- [ ] プロジェクトオーナーのみが削除できる
- [ ] 適切なエラーハンドリングが実装されている

### 技術的な注意事項
- APIエンドポイントはAgent4が作成するため、型定義に基づいて実装
- 認証はAgent1が実装するため、`getSession()` を使用
- プロジェクトメンバーは複数のロールを持つことができる
- プロジェクトオーナーは削除できない

---

## Agent3: タスク管理機能担当

### 担当ブランチ・ディレクトリ
- **ブランチ**: `feature/tasks`
- **作業ディレクトリ**: 
  - `src/app/(dashboard)/tasks/`
  - `src/lib/tasks/`

### 具体的なタスク一覧

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

### 参照すべき型定義

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
```

### 編集禁止ファイル
- `src/types/index.ts` - 型定義は共有ファイルのため編集禁止
- `src/app/api/` 配下のAPIエンドポイント（Agent4が担当）
- `prisma/schema.prisma` - Agent4が担当
- `src/lib/auth/` - Agent1が担当
- `src/lib/projects/` - Agent2が担当

### 完了条件
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

### 技術的な注意事項
- APIエンドポイントはAgent4が作成するため、型定義に基づいて実装
- 認証はAgent1が実装するため、`getSession()` を使用
- カンバンのドラッグ&ドロップには適切なライブラリを使用
- タスクの順序（order）はカンバン表示用の数値
- プロジェクトに紐づくタスクのみ表示・操作可能

---

## Agent4: API・データベース担当

### 担当ブランチ・ディレクトリ
- **ブランチ**: `feature/api`
- **作業ディレクトリ**: 
  - `src/app/api/`
  - `prisma/`

### 具体的なタスク一覧

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

### 参照すべき型定義

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
```

### 編集禁止ファイル
- `src/types/index.ts` - 型定義は共有ファイルのため編集禁止
- `src/lib/auth/` - Agent1が担当（ただし、NextAuth設定は連携が必要）
- `src/app/(auth)/` - Agent1が担当
- `src/app/(dashboard)/projects/` - Agent2が担当
- `src/app/(dashboard)/tasks/` - Agent3が担当

### 完了条件
- [ ] Prismaスキーマが正しく定義されている
- [ ] データベースマイグレーションが成功する
- [ ] すべてのAPIエンドポイントが実装されている
- [ ] APIレスポンスが型定義に準拠している
- [ ] 認証チェックがすべてのAPIで動作する
- [ ] エラーハンドリングが適切に実装されている
- [ ] バリデーションが実装されている
- [ ] リレーションが正しく動作する
- [ ] 権限チェックが実装されている（プロジェクトのメンバーのみアクセス可能など）

### 技術的な注意事項
- Prismaスキーマは型定義（src/types/index.ts）と整合性を保つ
- APIレスポンスは `ApiResponse<T>` 型を使用
- 認証はAgent1が実装するNextAuthと連携
- 環境変数に `DATABASE_URL` を設定する必要がある
- 本番環境では接続プールの設定を考慮
- トランザクション処理が必要な場合は適切に実装

### Prisma スキーマの参考構造

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

---

## 共通の注意事項

### 開発フロー
1. 各エージェントは指定されたブランチで作業
2. `src/types/index.ts` は共有ファイルのため、変更時は全員に通知
3. 定期的にmainブランチとマージしてコンフリクトを回避
4. 完了後、mainブランチにマージ

### 環境変数
以下の環境変数が必要です：
- `DATABASE_URL` - PostgreSQL接続URL
- `NEXTAUTH_SECRET` - NextAuth秘密鍵
- `NEXTAUTH_URL` - NextAuth URL

### 依存関係
以下のパッケージをインストールする必要があります：
```bash
npm install @prisma/client next-auth bcryptjs
npm install -D prisma @types/bcryptjs
```

### ディレクトリ構造
```
src/
├── types/
│   └── index.ts          # 共有型定義（全員参照）
├── app/
│   ├── (auth)/           # Agent1担当
│   ├── (dashboard)/      # Agent2, Agent3担当
│   │   ├── projects/     # Agent2担当
│   │   └── tasks/        # Agent3担当
│   └── api/              # Agent4担当
├── lib/
│   ├── auth/             # Agent1担当
│   ├── projects/         # Agent2担当
│   ├── tasks/            # Agent3担当
│   └── prisma.ts         # Agent4担当
└── components/
    ├── projects/         # Agent2担当
    └── tasks/            # Agent3担当
```
