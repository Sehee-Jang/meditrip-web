import { getTranslations } from "next-intl/server";
import QuestionForm from "@/components/QuestionForm";

export default async function AskPage() {
  const t = await getTranslations("question-form"); // preload for SEO

  return (
    <main className='py-10'>
      <QuestionForm userId='abc123' />
    </main>
  );
}
