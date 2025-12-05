"use client";

import { useEffect, useState } from "react";
import { fetchRewardPolicies, RewardPolicy } from "@/lib/api";

type PoliciesViewProps = {
  token: string;
  apiUrl?: string | null;
};

export function PoliciesView({ token, apiUrl }: PoliciesViewProps) {
  const [policies, setPolicies] = useState<RewardPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchRewardPolicies(token, { baseUrl: apiUrl });
        setPolicies(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "정책 목록 요청 중 오류가 발생했습니다.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();

    return () => controller.abort();
  }, [token, apiUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-neutral-500">
            정책 목록
          </p>
          <p className="text-lg font-semibold text-neutral-900">
            API: /api/reward-policies
          </p>
        </div>
        {policies.length > 0 ? (
          <span className="text-xs text-neutral-500">{policies.length}개</span>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">로딩 중...</p>
      ) : error ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : policies.length === 0 ? (
        <p className="text-sm text-neutral-600">정책이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <article
              key={policy.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-neutral-900">
                    {policy.name ?? `정책 ${policy.id}`}
                  </p>
                  <p className="text-xs font-semibold uppercase text-neutral-500">
                    {policy.policyType ?? "정책"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    ID: {policy.id} · 이벤트: {policy.eventId ?? "-"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    적용 기간: {policy.startDt ?? "-"} ~ {policy.endDt ?? "-"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    당첨 제한(총/일): {policy.winnerLimitTotal ?? "-"} /{" "}
                    {policy.winnerLimitPerDay ?? "-"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    사용자 제한(총/일): {policy.userLimitTotal ?? "-"} /{" "}
                    {policy.userLimitPerDay ?? "-"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {policy.policyType === "NTH_ORDER"
                      ? `타겟 순번: ${policy.targetOrder ?? "-"} (${policy.nthScope ?? "-"})`
                      : `범위: ${policy.nthScope ?? "-"}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {policy.rewardType ?? "REWARD"}
                  </span>
                  <p className="text-xs text-neutral-600">
                    보상 값: {policy.rewardValue ?? "-"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    생성: {policy.createdDt ?? "-"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    수정: {policy.updatedDt ?? "-"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
