import {
  createUserWithEmailAndPassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

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

export const registerWithEmail = async ({
  email,
  password,
  nickname,
}: {
  email: string;
  password: string;
  nickname: string;
}) => {
  const currentUser = auth.currentUser;

  const credential = EmailAuthProvider.credential(email, password);

  if (currentUser && currentUser.isAnonymous) {
    // 익명 유저였으면 연결
    const result = await linkWithCredential(currentUser, credential);
    await updateProfile(result.user, { displayName: nickname });
    return result.user;
  } else {
    // 그냥 신규 계정 생성
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: nickname });
    return result.user;
  }
};

// 현재 유저 가져오는 함수
export const getCurrentUser = () => auth.currentUser;
