import Container from "@/components/common/Container";
import ArticleDetailClient from "@/components/articles/ArticleDetailClient";

export default async function ArticleDetailPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  return (
    <main className='md:px-4 md:py-8'>
      <Container>
        <ArticleDetailClient id={params.id} />
      </Container>
    </main>
  );
}
