import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, createErrorResponse, createPaginatedResponse, getPaginationParams } from '@/lib/api/utils';
import { requireAuth, handleApiError } from '@/lib/api/middleware';

/**
 * プロジェクト一覧取得
 * GET /api/projects
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

    // ユーザーがメンバーまたはオーナーであるプロジェクトを取得
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: {
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
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.project.count({
        where: {
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
      }),
    ]);

    return NextResponse.json(
      createPaginatedResponse(projects, page, limit, total)
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * プロジェクト作成
 * POST /api/projects
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const body = await request.json();
    const { name, description } = body;

    // バリデーション
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        createErrorResponse('Validation Error', 'プロジェクト名は必須です'),
        { status: 400 }
      );
    }

    // プロジェクトを作成（トランザクション）
    const project = await prisma.$transaction(async (tx) => {
      // プロジェクトを作成
      const newProject = await tx.project.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          ownerId: userId,
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
        },
      });

      // オーナーをメンバーとして追加
      await tx.projectMember.create({
        data: {
          projectId: newProject.id,
          userId,
          role: 'OWNER',
        },
      });

      // メンバー情報を含めて再取得
      return await tx.project.findUnique({
        where: { id: newProject.id },
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
        },
      });
    });

    return NextResponse.json(
      createApiResponse(project, 'プロジェクトを作成しました'),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
