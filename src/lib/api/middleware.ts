import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from './utils';

/**
 * 認証チェックミドルウェア
 * NextAuthのセッションを取得してユーザーIDを返す
 * TODO: Agent1がNextAuthを実装したら、適切にセッションを取得する
 */
export async function getAuthUser(request: NextRequest): Promise<string | null> {
  // TODO: NextAuthのセッションを取得
  // const session = await getServerSession(authOptions);
  // return session?.user?.id || null;
  
  // 一時的な実装: AuthorizationヘッダーからユーザーIDを取得
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // 実際の実装では、JWTトークンを検証する必要がある
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * 認証が必要なAPIのミドルウェア
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const userId = await getAuthUser(request);
  
  if (!userId) {
    return NextResponse.json(
      createErrorResponse('Unauthorized', '認証が必要です'),
      { status: 401 }
    );
  }
  
  return { userId };
}

/**
 * エラーハンドリングミドルウェア
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return NextResponse.json(
      createErrorResponse(error.message, 'リクエストの処理中にエラーが発生しました'),
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    createErrorResponse('Internal Server Error', '予期しないエラーが発生しました'),
    { status: 500 }
  );
}

/**
 * プロジェクトメンバーかどうかをチェック
 */
export async function checkProjectMember(
  projectId: string,
  userId: string
): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
  
  return !!member;
}

/**
 * プロジェクトのオーナーか管理者かどうかをチェック
 */
export async function checkProjectOwnerOrAdmin(
  projectId: string,
  userId: string
): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              role: {
                in: ['OWNER', 'ADMIN'],
              },
            },
          },
        },
      ],
    },
  });
  
  return !!project;
}
