import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse } from '@/lib/api/utils';
import { requireAuth, handleApiError, checkProjectOwnerOrAdmin } from '@/lib/api/middleware';

/**
 * プロジェクトメンバー更新
 * PUT /api/projects/[id]/members/[memberId]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { id, memberId } = await params;
    const body = await request.json();
    const { role } = body;

    // バリデーション
    if (!role || !['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        createErrorResponse('Validation Error', '有効なロールを指定してください'),
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

    // オーナーまたは管理者のみメンバーを更新可能
    const canManage = await checkProjectOwnerOrAdmin(id, userId);
    if (!canManage) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'メンバーを更新する権限がありません'),
        { status: 403 }
      );
    }

    // メンバーの存在確認
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: memberId,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'メンバーが見つかりません'),
        { status: 404 }
      );
    }

    // オーナーを変更しようとしている場合のチェック
    if (role === 'OWNER' && project.ownerId !== memberId) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'オーナーは変更できません'),
        { status: 403 }
      );
    }

    // メンバーを更新
    const updatedMember = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId: id,
          userId: memberId,
        },
      },
      data: {
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
      createApiResponse(updatedMember, 'メンバーを更新しました')
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * プロジェクトメンバー削除
 * DELETE /api/projects/[id]/members/[memberId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { id, memberId } = await params;

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

    // オーナーまたは管理者のみメンバーを削除可能
    const canManage = await checkProjectOwnerOrAdmin(id, userId);
    if (!canManage) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'メンバーを削除する権限がありません'),
        { status: 403 }
      );
    }

    // メンバーの存在確認
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: memberId,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'メンバーが見つかりません'),
        { status: 404 }
      );
    }

    // オーナーを削除しようとしている場合のチェック
    if (project.ownerId === memberId) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'オーナーは削除できません'),
        { status: 403 }
      );
    }

    // メンバーを削除
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: id,
          userId: memberId,
        },
      },
    });

    return NextResponse.json(
      createApiResponse(null, 'メンバーを削除しました')
    );
  } catch (error) {
    return handleApiError(error);
  }
}
