import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse, createPaginatedResponse, getPaginationParams } from '@/lib/api/utils';
import { requireAuth, handleApiError, checkProjectMember } from '@/lib/api/middleware';

/**
 * タスク一覧取得
 * GET /api/tasks
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');

    // フィルター条件を構築
    const where: any = {
      project: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    };

    if (projectId) {
      // プロジェクトメンバーかチェック
      const isMember = await checkProjectMember(projectId, userId);
      if (!isMember) {
        return NextResponse.json(
          createErrorResponse('Forbidden', 'このプロジェクトにアクセスする権限がありません'),
          { status: 403 }
        );
      }
      where.projectId = projectId;
    }

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

/**
 * タスク作成
 * POST /api/tasks
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const body = await request.json();
    const {
      title,
      description,
      projectId,
      assigneeId,
      priority = 'MEDIUM',
      status = 'TODO',
      dueDate,
    } = body;

    // バリデーション
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        createErrorResponse('Validation Error', 'タスクタイトルは必須です'),
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        createErrorResponse('Validation Error', 'プロジェクトIDは必須です'),
        { status: 400 }
      );
    }

    // プロジェクトの存在確認と権限チェック
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'プロジェクトが見つかりません'),
        { status: 404 }
      );
    }

    // メンバーかオーナーかチェック
    const isMember = project.ownerId === userId || await checkProjectMember(projectId, userId);
    if (!isMember) {
      return NextResponse.json(
        createErrorResponse('Forbidden', 'このプロジェクトにタスクを作成する権限がありません'),
        { status: 403 }
      );
    }

    // 担当者が指定されている場合、そのユーザーがメンバーかチェック
    if (assigneeId) {
      const isAssigneeMember = project.ownerId === assigneeId || await checkProjectMember(projectId, assigneeId);
      if (!isAssigneeMember) {
        return NextResponse.json(
          createErrorResponse('Validation Error', '担当者はプロジェクトのメンバーである必要があります'),
          { status: 400 }
        );
      }
    }

    // 優先度とステータスのバリデーション
    if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      return NextResponse.json(
        createErrorResponse('Validation Error', '無効な優先度です'),
        { status: 400 }
      );
    }

    if (!['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].includes(status)) {
      return NextResponse.json(
        createErrorResponse('Validation Error', '無効なステータスです'),
        { status: 400 }
      );
    }

    // 最大order値を取得して次のorderを設定
    const maxOrderTask = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    // タスクを作成
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        projectId,
        creatorId: userId,
        assigneeId: assigneeId || null,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        status: status as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
        dueDate: dueDate ? new Date(dueDate) : null,
        order,
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
      createApiResponse(task, 'タスクを作成しました'),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
