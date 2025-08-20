
"use client";

import React, { useMemo, useState, useEffect } from "react";
import SearchInput from "@/components/common/SearchInput";
import UserTable from "./UserTable";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import type { MemberRow } from "@/types/user";
import type { DateInput } from "@/utils/date";

export default function UserAdminClient() {
  const [keyword, setKeyword] = useState("");
  const [allUsers, setAllUsers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(false);

  // 1) 순수 회원(role=user) 전체를 한 번 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const col = collection(db, "users");
        const q = query(
          col,
          where("role", "==", "user"),
          orderBy("createdAt", "desc")
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
            role: "user",
          };
          return row;
        });
        if (mounted) setAllUsers(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) 메모리에서 이름/이메일 소문자 포함 검색
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) =>
        (u.nickname ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q)
    );
  }, [allUsers, keyword]);

  return (
    <div className='space-y-4'>
      {/* 검색 바 */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder='이름 또는 이메일로 검색'
          icon
        />
      </div>

      <UserTable
        users={filtered}
        totalCount={allUsers.length}
        loading={loading}
      />
    </div>
  );
}
