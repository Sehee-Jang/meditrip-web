"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  limit as limitFn,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { MemberRow } from "@/types/user";
import { type DateInput } from "@/utils/date";
import UserTableHeader from "./UserTableHeader";
import UserPointLogDialog from "@/components/admin/points/UserPointLogDialog";
import DeductPointDialog from "@/components/admin/points/DeductPointDialog";
import UserTableRow from "./UserTableRow";

const PAGE_SIZE = 20;

export default function UserTable() {
  const [users, setUsers] = useState<MemberRow[]>([]);
  const [cursor, setCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const [logTarget, setLogTarget] = useState<MemberRow | null>(null);
  const [deductTarget, setDeductTarget] = useState<MemberRow | null>(null);

  const baseQuery = useMemo(() => {
    // 순수 회원만 조회 (관리자 제외)
    const col = collection(db, "users");
    return query(
      col,
      where("role", "==", "user"),
      orderBy("createdAt", "desc"),
      limitFn(PAGE_SIZE)
    );
  }, []);

  const fetchFirst = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(baseQuery);
      const list = snap.docs.map((d) => {
        const data = d.data() as DocumentData;
        const row: MemberRow = {
          id: d.id,
          nickname: String(data.nickname ?? ""),
          email: String(data.email ?? ""),
          agreeMarketing: Boolean(data.agreeMarketing ?? false),
          points: typeof data.points === "number" ? data.points : 0,
          createdAt: data.createdAt as DateInput,
          role: (data.role ?? "user") as MemberRow["role"],
        };
        return row;
      });
      setUsers(list);
      setCursor(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = async () => {
    if (!cursor) return;
    setLoading(true);
    try {
      const col = collection(db, "users");
      const q = query(
        col,
        where("role", "==", "user"),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limitFn(PAGE_SIZE)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => {
        const data = d.data() as DocumentData;
        const row: MemberRow = {
          id: d.id,
          nickname: String(data.nickname ?? ""),
          email: String(data.email ?? ""),
          agreeMarketing: Boolean(data.agreeMarketing ?? false),
          points: typeof data.points === "number" ? data.points : 0,
          createdAt: data.createdAt as DateInput,
          role: (data.role ?? "user") as MemberRow["role"],
        };
        return row;
      });
      setUsers((prev) => [...prev, ...list]);
      setCursor(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirst();
  }, []);

  return (
    <div className='space-y-4'>
      {/* 여기에 필터 선택 영역 추가 */}
      <div></div>
      {/* 여기부터 테이블 */}
      <div className='rounded-2xl border bg-white shadow-sm'>
        <div className='flex items-center justify-between px-4 py-3 border-b'>
          <div className='font-medium'>회원 목록</div>
          <div className='text-sm text-muted-foreground'>
            총 {users.length.toLocaleString()}건
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <UserTableHeader />
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className='p-8 text-center text-muted-foreground'
                  >
                    로딩 중…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-4 py-8 text-center text-sm text-gray-500'
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onShowLog={setLogTarget}
                    onDeduct={setDeductTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 더보기 버튼 */}
        <div className='p-3 flex justify-end'>
          <Button
            variant='outline'
            size='sm'
            disabled={!hasMore || loading}
            onClick={fetchMore}
          >
            {loading ? "불러오는 중..." : hasMore ? "더 보기" : "더 이상 없음"}
          </Button>
        </div>

        {/* 포인트 내역 모달창 */}
        {logTarget && (
          <UserPointLogDialog
            open
            userId={logTarget.id}
            nickname={logTarget.nickname}
            onClose={() => setLogTarget(null)}
          />
        )}

        {/* 포인트 사용 모달창 */}
        {deductTarget && (
          <DeductPointDialog
            open
            userId={deductTarget.id}
            nickname={deductTarget.nickname}
            onClose={() => setDeductTarget(null)}
          />
        )}
      </div>
    </div>
  );
}
