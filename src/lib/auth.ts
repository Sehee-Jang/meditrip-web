import { auth } from "./firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

export const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log("익명 로그인 성공:", result.user);
  } catch (error) {
    console.error("익명 로그인 실패:", error);
  }
};

export const observeAuth = (callback: (user: any) => void) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user);
    } else {
      loginAnonymously();
    }
  });
};
