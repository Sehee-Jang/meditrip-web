"use client";

import SignupTrigger from "../SignupTrigger";
import ContentSection from "@/components/main/ContentSection";
import CommunitySection from "@/components/main/CommunitySection";
import FAQSection from "@/components/main/FAQSection";

export default function HomeContent() {
  return (
    <SignupTrigger>
      <ContentSection />
      <CommunitySection />
      <FAQSection />
    </SignupTrigger>
  );
}
