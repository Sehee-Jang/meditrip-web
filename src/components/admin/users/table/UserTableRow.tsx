import React from "react";
import { MemberRow } from "@/types/user";
import { formatDateCompact } from "@/utils/date";
import UserRowActions from "./UserRowActions";

type Props = {
  user: MemberRow;
  onShowLog: (user: MemberRow) => void;
  onDeduct: (user: MemberRow) => void;
};

export default function UserTableRow({ user, onShowLog, onDeduct }: Props) {
  const agreeText = (v: boolean | undefined) => (v ? "동의" : "미동의");

  return (
    <tr key={user.id} className='border-t hover:bg-muted/20'>
      {/* 이름 */}
      <td className='px-4 py-3'>
        <span className='block truncate'>{user.nickname}</span>
      </td>

      {/* 이메일 */}
      <td className='px-4 py-3'>
        <span className='block max-w-[240px] truncate' title={user.email}>
          {user.email}
        </span>
      </td>

      {/* 포인트 */}
      <td className='px-4 py-3 text-right tabular-nums pr-6'>
        {(user.points ?? 0).toLocaleString()}P
      </td>

      {/* 가입일 */}
      <td className='px-4 py-3 text-center'>
        {formatDateCompact(user.createdAt)}
      </td>

      {/* 마케팅 동의 */}
      <td className='px-4 py-3 text-center'>
        {agreeText(user.agreeMarketing)}
      </td>

      {/* 액션버튼 */}
      <td
        className='px-4 py-3 text-right pr-4'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='inline-flex items-center justify-end gap-2'>
          <UserRowActions
            user={user}
            onShowLog={onShowLog}
            onDeduct={onDeduct}
          />
        </div>
      </td>
    </tr>
  );
}
