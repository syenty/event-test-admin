"use client";

import { useEffect, useState } from "react";
import { fetchQuizzes, Quiz, QuizListResponse } from "@/lib/api";

type QuizViewProps = {
  token: string;
  apiUrl?: string | null;
};

export function QuizView({ token, apiUrl }: QuizViewProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [meta, setMeta] = useState<Omit<QuizListResponse, "content"> | null>(
    null,
  );
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
    () => new Set(),
  );

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchQuizzes(token, { baseUrl: apiUrl, page });
        setQuizzes(data.content ?? []);
        setExpandedIds(new Set());
        setMeta({
          page: data.page,
          size: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          first: data.first,
          last: data.last,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "퀴즈 목록 요청 중 오류가 발생했습니다.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();

    return () => controller.abort();
  }, [token, apiUrl, page]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || (meta && nextPage >= meta.totalPages)) return;
    setPage(nextPage);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-neutral-500">
            퀴즈 목록
          </p>
          <p className="text-lg font-semibold text-neutral-900">API: /api/quizzes</p>
        </div>
        {meta ? (
          <div className="text-xs text-neutral-500">
            {meta.totalElements}개 · {meta.page + 1} / {meta.totalPages} 페이지
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">로딩 중...</p>
      ) : error ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : quizzes.length === 0 ? (
        <p className="text-sm text-neutral-600">퀴즈가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <article
              key={quiz.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <header className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-neutral-500">
                    {quiz.type ?? "퀴즈"}
                  </p>
                  <p className="text-base font-semibold text-neutral-900">
                    {quiz.questionText ?? `퀴즈 ${quiz.id}`}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {quiz.quizDate ? `날짜: ${quiz.quizDate}` : null}
                  </p>
                  <p className="text-xs text-neutral-500">
                    ID: {quiz.id} · 이벤트: {quiz.eventId ?? "-"} · 순서:{" "}
                    {quiz.questionOrder ?? "-"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      quiz.active
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {quiz.active ? "활성" : "비활성"}
                  </span>
                  {quiz.options && quiz.options.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(quiz.id)) {
                            next.delete(quiz.id);
                          } else {
                            next.add(quiz.id);
                          }
                          return next;
                        });
                      }}
                      className="text-xs font-semibold text-neutral-700 underline underline-offset-2"
                      aria-expanded={expandedIds.has(quiz.id)}
                    >
                      {expandedIds.has(quiz.id) ? "옵션 닫기" : "옵션 보기"}
                    </button>
                  ) : null}
                </div>
              </header>

              {quiz.options &&
              quiz.options.length > 0 &&
              expandedIds.has(quiz.id) ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {quiz.options
                    .slice()
                    .sort((a, b) => (a.optionOrder ?? 0) - (b.optionOrder ?? 0))
                    .map((option) => (
                      <div
                        key={option.id}
                        className={`rounded-md border px-3 py-2 text-sm ${
                          option.correct
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-neutral-200 bg-neutral-50 text-neutral-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {option.optionKey ?? ""}
                          </span>
                          {option.correct ? (
                            <span className="text-xs font-semibold text-green-700">
                              정답
                            </span>
                          ) : null}
                        </div>
                        <p className="text-neutral-700">
                          {option.optionText ?? ""}
                        </p>
                      </div>
                    ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {meta ? (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.first || isLoading}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            이전
          </button>
          <span className="text-xs text-neutral-600">
            {meta.page + 1} / {meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.last || isLoading}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            다음
          </button>
        </div>
      ) : null}
    </div>
  );
}
