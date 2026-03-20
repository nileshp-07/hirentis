import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustedCompanies from '@/components/landing/TrustedCompanies';
import FeatureGrid from '@/components/landing/FeatureGrid';
import InterviewDemo from '@/components/landing/InterviewDemo';
import HowItWorks from '@/components/landing/HowItWorks';
import StatsSection from '@/components/landing/StatsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <TrustedCompanies />
      <FeatureGrid />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <InterviewDemo />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <HowItWorks />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <StatsSection />
    </div>
  );
}
