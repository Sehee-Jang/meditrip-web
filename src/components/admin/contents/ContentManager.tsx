"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VideoCreateForm from "./VideoCreateForm";
import VideoTable from "./VideoTable";
import { useState } from "react";

export default function ContentManager() {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [tab, setTab] = useState<"create" | "list">("create");

  return (
    <section className='space-y-4'>
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "create" | "list")}
        className='w-full'
      >
        <TabsList>
          <TabsTrigger value='create'>등록</TabsTrigger>
          <TabsTrigger value='list'>목록</TabsTrigger>
        </TabsList>

        <TabsContent
          value='create'
          className='rounded-2xl border bg-white shadow-sm p-4'
        >
          <VideoCreateForm
            onCreated={() => {
              setTab("list"); // 저장 후 목록 탭으로
              setRefreshKey((k) => k + 1); // 목록 강제 리프레시
            }}
          />
        </TabsContent>

        <TabsContent
          value='list'
          className='rounded-2xl border bg-white shadow-sm p-4'
        >
          <VideoTable key={refreshKey} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
