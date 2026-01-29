# Agent2: プロジェクト管理機能担当

## 担当ブランチ・ディレクトリ
- **ブランチ**: `feature/projects`
- **作業ディレクトリ**: 
  - `src/app/(dashboard)/projects/`
  - `src/lib/projects/`

## 具体的なタスク一覧

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

## 参照すべき型定義

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
```

## 編集禁止ファイル
- `src/types/index.ts` - 型定義は共有ファイルのため編集禁止
- `src/app/api/` 配下のAPIエンドポイント（Agent4が担当）
- `prisma/schema.prisma` - Agent4が担当
- `src/lib/auth/` - Agent1が担当

## 完了条件
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

## 技術的な注意事項
- APIエンドポイントはAgent4が作成するため、型定義に基づいて実装
- 認証はAgent1が実装するため、`getSession()` を使用
- プロジェクトメンバーは複数のロールを持つことができる
- プロジェクトオーナーは削除できない
