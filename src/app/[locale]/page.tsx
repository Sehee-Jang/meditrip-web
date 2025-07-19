import HeroSection from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import CategorySection from "@/components/CategorySection";
import CommunitySection from "@/components/CommunitySection";
import FAQSection from "@/components/FaqSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategorySection />
      <ContentSection />
      <CommunitySection />
      <FAQSection />
    </main>
  );
}
