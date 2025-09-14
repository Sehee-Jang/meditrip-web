"use client";

import SignupTrigger from "../common/signup/SignupTrigger";
// import CommunitySection from "@/components/main/CommunitySection";
import FAQSection from "@/components/main/FAQSection";
import ArticleSection from "./ArticleSection";
import ClinicSection from "./ClinicSection";

export default function HomeContent() {
  return (
    <SignupTrigger>
      <ArticleSection />
      <ClinicSection />
      {/* <CommunitySection /> */}
      <FAQSection />
    </SignupTrigger>
  );
}
