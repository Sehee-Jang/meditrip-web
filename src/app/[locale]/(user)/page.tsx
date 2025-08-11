import HeroSection from "@/components/main/HeroSection";
import CategorySection from "@/components/main/CategorySection";
import SignupSection from "@/components/common/signup/SignupSection";
import HomeContent from "@/components/main/HomeContent";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategorySection mode='link' linkHref='/contents' />
      <HomeContent />
      <SignupSection />
    </main>
  );
}
