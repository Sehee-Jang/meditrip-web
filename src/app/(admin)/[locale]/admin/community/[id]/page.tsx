import CommunityAdminDetail from "@/components/admin/community/detail/CommunityAdminDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  return <CommunityAdminDetail questionId={id} locale={locale} />;
}
