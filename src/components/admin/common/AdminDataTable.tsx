"use client";

import * as React from "react";

type Align = "left" | "center" | "right";

export interface DataTableColumn {
  header: React.ReactNode;
  widthClass?: string; // 예: "w-[160px]"
  align?: Align; // th 정렬
}

interface AdminDataTableProps<T> {
  title?: string;
  items: T[]; // 필터 후 목록
  totalCount: number; // 전체 개수(필터 전)
  loading?: boolean;
  columns: ReadonlyArray<DataTableColumn>;
  getRowKey: (item: T, index: number) => string;
  renderRow: (item: T, index: number) => React.ReactNode; // <tr> 반환
  emptyMessage?: string;
  className?: string;
  // 카운트 라벨을 커스터마이즈하고 싶으면 주입
  countLabel?: (itemsCount: number, totalCount: number) => React.ReactNode;
}

export default function AdminDataTable<T>({
  title = "목록",
  items,
  totalCount,
  loading = false,
  columns,
  getRowKey,
  renderRow,
  emptyMessage = "데이터가 없습니다.",
  className,
  countLabel,
}: AdminDataTableProps<T>) {
  const defaultCount =
    items.length === totalCount
      ? `총 ${totalCount.toLocaleString()}건`
      : `검색 결과 ${items.length.toLocaleString()}건 / 전체 ${totalCount.toLocaleString()}건`;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-card shadow-sm ${
        className ?? ""
      }`}
    >
      {/* 상단 헤더 */}
      <div className='flex items-center justify-between border-b bg-muted px-4 py-3'>
        <div className='font-medium'>{title}</div>
        <div className='text-sm text-muted-foreground'>
          {countLabel ? countLabel(items.length, totalCount) : defaultCount}
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-[13px] table-fixed'>
          {/* colgroup: 폭 지정 */}
          {columns.some((c) => c.widthClass) ? (
            <colgroup>
              {columns.map((c, i) => (
                <col key={i} className={c.widthClass ?? ""} />
              ))}
            </colgroup>
          ) : null}

          <thead className='bg-muted/40 text-muted-foreground'>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 ${alignToClass(c.align ?? "left")}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='p-8 text-center text-muted-foreground'
                >
                  로딩 중…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-4 py-8 text-center text-muted-foreground'
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <React.Fragment key={getRowKey(item, idx)}>
                  {renderRow(item, idx)}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function alignToClass(align: Align): string {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}
