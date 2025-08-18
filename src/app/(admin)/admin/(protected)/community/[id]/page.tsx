import CommunityAdminDetail from "@/components/admin/community/detail/CommunityAdminDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommunityAdminDetail questionId={id} />;
}
