import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustedCompanies from '@/components/landing/TrustedCompanies';
import FeatureGrid from '@/components/landing/FeatureGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <TrustedCompanies />
      <FeatureGrid />
    </div>
  );
}
