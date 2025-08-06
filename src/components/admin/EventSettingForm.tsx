"use client";

import { useState } from "react";
import { addEvent } from "@/services/events/addEvent";
import type { EventCondition, EventTriggerType } from "@/types/event";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CommonButton from "@/components/common/CommonButton";
import { serverTimestamp } from "firebase/firestore";


interface Props {
  onEventSaved: () => void;
}

export default function EventSettingForm({ onEventSaved }: Props) {
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(0);
  const [condition, setCondition] = useState<EventCondition | "">("");
  const [triggerType, setTriggerType] = useState<EventTriggerType | "">("");
  const [showErrors, setShowErrors] = useState(false);

  const handleSave = async () => {
    const isInvalid =
      description.trim() === "" || condition === "" || triggerType === "";

    if (isInvalid) {
      setShowErrors(true); // 테두리 강조 조건 활성화
      return;
    }

    setShowErrors(false); // 유효할 경우 에러 표시 제거

    await addEvent({
      description,
      points,
      condition: condition as EventCondition,
      triggerType: triggerType as EventTriggerType,
      active: true,
      createdAt: serverTimestamp(),
    });

    setDescription("");
    setPoints(0);
    setCondition("");
    setTriggerType("");
    onEventSaved();
  };

  return (
    <div className='p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4'>
      <h2 className='text-lg font-semibold mb-4'>이벤트 생성</h2>
      <div className='space-y-1'>
        <label className='text-sm font-medium'>이벤트 설명</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='예: 커뮤니티 첫 글 작성'
          className={
            showErrors && description.trim() === "" ? "border-red-500" : ""
          }
        />
      </div>

      <div className='space-y-1'>
        <label className='text-sm font-medium'>지급 포인트</label>
        <Input
          type='number'
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className={
            showErrors && description.trim() === "" ? "border-red-500" : ""
          }
        />
      </div>

      <div className='space-y-1'>
        <label className='text-sm font-medium'>지급 조건</label>
        <Select
          value={triggerType}
          onValueChange={(v) => setTriggerType(v as EventTriggerType)}
        >
          <SelectTrigger
            className={showErrors && triggerType === "" ? "border-red-500" : ""}
          >
            <SelectValue placeholder='조건을 선택하세요' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='community_post'>커뮤니티 글 작성 시</SelectItem>
            <SelectItem value='community_comment'>댓글 작성 시</SelectItem>
            <SelectItem value='clinic_review'>병원 리뷰 작성 시</SelectItem>
            <SelectItem value='login_daily'>매일 로그인 시</SelectItem>
            <SelectItem value='consultation_request'>
              진료 예약 신청 시
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-1'>
        <label className='text-sm font-medium'>지급 횟수</label>
        <Select
          value={condition}
          onValueChange={(value) => setCondition(value as EventCondition)}
        >
          <SelectTrigger
            className={showErrors && condition === "" ? "border-red-500" : ""}
          >
            <SelectValue placeholder='조건을 선택하세요' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='firstPostOnly'>최초 1회만 지급</SelectItem>
            <SelectItem value='oncePerDay'>하루 1회 지급</SelectItem>
            <SelectItem value='unlimited'>무제한 지급</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='pt-2'>
        <CommonButton onClick={handleSave}>이벤트 저장</CommonButton>
      </div>
    </div>
  );
}
