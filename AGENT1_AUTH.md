# Agent1: 認証機能担当

## 担当ブランチ・ディレクトリ
- **ブランチ**: `feature/auth`
- **作業ディレクトリ**: 
  - `src/app/(auth)/`
  - `src/lib/auth/`

## 具体的なタスク一覧

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

## 参照すべき型定義

```typescript
// src/types/index.ts から使用する型
import type { User, Session, AuthFormData } from '@/types';

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
```

## 編集禁止ファイル
- `src/types/index.ts` - 型定義は共有ファイルのため編集禁止
- `prisma/schema.prisma` - Agent4が担当
- `src/app/api/` 配下の他のエンドポイント（Agent4が担当）

## 完了条件
- [ ] ログインページが動作し、認証が成功する
- [ ] 登録ページが動作し、新規ユーザーが作成される
- [ ] 認証済みユーザーはダッシュボードへリダイレクトされる
- [ ] 未認証ユーザーは認証ページへリダイレクトされる
- [ ] セッション管理が正しく動作する
- [ ] パスワードが安全にハッシュ化される
- [ ] エラーハンドリングが適切に実装されている

## 技術的な注意事項
- NextAuth.js v5 (Auth.js) を使用する場合は、適切なバージョンを確認
- パスワードハッシュ化には `bcryptjs` または `argon2` を使用
- 環境変数に `NEXTAUTH_SECRET` と `NEXTAUTH_URL` を設定する必要がある
- PrismaスキーマはAgent4が作成するが、Userモデルが必要
