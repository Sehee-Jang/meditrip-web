import { Suspense } from "react";
import LoginPageWrapper from "@/components/login/LoginPageWrapper";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageWrapper />
    </Suspense>
  );
}
