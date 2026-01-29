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
