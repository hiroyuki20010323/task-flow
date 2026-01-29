import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/utils';
import { createApiResponse, createErrorResponse } from '@/lib/api/utils';
import { handleApiError } from '@/lib/api/middleware';

/**
 * ユーザー登録API
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse('Validation Error', 'メールアドレスとパスワードは必須です'),
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        createErrorResponse('Validation Error', 'パスワードは8文字以上である必要があります'),
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        createErrorResponse('Validation Error', '有効なメールアドレスを入力してください'),
        { status: 400 }
      );
    }

    // 既存ユーザーのチェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        createErrorResponse('Conflict', 'このメールアドレスは既に登録されています'),
        { status: 409 }
      );
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        password: hashedPassword,
        name: name ? name.trim() : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      createApiResponse(user, 'ユーザー登録が完了しました'),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
