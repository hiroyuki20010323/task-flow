import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse, createPaginatedResponse, getPaginationParams } from '@/lib/api/utils';
import { requireAuth, handleApiError, checkProjectMember } from '@/lib/api/middleware';

/**
 * プロジェクト別タスク一覧取得
 * GET /api/projects/[id]/tasks
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
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');

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

    // フィルター条件を構築
    const where: any = {
      projectId: id,
    };

    if (status && ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].includes(status)) {
      where.status = status;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    // タスク一覧を取得
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
          creator: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json(
      createPaginatedResponse(tasks, page, limit, total)
    );
  } catch (error) {
    return handleApiError(error);
  }
}
