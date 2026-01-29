import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse } from '@/lib/api/utils';
import { requireAuth, handleApiError, checkProjectMember } from '@/lib/api/middleware';

/**
 * タスク取得
 * GET /api/tasks/[id]
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

    // タスクを取得
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
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
        createErrorResponse('Forbidden', 'このタスクにアクセスする権限がありません'),
        { status: 403 }
      );
    }

    return NextResponse.json(createApiResponse(task));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * タスク更新
 * PUT /api/tasks/[id]
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
    const {
      title,
      description,
      assigneeId,
      priority,
      dueDate,
      order,
    } = body;

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

    // バリデーション
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json(
        createErrorResponse('Validation Error', 'タスクタイトルは空にできません'),
        { status: 400 }
      );
    }

    if (priority !== undefined && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      return NextResponse.json(
        createErrorResponse('Validation Error', '無効な優先度です'),
        { status: 400 }
      );
    }

    // 担当者が指定されている場合、そのユーザーがメンバーかチェック
    if (assigneeId !== undefined && assigneeId !== null) {
      const isAssigneeMember = await checkProjectMember(task.projectId, assigneeId);
      if (!isAssigneeMember) {
        return NextResponse.json(
          createErrorResponse('Validation Error', '担当者はプロジェクトのメンバーである必要があります'),
          { status: 400 }
        );
      }
    }

    // タスクを更新
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(priority !== undefined && { priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
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
      createApiResponse(updatedTask, 'タスクを更新しました')
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * タスク削除
 * DELETE /api/tasks/[id]
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

    // プロジェクトメンバーかチェック（作成者または管理者のみ削除可能）
    const isMember = await checkProjectMember(task.projectId, userId);
    if (!isMember) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'このタスクを削除する権限がありません'),
        { status: 403 }
      );
    }

    // 作成者またはプロジェクトオーナー/管理者のみ削除可能
    const project = await prisma.project.findFirst({
      where: {
        id: task.projectId,
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

    if (task.creatorId !== userId && !project) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'このタスクを削除する権限がありません'),
        { status: 403 }
      );
    }

    // タスクを削除
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json(
      createApiResponse(null, 'タスクを削除しました')
    );
  } catch (error) {
    return handleApiError(error);
  }
}
