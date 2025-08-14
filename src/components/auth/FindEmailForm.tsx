"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserPublic {
  name: string;
  phone: string;
  email: string;
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  const dn = domain.split(".");
  const maskedName =
    name.length <= 2
      ? `${name[0]}*`
      : `${name[0]}${"*".repeat(Math.max(1, name.length - 2))}${name.at(-1)}`;
  const maskedDomain = `${dn[0][0]}***.${dn.slice(1).join(".")}`;
  return `${maskedName}@${maskedDomain}`;
}

export default function FindEmailForm() {
  const t = useTranslations("find-email");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setResult(null);
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("name", "==", name),
        where("phone", "==", phone),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        setErr(t("notFound"));
      } else {
        const docData = snap.docs[0].data() as UserPublic;
        setResult(maskEmail(docData.email));
      }
    } catch {
      setErr(t("failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-3'>
      <input
        type='text'
        className='w-full border rounded px-3 py-2'
        placeholder={t("namePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type='tel'
        className='w-full border rounded px-3 py-2'
        placeholder={t("phonePlaceholder")}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <button
        type='submit'
        className='w-full py-2 bg-black text-white rounded'
        disabled={loading}
      >
        {loading ? t("loading") : t("submit")}
      </button>

      {result && (
        <p className='text-sm text-green-600'>
          {t("yourEmail", { email: result })}
        </p>
      )}
      {err && <p className='text-sm text-red-600'>{err}</p>}
    </form>
  );
}
