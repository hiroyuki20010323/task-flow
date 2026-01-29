'use client';

import { useState, useEffect } from 'react';
import type { Task, TaskInput, TaskStatus, TaskPriority, User, Project } from '@/types';
import { TaskStatus as TaskStatusEnum, TaskPriority as TaskPriorityEnum } from '@/types';

interface TaskFormProps {
  task?: Task;
  projectId?: string;
  projects?: Project[];
  users?: User[];
  onSubmit: (input: TaskInput & { projectId?: string }) => Promise<void>;
  onCancel?: () => void;
}

export function TaskForm({
  task,
  projectId: initialProjectId,
  projects,
  users,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatusEnum.TODO);
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || TaskPriorityEnum.MEDIUM
  );
  const [assigneeId, setAssigneeId] = useState<string | null>(task?.assigneeId || null);
  const [projectId, setProjectId] = useState<string>(initialProjectId || task?.projectId || '');
  const [dueDate, setDueDate] = useState<string>(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const input: TaskInput & { projectId?: string } = {
        title,
        description: description || null,
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      };

      if (projectId) {
        input.projectId = projectId;
      }

      await onSubmit(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            プロジェクト
          </label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">選択してください</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          説明
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            ステータス
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value={TaskStatusEnum.TODO}>TODO</option>
            <option value={TaskStatusEnum.IN_PROGRESS}>IN_PROGRESS</option>
            <option value={TaskStatusEnum.REVIEW}>REVIEW</option>
            <option value={TaskStatusEnum.DONE}>DONE</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            優先度
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value={TaskPriorityEnum.LOW}>低</option>
            <option value={TaskPriorityEnum.MEDIUM}>中</option>
            <option value={TaskPriorityEnum.HIGH}>高</option>
            <option value={TaskPriorityEnum.URGENT}>緊急</option>
          </select>
        </div>
      </div>

      {users && users.length > 0 && (
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            担当者
          </label>
          <select
            id="assignee"
            value={assigneeId || ''}
            onChange={(e) => setAssigneeId(e.target.value || null)}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">未割り当て</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          期限
        </label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? '保存中...' : task ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}
