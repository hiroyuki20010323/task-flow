import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse } from '@/lib/api/utils';
import { handleApiError } from '@/lib/api/middleware';

/**
 * ログインAPI
 * POST /api/auth/login
 * 
 * 注意: NextAuthを使用する場合は、このエンドポイントは不要になる可能性があります
 * Agent1がNextAuthを実装したら、適切に連携してください
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse('Validation Error', 'メールアドレスとパスワードは必須です'),
        { status: 400 }
      );
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'メールアドレスまたはパスワードが正しくありません'),
        { status: 401 }
      );
    }

    // パスワードを検証
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'メールアドレスまたはパスワードが正しくありません'),
        { status: 401 }
      );
    }

    // ユーザー情報を返す（パスワードは除外）
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      createApiResponse(userData, 'ログインに成功しました')
    );
  } catch (error) {
    return handleApiError(error);
  }
}
