import {
  createUserWithEmailAndPassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  sendEmailVerification,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "./firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { UserRole, AppLocale } from "@/types/user";
import { resolveBaseUrl } from "@/utils/baseUrl";

const EMAIL_VERIFICATION_BYPASS = new Set(
  (process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_BYPASS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const shouldBypassEmailVerification = (email?: string | null) => {
  if (!email) return false;
  return EMAIL_VERIFICATION_BYPASS.has(email.trim().toLowerCase());
};

export interface RegisterParams {
  email: string;
  password: string;
  nickname: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
  preferredLocale: AppLocale;
}

// 익명 로그인
export const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log("✅ 익명 로그인 성공:", result.user);
  } catch (error) {
    console.error("익명 로그인 실패:", error);
  }
};

// Auth 상태 관찰 (firebase User)
export const observeAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user && !user.isAnonymous) {
      // 실제 로그인된 사용자
      callback(user);
    } else {
      // 익명 또는 로그아웃 상태
      callback(null);
    }
  });
};

// 이메일 회원가입
export const registerWithEmail = async ({
  email,
  password,
  nickname,
  agreeTerms,
  agreeMarketing,
  preferredLocale,
}: RegisterParams): Promise<User> => {
  const currentUser = auth.currentUser;
  const credential = EmailAuthProvider.credential(email, password);
  let user: User;

  let shouldSignOutAfterRegister = false;

  if (currentUser && currentUser.isAnonymous) {
    // 1) 익명 계정과 연결
    const result = await linkWithCredential(currentUser, credential);
    user = result.user;
    await updateProfile(user, { displayName: nickname });
  } else {
    // 2) 새 계정 생성
    const result = await createUserWithEmailAndPassword(auth, email, password);
    user = result.user;
    await updateProfile(user, { displayName: nickname });
    shouldSignOutAfterRegister = true;
  }
  const bypassEmailVerification = shouldBypassEmailVerification(email);

  if (!bypassEmailVerification) {
    // 3) 이메일 인증 메일 발송 (인증 후 해당 언어의 로그인 페이지로 이동)
    const verificationRedirectUrl = `${resolveBaseUrl()}/${preferredLocale}/login`;
    await sendEmailVerification(user, {
      url: verificationRedirectUrl,
      handleCodeInApp: false,
    });
  }

  // 4) Firestore에 사용자 프로필 저장 (merge: 중복 호출 대비)
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const isNewDoc = !snap.exists();

  const base = {
    id: user.uid,
    role: "user" as UserRole,
    nickname,
    email,
    photoURL: user.photoURL ?? null,
    isAnonymous: false,
    agreeTerms,
    agreeMarketing,
    points: 0,
    preferredLocale,
    updatedAt: serverTimestamp(),
  };

  await setDoc(
    ref,
    isNewDoc
      ? { ...base, createdAt: serverTimestamp() } // 새 문서일 때만 createdAt 세팅
      : base,
    { merge: true }
  );

  if (shouldSignOutAfterRegister) {
    await signOut(auth);
  }

  return user;
};

// 이메일 로그인 함수
export const loginWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const bypassEmailVerification = shouldBypassEmailVerification(email);

  if (!result.user.emailVerified && !bypassEmailVerification) {
    await signOut(auth);
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  return result.user;
};
// Google OAuth 로그인 함수
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (
  preferredLocale?: AppLocale
): Promise<User> => {
  try {
    // 1) 팝업으로 로그인
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // 2) 추가 유저 정보(신규 가입 여부) 조회
    const info = getAdditionalUserInfo(result);
    const isNewUser = info?.isNewUser;
    const ref = doc(db, "users", user.uid);
    // 3) 신규 사용자라면 Firestore에 프로필 저장
    if (isNewUser) {
      await setDoc(
        ref,
        {
          uid: user.uid,
          role: "user" as UserRole,
          nickname: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          isAnonymous: false,
          agreeTerms: true, // 필요 시 기본값 설정
          agreeMarketing: false, // 필요 시 기본값 설정
          points: 0,
          preferredLocale: preferredLocale ?? "ko",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else if (preferredLocale) {
      // 3-b) 기존 유저: preferredLocale 없으면 한 번 백필
      const snap = await getDoc(ref);
      const data = snap.data() ?? {};
      if (!("preferredLocale" in data)) {
        await updateDoc(ref, {
          preferredLocale,
          updatedAt: serverTimestamp(),
        });
      }
    }

    return user;
  } catch (error) {
    console.error("Google 로그인 실패:", error);
    throw error;
  }
};

// 로그아웃 함수
export const logout = () => signOut(auth);

// 현재 유저 가져오는 함수
export const getCurrentUser = () => auth.currentUser;
