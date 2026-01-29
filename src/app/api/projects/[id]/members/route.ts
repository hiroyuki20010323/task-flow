import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse } from '@/lib/api/utils';
import { requireAuth, handleApiError, checkProjectMember, checkProjectOwnerOrAdmin } from '@/lib/api/middleware';

/**
 * プロジェクトメンバー一覧取得
 * GET /api/projects/[id]/members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { id } = await params;

    // プロジェクトの存在確認
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'プロジェクトが見つかりません'),
        { status: 404 }
      );
    }

    // メンバーかオーナーかチェック
    const isMember = project.ownerId === userId || await checkProjectMember(id, userId);
    if (!isMember) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'このプロジェクトにアクセスする権限がありません'),
        { status: 403 }
      );
    }

    // メンバー一覧を取得
    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(createApiResponse(members));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * プロジェクトメンバー追加
 * POST /api/projects/[id]/members
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { id } = await params;
    const body = await request.json();
    const { userId: targetUserId, role = 'MEMBER' } = body;

    // バリデーション
    if (!targetUserId) {
      return NextResponse.json(
        createErrorResponse('Validation Error', 'ユーザーIDは必須です'),
        { status: 400 }
      );
    }

    if (!['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        createErrorResponse('Validation Error', '無効なロールです'),
        { status: 400 }
      );
    }

    // プロジェクトの存在確認と権限チェック
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'プロジェクトが見つかりません'),
        { status: 404 }
      );
    }

    // オーナーまたは管理者のみメンバーを追加可能
    const canManage = await checkProjectOwnerOrAdmin(id, userId);
    if (!canManage) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'メンバーを追加する権限がありません'),
        { status: 403 }
      );
    }

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'ユーザーが見つかりません'),
        { status: 404 }
      );
    }

    // 既にメンバーかチェック
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: targetUserId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        createErrorResponse('Conflict', 'このユーザーは既にメンバーです'),
        { status: 409 }
      );
    }

    // メンバーを追加
    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: targetUserId,
        role: role as 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      createApiResponse(member, 'メンバーを追加しました'),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
