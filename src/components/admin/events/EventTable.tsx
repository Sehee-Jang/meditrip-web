"use client";

import { Event, EventCondition, EventTriggerType } from "@/types/event";
import { deleteEvent } from "@/services/events/deleteEvent";
import { toggleEventActive } from "@/services/events/toggleEventActive";
import { updateEvent } from "@/services/events/updateEvent";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Props {
  events: Event[];
  onRefresh: () => void;
}

export default function EventTable({ events, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{
    description: string;
    points: number;
    condition: EventCondition;
    triggerType: EventTriggerType;
  }>({
    description: "",
    points: 1000,
    condition: "oncePerDay",
    triggerType: "community_post",
  });

  // 수정 버튼 핸들러
  const startEditing = (event: Event) => {
    setEditingId(event.id || null);
    setEditedData({
      description: event.description,
      points: event.points,
      condition: event.condition,
      triggerType: event.triggerType,
    });
  };

  // 이벤트 수정 핸들러
  const handleSaveEdit = async (id: string) => {
    try {
      await updateEvent(id, editedData);
      toast.success("이벤트가 성공적으로 수정되었습니다.");
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("수정 중 오류가 발생했습니다.");
    }
  };

  // 이벤트 삭제 핸들러
  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      toast.success("이벤트가 삭제되었습니다.");
      onRefresh();
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  // 토글 핸들러
  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleEventActive(id, current);
      toast.success(`이벤트가 ${!current ? "활성화" : "비활성화"}되었습니다.`);
      onRefresh();
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  // 반복 옵션 한글로 변환하는 함수
  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "oncePerDay":
        return "하루 1회 지급";
      case "firstPostOnly":
        return "최초 1회만 지급";
      case "unlimited":
        return "무제한 지급";
      default:
        return condition;
    }
  };

  // 조건 옵션 한글로 변환하는 함수
  const getTriggerLabel = (triggerType: EventTriggerType) => {
    switch (triggerType) {
      case "community_post":
        return "커뮤니티 글";
      case "community_comment":
        return "댓글 작성";
      case "clinic_review":
        return "리뷰 작성";
      case "login_daily":
        return "첫 로그인";
      case "consultation_request":
        return "진료 예약";
      default:
        return triggerType;
    }
  };

  return (
    <div className='p-6 bg-background border border-border rounded-2xl shadow-sm'>
      <h2 className='text-lg font-semibold mb-4'>이벤트 목록</h2>
      <table className='w-full text-sm table-fixed'>
        <thead className='text-muted-foreground'>
          <tr>
            <th className='text-left p-2 w-1/12'>No.</th>
            <th className='text-left p-2 w-4/12'>설명</th>
            <th className='text-left p-2 w-2/12'>포인트</th>
            <th className='text-left p-2 w-2/12'>조건</th>
            <th className='text-left p-2 w-2/12'>반복</th>
            <th className='text-left p-2 w-1/12'>ON</th>
            <th className='text-left p-2 w-2/12'>관리</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, idx) => {
            const isEditing = editingId === event.id;

            return (
              <tr key={event.id} className='border-t'>
                <td className='p-2'>{idx + 1}</td>

                {/* 설명 */}
                <td className='p-2'>
                  {isEditing ? (
                    <input
                      className='border px-2 py-1 w-full'
                      value={editedData.description}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    event.description
                  )}
                </td>

                {/* 포인트 */}
                <td className='p-2'>
                  {isEditing ? (
                    <input
                      type='number'
                      className='border px-2 py-1 w-20'
                      value={editedData.points}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          points: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    `${event.points}P`
                  )}
                </td>

                {/* 조건 */}
                <td className='p-2'>
                  {isEditing ? (
                    <select
                      className='border px-2 py-1'
                      value={editedData.triggerType}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          triggerType: e.target.value as EventTriggerType,
                        })
                      }
                    >
                      <option value='community_post'>커뮤니티 글 작성</option>
                      <option value='community_comment'>댓글 작성</option>
                      <option value='clinic_review'>리뷰 작성</option>
                      <option value='login_daily'>첫 로그인</option>
                      <option value='consultation_request'>진료 예약</option>
                    </select>
                  ) : (
                    getTriggerLabel(event.triggerType)
                  )}
                </td>

                {/* 반복 */}
                <td className='p-2'>
                  {isEditing ? (
                    <select
                      className='border px-2 py-1'
                      value={editedData.condition}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          condition: e.target.value as EventCondition,
                        })
                      }
                    >
                      <option value='firstPostOnly'>최초 1회만 지급</option>
                      <option value='oncePerDay'>하루 1회 지급</option>
                      <option value='unlimited'>무제한 지급</option>
                    </select>
                  ) : (
                    getConditionLabel(event.condition)
                  )}
                </td>

                {/* 활성화 */}
                <td className='p-2'>
                  <Switch
                    checked={event.active}
                    onCheckedChange={() =>
                      handleToggle(event.id!, event.active)
                    }
                  />
                </td>

                {/* 버튼 */}
                <td className='p-2 space-x-2'>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(event.id!)}
                        className='text-green-600'
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className='text-muted-foreground'
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(event)}
                        className='text-blue-600'
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(event.id!)}
                        className='text-red-600'
                      >
                        삭제
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
