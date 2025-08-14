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
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserRole } from "@/types/user";

export interface RegisterParams {
  email: string;
  password: string;
  nickname: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

// 익명 로그인
export const loginAnonymously = async () => {
  try {
    await signInAnonymously(auth);
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
}: RegisterParams): Promise<User> => {
  const currentUser = auth.currentUser;
  const credential = EmailAuthProvider.credential(email, password);
  let user: User;

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
  }
  // 3) 이메일 인증 메일 발송
  await sendEmailVerification(user);

  // 4) Firestore에 사용자 프로필 저장 (merge: 중복 호출 대비)
  await setDoc(
    doc(db, "users", user.uid),
    {
      role: "user" as UserRole,
      nickname,
      email,
      photoURL: user!.photoURL ?? null,
      createdAt: serverTimestamp(),
      isAnonymous: false,
      agreeTerms,
      agreeMarketing,
      points: 0,
    },
    { merge: true }
  );

  return user;
};

// 이메일 로그인 함수
export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Google OAuth 로그인 함수
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<User> => {
  try {
    // 1) 팝업으로 로그인
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // 2) 추가 유저 정보(신규 가입 여부) 조회
    const info = getAdditionalUserInfo(result);
    const isNewUser = info?.isNewUser;

    // 3) 신규 사용자라면 Firestore에 프로필 저장
    if (isNewUser) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          nickname: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          isAnonymous: false,
          agreeTerms: true, // 필요 시 기본값 설정
          agreeMarketing: false, // 필요 시 기본값 설정
        },
        { merge: true }
      );
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
