'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { KanbanBoard as KanbanBoardType, Task, TaskStatus } from '@/types';
import { updateTaskStatus } from '@/lib/tasks/mutations';
import { KanbanColumn } from './KanbanColumn';
import { TaskItem } from './TaskItem';

interface KanbanBoardProps {
  initialBoard: KanbanBoardType;
  onTaskUpdate?: () => void;
}

export function KanbanBoard({ initialBoard, onTaskUpdate }: KanbanBoardProps) {
  const [board, setBoard] = useState<KanbanBoardType>(initialBoard);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = findTaskById(taskId);
    if (!task) return;

    // over.idがタスクIDかカラムIDかを判定
    const overTask = findTaskById(over.id as string);
    const isOverTask = !!overTask;

    let newStatus: TaskStatus;
    let newOrder: number;

    if (isOverTask) {
      // タスクの上にドロップされた場合、そのタスクと同じカラムに配置
      newStatus = overTask.status;
      const targetColumn = board.columns.find((col) => col.status === newStatus);
      if (!targetColumn) return;

      const overIndex = targetColumn.tasks.findIndex((t) => t.id === overTask.id);
      const currentIndex = targetColumn.tasks.findIndex((t) => t.id === taskId);

      if (currentIndex === -1) {
        // 別のカラムから移動
        newOrder = overIndex;
      } else {
        // 同じカラム内での移動
        if (currentIndex < overIndex) {
          newOrder = overIndex;
        } else {
          newOrder = overIndex;
        }
      }
    } else {
      // カラムにドロップされた場合
      newStatus = over.id as TaskStatus;
      const targetColumn = board.columns.find((col) => col.status === newStatus);
      if (!targetColumn) return;

      // カラムの最後に追加
      newOrder = targetColumn.tasks.length;
    }

    // ステータスが変わらない場合でも順序が変わる可能性がある
    const statusChanged = task.status !== newStatus;

    try {
      await updateTaskStatus(taskId, {
        status: newStatus,
        order: newOrder,
      });

      // ローカル状態を更新
      setBoard((prevBoard) => {
        const updatedColumns = prevBoard.columns.map((col) => {
          if (col.status === task.status && col.status === newStatus) {
            // 同じカラム内での順序変更
            const tasks = [...col.tasks];
            const currentIndex = tasks.findIndex((t) => t.id === taskId);
            if (currentIndex === -1) return col;

            tasks.splice(currentIndex, 1);
            const insertIndex = Math.min(newOrder, tasks.length);
            tasks.splice(insertIndex, 0, { ...task, status: newStatus, order: newOrder });

            return {
              ...col,
              tasks: tasks.map((t, idx) => ({ ...t, order: idx })),
            };
          } else if (col.status === task.status) {
            // 元のカラムからタスクを削除
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== taskId).map((t, idx) => ({ ...t, order: idx })),
            };
          } else if (col.status === newStatus) {
            // 新しいカラムにタスクを追加
            const tasks = col.tasks.filter((t) => t.id !== taskId);
            const insertIndex = Math.min(newOrder, tasks.length);
            tasks.splice(insertIndex, 0, { ...task, status: newStatus, order: newOrder });

            return {
              ...col,
              tasks: tasks.map((t, idx) => ({ ...t, order: idx })),
            };
          }
          return col;
        });

        return {
          ...prevBoard,
          columns: updatedColumns,
        };
      });

      onTaskUpdate?.();
    } catch (error) {
      console.error('タスクの更新に失敗しました:', error);
      // エラー時は元の状態に戻す
      setBoard(initialBoard);
    }
  };

  const findTaskById = (id: string): Task | null => {
    for (const column of board.columns) {
      const task = column.tasks.find((t) => t.id === id);
      if (task) return task;
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {board.project.name}
        </h2>
        {board.project.description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {board.project.description}
          </p>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          {board.columns.map((column) => (
            <KanbanColumn key={column.status} column={column} />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskItem task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
