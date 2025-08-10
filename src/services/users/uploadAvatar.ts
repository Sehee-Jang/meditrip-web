import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

export async function uploadAvatarWebp(webpBlob: Blob): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const idToken = await user.getIdToken();
  const form = new FormData();
  form.append("file", webpBlob, `${user.uid}.webp`);

  const res = await fetch("/api/upload-avatar", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: form,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Upload failed");
  }

  const { url } = (await res.json()) as { url: string };

  // Firestore & Firebase Auth 동기화
  await updateDoc(doc(db, "users", user.uid), {
    profileImage: url,
    updatedAt: serverTimestamp(),
  });
  await updateProfile(user, { photoURL: url });

  return url;
}
