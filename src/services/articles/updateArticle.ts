import { updateDoc } from "firebase/firestore";
import type { UpdateArticleInput } from "@/types/articles";
import { mapUpdateInputToDoc } from "./mapArticles";
import { articleDocRef } from "./collection";

export async function updateArticle(
  id: string,
  patch: UpdateArticleInput
): Promise<void> {
  await updateDoc(articleDocRef(id), mapUpdateInputToDoc(patch));
}

