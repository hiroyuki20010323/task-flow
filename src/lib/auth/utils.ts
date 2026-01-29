import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import type { Session } from '@/types';

/**
 * サーバーサイドでセッションを取得
 */
export async function getSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
    expires: session.expires.toISOString(),
  };
}

/**
 * 認証必須のミドルウェア
 * 未認証の場合は認証ページへリダイレクト
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

/**
 * パスワードをハッシュ化
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * パスワードを検証
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
