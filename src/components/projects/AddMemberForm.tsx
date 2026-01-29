'use client';

import { useState } from 'react';
import type { AddMemberInput, ProjectRole } from '@/types';

interface AddMemberFormProps {
  onSubmit: (input: AddMemberInput) => Promise<void>;
  onCancel?: () => void;
}

const roleLabels: Record<ProjectRole, string> = {
  [ProjectRole.OWNER]: 'オーナー',
  [ProjectRole.ADMIN]: '管理者',
  [ProjectRole.MEMBER]: 'メンバー',
  [ProjectRole.VIEWER]: '閲覧者',
};

export function AddMemberForm({ onSubmit, onCancel }: AddMemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectRole>(ProjectRole.MEMBER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('メールアドレスは必須です');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        email: email.trim(),
        role,
      });
      setEmail('');
      setRole(ProjectRole.MEMBER);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
            placeholder="user@example.com"
          />
        </div>
        <div className="w-32">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            ロール
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as ProjectRole)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
          >
            {Object.values(ProjectRole)
              .filter((r) => r !== ProjectRole.OWNER)
              .map((r) => (
                <option key={r} value={r}>
                  {roleLabels[r]}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? '追加中...' : '追加'}
        </button>
      </div>
    </form>
  );
}
