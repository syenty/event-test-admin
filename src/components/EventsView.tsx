"use client";

import { useEffect, useState } from "react";
import { EventItem, fetchEvents } from "@/lib/api";

type EventsViewProps = {
  token: string;
  apiUrl?: string | null;
};

export function EventsView({ token, apiUrl }: EventsViewProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchEvents(token, { baseUrl: apiUrl });
        setEvents(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "이벤트 목록 요청 중 오류가 발생했습니다.";
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
            이벤트 목록
          </p>
          <p className="text-lg font-semibold text-neutral-900">API: /api/events</p>
        </div>
        {events.length > 0 ? (
          <span className="text-xs text-neutral-500">{events.length}개</span>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">로딩 중...</p>
      ) : error ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : events.length === 0 ? (
        <p className="text-sm text-neutral-600">이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-neutral-900">
                    {event.name ?? `이벤트 ${event.id}`}
                  </p>
                  {event.description ? (
                    <p className="text-sm text-neutral-600">{event.description}</p>
                  ) : null}
                  <p className="text-xs text-neutral-500">
                    {event.startDt ?? "-"} ~ {event.endDt ?? "-"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    참여: {event.participationStartTime ?? "-"} ~{" "}
                    {event.participationEndTime ?? "-"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    출석: {event.attendanceStartTime ?? "-"} ~{" "}
                    {event.attendanceEndTime ?? "-"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    교차 참여: {event.intersectionParticipationStartTime ?? "-"} ~{" "}
                    {event.intersectionParticipationEndTime ?? "-"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    교차 출석: {event.intersectionAttendanceStartTime ?? "-"} ~{" "}
                    {event.intersectionAttendanceEndTime ?? "-"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      event.status === "OPEN"
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {event.status ?? "상태 미정"}
                  </span>
                  <p className="text-xs text-neutral-500">
                    일일 시도: {event.maxDailyTry ?? "-"} · 유저당 보상:{" "}
                    {event.rewardLimitPerUser ?? "-"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    생성: {event.createdDt ?? "-"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    수정: {event.updatedDt ?? "-"}
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
