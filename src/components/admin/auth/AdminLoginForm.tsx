"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type AuthError,
  type UserCredential,
} from "firebase/auth";
import { getUserRole, type UserRole } from "@/services/users/getUserRole";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Shield, Mail, Lock, LogIn, Chrome } from "lucide-react";

/** 에러 코드 → 사용자 안내 문구 */
function mapAuthError(err: AuthError): string {
  switch (err.code) {
    case "auth/popup-blocked":
      return "팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요. (auth/popup-blocked)";
    case "auth/popup-closed-by-user":
      return "로그인 팝업이 닫혔습니다. 다시 시도해주세요. (auth/popup-closed-by-user)";
    case "auth/unauthorized-domain":
      return "승인되지 않은 도메인입니다. 관리자에게 문의하세요. (auth/unauthorized-domain)";
    case "auth/operation-not-supported-in-this-environment":
      return "이 환경에서는 팝업 로그인이 지원되지 않습니다. (auth/operation-not-supported-in-this-environment)";
    case "auth/network-request-failed":
      return "네트워크 오류입니다. 연결을 확인하고 다시 시도해주세요. (auth/network-request-failed)";
    default:
      return `로그인에 실패했습니다. (${err.code})`;
  }
}

/** (최초 로그인 대비) Firestore에 사용자 문서를 채워두고 싶을 때 호출 */
async function afterGoogleSignin(
  cred: UserCredential,
  goAdmin: () => void,
  setError: (m: string) => void
): Promise<void> {
  const role: UserRole | null = await getUserRole(cred.user.uid);
  if (role === "admin" || role === "super_admin") {
    goAdmin();
  } else {
    await signOut(auth);
    setError("관리자 권한이 없습니다. 관리자 계정으로 로그인하세요.");
  }
}

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const goAdmin = () => router.replace(`/admin`);

  // 이미 로그인 + 관리자면 바로 /admin 리다이렉트
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const role = await getUserRole(user.uid);
      if (role === "admin" || role === "super_admin") {
        router.replace(`/admin`);
      }
    });
    return () => unsub();
  }, [router]);

  // 리다이렉트 복귀 시 결과 회수 (사파리/특정 브라우저에서 중요)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cred = await getRedirectResult(auth);
        if (!cred || !mounted) return;
        await afterGoogleSignin(cred, goAdmin, setError);
      } catch (e) {
        if (!mounted) return;
        setError(mapAuthError(e as AuthError));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []); // 한 번만 체크

  // 로그인 버튼 핸들러
  const handleSignIn = async () => {
    setError("");
    setSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const role: UserRole | null = await getUserRole(cred.user.uid);
      if (role === "admin" || role === "super_admin") {
        goAdmin();
      } else {
        await signOut(auth);
        setError("관리자 권한이 없습니다. 관리자 계정으로 로그인하세요.");
      }
    } catch {
      setError("로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  // 구글 로그인: 팝업 우선 → 팝업 관련 에러면 자동 Redirect 폴백
  const handleGoogleSignIn = async () => {
    setError("");
    setSubmitting(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      // 1) 팝업 먼저 시도(데스크탑/크롬 등에서 UX 좋음)
      const cred = await signInWithPopup(auth, provider);
      await afterGoogleSignin(cred, goAdmin, setError);
    } catch (e) {
      const err = e as AuthError;

      // 2) 팝업이 막히거나 자동 종료되는 전형적 에러면 Redirect로 재시도
      const popupErrors = new Set<string>([
        "auth/popup-blocked",
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-this-environment",
      ]);

      if (popupErrors.has(err.code)) {
        try {
          await signInWithRedirect(auth, provider);
          // 이후 처리는 useEffect(getRedirectResult)에서 이어짐
          return;
        } catch (e2) {
          setError(mapAuthError(e2 as AuthError));
        } finally {
          setSubmitting(false);
        }
      } else {
        // 3) 기타 에러는 코드 노출
        setError(mapAuthError(err));
        setSubmitting(false);
      }
    }
  };

  return (
    <Card className='shadow-lg'>
      <CardHeader className='flex items-center gap-2'>
        <Shield className='w-5 h-5' />
        <span className='text-base font-medium'>관리자 전용 접근</span>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* 에러 상태 메세지 */}
        {error && (
          <Alert variant='destructive'>
            <AlertTitle>에러</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 이메일 입력란 */}
        <div className='space-y-2'>
          <Label htmlFor='admin-email' className='flex items-center gap-2'>
            <Mail className='w-4 h-4' />
            이메일
          </Label>
        </div>
        <Input
          id='admin-email'
          type='email'
          autoComplete='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          placeholder='admin@example.com'
        />

        {/* 비밀번호 입력란 */}
        <div className='space-y-2'>
          <Label htmlFor='admin-password' className='flex items-center gap-2'>
            <Lock className='w-4 h-4' />
            비밀번호
          </Label>
        </div>
        <Input
          id='admin-password'
          type='password'
          autoComplete='current-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          placeholder='••••••••'
        />

        {/* 버튼 */}
        <Button
          onClick={handleSignIn}
          variant='destructive'
          className='w-full'
          disabled={submitting || email.length === 0 || password.length === 0}
        >
          {submitting ? (
            <span className='inline-flex items-center gap-2'>
              <Loader2 className='w-4 h-4 animate-spin' />
              로그인 중...
            </span>
          ) : (
            <span className='inline-flex items-center gap-2'>
              <LogIn className='w-4 h-4' />
              로그인
            </span>
          )}
        </Button>

        <Separator />

        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={handleGoogleSignIn}
          disabled={submitting}
        >
          <Chrome className='w-4 h-4 mr-2' />
          Google로 로그인
        </Button>
      </CardContent>

      <CardFooter className='text-xs text-muted-foreground'>
        성공적으로 로그인하면 관리자 대시보드로 이동합니다.
      </CardFooter>
    </Card>
  );
}
