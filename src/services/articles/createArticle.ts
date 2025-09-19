import { addDoc } from "firebase/firestore";
import type { CreateArticleInput } from "@/types/articles";
import { mapCreateInputToDoc } from "./mapArticles";
import { articlesColRef } from "./collection";

export async function createArticle(
  input: CreateArticleInput
): Promise<string> {
  const ref = await addDoc(articlesColRef(), mapCreateInputToDoc(input));
  return ref.id;
}
