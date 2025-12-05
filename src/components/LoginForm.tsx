"use client";

import { useState } from "react";
import { loginAdmin } from "@/lib/api";

type LoginFormProps = {
  apiUrl?: string | null;
  onSuccess: (token: string) => void;
};

export function LoginForm({ apiUrl, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("root@test.com");
  const [password, setPassword] = useState("1234");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { accessToken } = await loginAdmin(email, password, {
        baseUrl: apiUrl,
      });
      onSuccess(accessToken!);
      setSuccess("로그인 성공! 토큰이 저장되었습니다.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "로그인 요청 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-neutral-800">이메일</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            placeholder="root@test.com"
            autoComplete="email"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-neutral-800">비밀번호</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            placeholder="비밀번호"
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-md border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      ) : null}
    </div>
  );
}
