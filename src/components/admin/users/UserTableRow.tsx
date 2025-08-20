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
    <tr key={user.id} className='border-b hover:bg-slate-50 cursor-pointer'>
      <td className='px-4 py-3'>{user.nickname}</td>
      <td className='px-4 py-3'>{user.email}</td>

      <td className='px-4 py-3 text-right'>
        {(user.points ?? 0).toLocaleString()}P
      </td>
      <td className='px-4 py-3 text-center'>
        {formatDateCompact(user.createdAt)}
      </td>
      <td className='px-4 py-3 text-center'>
        {agreeText(user.agreeMarketing)}
      </td>
      <td
        className='px-4 py-3 text-center'
        onClick={(e) => e.stopPropagation()}
      >
        <UserRowActions user={user} onShowLog={onShowLog} onDeduct={onDeduct} />
      </td>
    </tr>
  );
}
