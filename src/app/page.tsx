"use client";

import { useEffect, useMemo, useState } from "react";

type LoginResponse = {
  accessToken?: string;
};

export default function Home() {
  const [email, setEmail] = useState("root@test.com");
  const [password, setPassword] = useState("1234");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storedToken, setStoredToken] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const loginEndpoint = useMemo(() => {
    if (!apiUrl) return null;
    const base = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    return `${base}/api/auth/admin-login`;
  }, [apiUrl]);

  useEffect(() => {
    const token = typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;
    setStoredToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginEndpoint) {
      setError("API URL이 설정되지 않았습니다. .env.local을 확인하세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `로그인 요청 실패 (status ${response.status})`,
        );
      }

      const data = (await response.json()) as LoginResponse;
      const token = data.accessToken;

      if (!token) {
        throw new Error("응답에 accessToken이 없습니다.");
      }

      window.localStorage.setItem("accessToken", token);
      setStoredToken(token);
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
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <header className="mb-8 space-y-2">
          <p className="text-sm font-medium text-neutral-500">Admin Console</p>
          <h1 className="text-2xl font-semibold text-neutral-900">
            이벤트 테스트 관리자 로그인
          </h1>
          <p className="text-sm text-neutral-600">
            API: {apiUrl ?? "환경변수 미설정"}
          </p>
          {storedToken ? (
            <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-800">
              저장된 토큰이 있습니다.
            </div>
          ) : null}
        </header>

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
    </div>
  );
}
