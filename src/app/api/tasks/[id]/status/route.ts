import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse } from '@/lib/api/utils';
import { requireAuth, handleApiError, checkProjectMember } from '@/lib/api/middleware';

/**
 * タスクステータス更新
 * PUT /api/tasks/[id]/status
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
    const { status, order } = body;

    // バリデーション
    if (!status || !['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].includes(status)) {
      return NextResponse.json(
        createErrorResponse('Validation Error', '有効なステータスを指定してください'),
        { status: 400 }
      );
    }

    // タスクの存在確認と権限チェック
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'タスクが見つかりません'),
        { status: 404 }
      );
    }

    // プロジェクトメンバーかチェック
    const isMember = await checkProjectMember(task.projectId, userId);
    if (!isMember) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'このタスクを更新する権限がありません'),
        { status: 403 }
      );
    }

    // タスクステータスを更新
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: status as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
        ...(order !== undefined && { order: parseInt(order, 10) }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
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
    });

    return NextResponse.json(
      createApiResponse(updatedTask, 'タスクステータスを更新しました')
    );
  } catch (error) {
    return handleApiError(error);
  }
}
