import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse } from '@/lib/api/utils';
import { requireAuth, handleApiError, checkProjectMember } from '@/lib/api/middleware';

/**
 * カンバンボードデータ取得
 * GET /api/projects/[id]/kanban
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

    // ステータスごとにタスクを取得
    const [todoTasks, inProgressTasks, reviewTasks, doneTasks] = await Promise.all([
      prisma.task.findMany({
        where: {
          projectId: id,
          status: 'TODO',
        },
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
      }),
      prisma.task.findMany({
        where: {
          projectId: id,
          status: 'IN_PROGRESS',
        },
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
      }),
      prisma.task.findMany({
        where: {
          projectId: id,
          status: 'REVIEW',
        },
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
      }),
      prisma.task.findMany({
        where: {
          projectId: id,
          status: 'DONE',
        },
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
      }),
    ]);

    // カンバンボード形式でデータを返す
    const kanbanBoard = {
      TODO: todoTasks,
      IN_PROGRESS: inProgressTasks,
      REVIEW: reviewTasks,
      DONE: doneTasks,
    };

    return NextResponse.json(createApiResponse(kanbanBoard));
  } catch (error) {
    return handleApiError(error);
  }
}
