import HeroSection from "@/components/main/HeroSection";
import CategorySection from "@/components/main/CategorySection";
import SignupSection from "@/components/common/signup/SignupSection";
import HomeContent from "@/components/main/HomeContent";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategorySection />
      <HomeContent />
      <SignupSection />
    </main>
  );
}
