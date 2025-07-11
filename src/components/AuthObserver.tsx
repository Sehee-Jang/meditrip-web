"use client";

import { useEffect } from "react";
import { observeAuth } from "@/lib/auth";

export default function AuthObserver() {
  useEffect(() => {
    observeAuth((user) => {
      console.log("현재 로그인된 유저:", user);
      // user.isAnonymous === true 체크 가능
    });
  }, []);

  return null;
}
