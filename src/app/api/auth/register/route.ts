import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
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
