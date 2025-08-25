"use client";

import SignupTrigger from "../common/signup/SignupTrigger";
import CommunitySection from "@/components/main/CommunitySection";
import FAQSection from "@/components/main/FAQSection";

export default function HomeContent() {
  return (
    <SignupTrigger>
      <FAQSection />
      <CommunitySection />
    </SignupTrigger>
  );
}
