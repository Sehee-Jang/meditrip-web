import {
  createUserWithEmailAndPassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { signOut, signInWithEmailAndPassword } from "firebase/auth";

// 익명 로그인
export const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log("✅ 익명 로그인 성공:", result.user);
  } catch (error) {
    console.error("익명 로그인 실패:", error);
  }
};

export const observeAuth = (callback: (user: User) => void) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user);
    } else {
      loginAnonymously();
    }
  });
};

export interface RegisterParams {
  email: string;
  password: string;
  nickname: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

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
      uid: user.uid,
      displayName: nickname,
      email,
      createdAt: serverTimestamp(),
      isAnonymous: false,
      agreeTerms,
      agreeMarketing,
    },
    { merge: true }
  );

  return user;
};

// 현재 유저 가져오는 함수
export const getCurrentUser = () => auth.currentUser;

// 이메일 로그인 함수
export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// 로그아웃 함수
export const logout = () => signOut(auth);
