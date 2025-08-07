"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CommonButton from "@/components/common/CommonButton";
import { Switch } from "@/components/ui/switch";
import { Lock, Trash2, Bell, Globe, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import type { User } from "@/types/user";
import { useLocale } from "next-intl";
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
  const [nickname, setNickname] = useState("");
  const [marketing, setMarketing] = useState(true);

  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  // 비밀번호 변경 핸들러
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

  // 회원탈퇴 핸들러
  const handleDeleteAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // 1. 자격 증명 생성
      const credential = EmailAuthProvider.credential(user.email, password);

      // 2. 재인증
      await reauthenticateWithCredential(user, credential);

      // 3. Firestore 유저 문서 삭제
      await deleteDoc(doc(db, "users", user.uid));

      // 4. Auth 계정 삭제
      await deleteUser(user);

      // 5. 이동
      router.push("/login");
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

  // 닉네임 변경 핸들러
  const handleSave = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      toast.error(t("toast.needLogin"));
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        nickname,
        agreeMarketing: marketing,
      });
      console.log("🔥 저장 성공");
      toast.success(t("toast.saveSuccess"));
    } catch (err) {
      console.error("설정 저장 오류:", err);
      toast.error(t("toast.saveError"));
    }
  };

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data() as Pick<
            User,
            "nickname" | "agreeMarketing"
          >;

          setNickname(userData.nickname || "");
          setMarketing(userData.agreeMarketing ?? false);
        }
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };

    fetchUserData();
  }, []);

  // 1:1 문의 핸들러
  const handleContactClick = () => {
    router.push(`/${locale}/community/questions`);
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
        <div className='flex items-center justify-between py-2'>
          <div className='flex items-center gap-2'>
            <Bell className='w-5 h-5 text-gray-600' />
            <p>{t("app.marketing")}</p>
          </div>

          <Switch
            checked={marketing}
            onCheckedChange={setMarketing}
            className=''
          />
        </div>

        {/* 언어 설정 */}
        <div className='flex items-center justify-between py-2'>
          <div className='flex items-center gap-2'>
            <Globe className='w-5 h-5 text-gray-600' />
            <p>{t("app.language")}</p>
          </div>
          <p className='text-sm text-gray-500'>{t("app.currentLanguage")}</p>
        </div>
      </section>

      {/* 고객 지원 */}
      <section className='mb-8'>
        <h2 className='font-bold text-lg mb-4'>{t("support.title")}</h2>
        <div
          className='flex items-center gap-2 cursor-pointer hover:underline'
          onClick={handleContactClick}
        >
          <HelpCircle className='w-5 h-5 text-gray-600' />
          <p>{t("support.contact")}</p>
        </div>
      </section>

      {/* 하단 버튼 (모바일/데스크탑 공통) */}
      <div className='flex justify-between gap-2 mt-8'>
        <CommonButton className='w-1/2 bg-white text-black border'>
          {t("buttons.cancel")}
        </CommonButton>
        <CommonButton className='w-1/2' onClick={handleSave} disabled={saving}>
          {saving ? t("buttons.saving") : t("buttons.save")}
        </CommonButton>
      </div>

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
