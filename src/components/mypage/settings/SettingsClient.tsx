"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import CommonButton from "@/components/common/CommonButton";
import { Switch } from "@/components/ui/switch";
import {
  Lock,
  Trash2,
  Bell,
  Globe,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import { doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import type { User } from "@/types/user";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  AuthError,
} from "firebase/auth";

export default function SettingsClient() {
  const t = useTranslations("settings-page");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const [nickname, setNickname] = useState<string>("");
  const [marketing, setMarketing] = useState<boolean>(true);
  const [preferredLocale, setPreferredLocale] = useState<"ko" | "ja">(
    locale as "ko" | "ja"
  );
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          const data = snap.data() as Pick<
            User,
            "nickname" | "agreeMarketing" | "preferredLocale"
          >;
          setNickname(data.nickname || "");
          setMarketing(data.agreeMarketing ?? false);
          if (data.preferredLocale === "ko" || data.preferredLocale === "ja") {
            setPreferredLocale(data.preferredLocale);
          }
        }
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };

    fetchUserData();
  }, []);

  // 비밀번호 초기화 버튼 핸들러
  const handlePasswordReset = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast.error(t("toast.needLogin"));
      return;
    }

    setSaving(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success(t("toast.passwordResetSuccess"));
    } catch (err) {
      console.error("비밀번호 재설정 오류:", err);
      toast.error(t("toast.passwordResetError"));
    } finally {
      setSaving(false);
    }
  };

  // 계정탈퇴 버튼 핸들러
  const handleDeleteAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);

      // 쿠키 제거 후 한국어 로그인으로 이동
      document.cookie = "NEXT_LOCALE=; path=/; max-age=0; samesite=lax";
      router.push("/login", { locale: "ko" });
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === "auth/wrong-password") {
        setErrorMsg("비밀번호가 일치하지 않아요.");
      } else {
        setErrorMsg("탈퇴 중 오류가 발생했어요.");
        console.error("탈퇴 실패:", authError);
      }
    } finally {
      setLoading(false);
    }
  };

  // 취소 버튼 핸들러
  const handleCancel = (): void => {
    // 현재 locale 유지한 채 마이페이지로 이동
    router.push("/mypage", { locale });
  };

  // 저장 버튼 핸들러
  const handleSave = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      toast.error(t("toast.needLogin"));
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        nickname,
        agreeMarketing: marketing,
        preferredLocale,
      });

      // NEXT_LOCALE 쿠키 동기화
      document.cookie = `NEXT_LOCALE=${preferredLocale}; path=/; max-age=31536000; samesite=lax`;

      toast.success(t("toast.saveSuccess"));

      // 현재 언어와 다르면 같은 경로로 즉시 전환
      if (preferredLocale !== locale) {
        router.replace(pathname, { locale: preferredLocale });
      }
    } catch (err) {
      console.error("설정 저장 오류:", err);
      toast.error(t("toast.saveError"));
    } finally {
      setSaving(false);
    }
  };

  // 고객지원 버튼 핸들러
  const handleContactClick = (): void => {
    router.push("/community/questions", { locale });
  };

  return (
    <>
      {/* 계정 관리 */}
      <section className='mb-8'>
        <h2 className='font-bold text-lg mb-4'>{t("account.title")}</h2>
        <div className='space-y-4'>
          {/* 비밀번호 변경 */}
          <div
            className='flex items-center gap-4 cursor-pointer'
            onClick={handlePasswordReset}
          >
            <Lock className='w-6 h-6 text-gray-600' />
            <div>
              <p className='font-medium'>{t("account.password")}</p>
              <p className='text-sm text-gray-500'>
                {t("account.passwordDesc")}
              </p>
            </div>
          </div>

          {/* 회원 탈퇴 */}
          <div
            className='flex items-center gap-4 cursor-pointer'
            onClick={() => setShowDialog(true)}
          >
            <Trash2 className='w-6 h-6 text-gray-600' />
            <div>
              <p className='font-medium'>{t("account.delete")}</p>
              <p className='text-sm text-gray-500'>{t("account.deleteDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 닉네임 수정 */}
      <section className='mb-8'>
        <h2 className='font-bold text-lg mb-2'>{t("nickname.title")}</h2>
        <input
          type='text'
          placeholder={t("nickname.placeholder")}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className='w-full border rounded px-4 py-2 mb-2'
        />
        <p className='text-sm text-gray-500'>{t("nickname.note")}</p>
      </section>

      {/* 앱 설정 */}
      <section className='mb-8'>
        <h2 className='font-bold text-lg mb-4'>{t("app.title")}</h2>

        {/* 마케팅 수신 */}
        <div className='flex items-center justify-between py-2'>
          <div className='flex items-center gap-2'>
            <Bell className='w-5 h-5 text-gray-600' />
            <p>{t("app.marketing")}</p>
          </div>
          <Switch checked={marketing} onCheckedChange={setMarketing} />
        </div>

        {/* 언어 설정 */}
        <div className='flex items-center justify-between py-2'>
          <div className='flex items-center gap-2'>
            <Globe className='w-5 h-5 text-gray-600' />
            <p>{t("app.language")}</p>
          </div>
          {/* <p className='text-sm text-gray-500'>{t("app.currentLanguage")}</p> */}
          {/* 간단한 세그먼트 토글 */}
          <div className='flex gap-1 rounded-md border p-1'>
            <button
              type='button'
              onClick={() => setPreferredLocale("ko")}
              className={`px-3 py-1 rounded ${
                preferredLocale === "ko"
                  ? "bg-black text-white"
                  : "text-gray-700"
              }`}
            >
              한국어
            </button>
            <button
              type='button'
              onClick={() => setPreferredLocale("ja")}
              className={`px-3 py-1 rounded ${
                preferredLocale === "ja"
                  ? "bg-black text-white"
                  : "text-gray-700"
              }`}
            >
              日本語
            </button>
          </div>
        </div>
      </section>

      {/* 고객 지원 */}
      <section className='mb-8'>
        <h2 className='font-bold text-lg mb-4'>{t("support.title")}</h2>

        {/* 1:1 문의 */}
        <div
          className='flex items-center py-2 gap-2 cursor-pointer hover:underline'
          onClick={handleContactClick}
        >
          <HelpCircle className='w-5 h-5 text-gray-600' />
          <p>{t("support.contact")}</p>
        </div>

        {/* 서비스 개선 */}
        <div
          className='flex items-center py-2 gap-2 cursor-pointer hover:underline'
          onClick={handleContactClick}
        >
          <a
            href='https://jp.surveymonkey.com/r/87BV3N9'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 hover:underline'
          >
            <ClipboardList className='w-5 h-5 text-gray-600' />
            <p>{t("support.improve")}</p>
          </a>
        </div>
      </section>

      {/* 하단 저장/취소 버튼  */}
      {/* 데스크탑 */}
      <div className='hidden md:flex justify-end gap-2'>
        <CommonButton
          className='text-sm bg-white text-gray-900 border hover:bg-gray-100'
          onClick={handleCancel}
        >
          {t("buttons.cancel")}
        </CommonButton>
        <CommonButton
          className='text-sm'
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? t("buttons.saving") : t("buttons.save")}
        </CommonButton>
      </div>

      {/* 모바일 */}
      <div className='md:hidden grid grid-cols-2 gap-2 mb-8'>
        <CommonButton
          className='text-sm bg-white text-gray-900 border hover:bg-gray-100'
          onClick={handleCancel}
        >
          {t("buttons.cancel")}
        </CommonButton>

        <CommonButton
          className='text-sm w-full'
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? t("buttons.saving") : t("buttons.save")}
        </CommonButton>
      </div>
      {/* <div className='flex justify-between gap-2 mt-8'>
        <CommonButton
          className='w-1/2 bg-white text-black border'
          onClick={handleCancel}
        >
          {t("buttons.cancel")}
        </CommonButton>
        <CommonButton className='w-1/2' onClick={handleSave} disabled={saving}>
          {saving ? t("buttons.saving") : t("buttons.save")}
        </CommonButton>
      </div> */}

      {/* 회원 탈퇴 모달 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 탈퇴하시겠어요?</DialogTitle>
            <p className='text-sm text-gray-500'>
              비밀번호를 입력하시면 탈퇴가 진행돼요.
            </p>
          </DialogHeader>

          <div className='space-y-2'>
            <Input
              type='password'
              placeholder='비밀번호를 입력하세요'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {errorMsg && <p className='text-sm text-red-500'>{errorMsg}</p>}
          </div>

          <DialogFooter className='flex justify-end gap-2 mt-4'>
            <Button
              variant='outline'
              onClick={() => setShowDialog(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? "처리 중..." : "탈퇴하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
