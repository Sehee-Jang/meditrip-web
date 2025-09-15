import Container from "@/components/common/Container";
import ArticleDetailClient from "@/components/articles/ArticleDetailClient";

type Params = {
  id: string;
  locale: string;
};

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return (
    <main className='md:px-4 md:py-8'>
      <Container>
        <ArticleDetailClient id={id} />
      </Container>
    </main>
  );
}
