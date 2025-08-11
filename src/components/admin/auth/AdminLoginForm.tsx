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

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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

  const goAdmin = () => router.replace(`/admin`);

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

  const handleGoogleSignIn = async () => {
    setError("");
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const role = await getUserRole(cred.user.uid);
      if (role === "admin" || role === "super_admin") {
        goAdmin();
      } else {
        await signOut(auth);
        setError("관리자 권한이 없습니다. 관리자 계정으로 로그인하세요.");
      }
    } catch {
      setError("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className='shadow-lg'>
      <CardHeader className='flex items-center gap-2'>
        <Shield className='w-5 h-5' />
        <span className='text-base font-medium'>관리자 전용 접근</span>
      </CardHeader>

      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertTitle>에러</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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

        <Button
          onClick={handleSignIn}
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
