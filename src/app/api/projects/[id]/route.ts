import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse } from '@/lib/api/utils';
import { requireAuth, handleApiError, checkProjectMember } from '@/lib/api/middleware';

/**
 * プロジェクト取得
 * GET /api/projects/[id]
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

    // プロジェクトを取得
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        members: {
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
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
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

    return NextResponse.json(createApiResponse(project));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * プロジェクト更新
 * PUT /api/projects/[id]
 */
export async function PUT(
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
    const { name, description } = body;

    // プロジェクトの存在確認と権限チェック
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            userId,
            role: {
              in: ['OWNER', 'ADMIN'],
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'プロジェクトが見つかりません'),
        { status: 404 }
      );
    }

    // オーナーまたは管理者のみ更新可能
    if (project.ownerId !== userId && project.members.length === 0) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'プロジェクトを更新する権限がありません'),
        { status: 403 }
      );
    }

    // バリデーション
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        createErrorResponse('Validation Error', 'プロジェクト名は空にできません'),
        { status: 400 }
      );
    }

    // プロジェクトを更新
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        members: {
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
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(
      createApiResponse(updatedProject, 'プロジェクトを更新しました')
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * プロジェクト削除
 * DELETE /api/projects/[id]
 */
export async function DELETE(
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

    // オーナーのみ削除可能
    if (project.ownerId !== userId) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'プロジェクトを削除する権限がありません'),
        { status: 403 }
      );
    }

    // プロジェクトを削除（CASCADEでメンバーとタスクも削除される）
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json(
      createApiResponse(null, 'プロジェクトを削除しました')
    );
  } catch (error) {
    return handleApiError(error);
  }
}
