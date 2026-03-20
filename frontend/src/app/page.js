import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustedCompanies from '@/components/landing/TrustedCompanies';
import FeatureGrid from '@/components/landing/FeatureGrid';
import InterviewDemo from '@/components/landing/InterviewDemo';
import HowItWorks from '@/components/landing/HowItWorks';
import StatsSection from '@/components/landing/StatsSection';
import AnalyticsPreview from '@/components/landing/AnalyticsPreview';
import FAQSection from '@/components/landing/FAQSection';

export const Separator = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
);

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <TrustedCompanies />
      <FeatureGrid />
      <Separator />
      <InterviewDemo />
      <Separator />
      <HowItWorks />
      <Separator />
      <StatsSection />
      <Separator />
      <AnalyticsPreview />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <FAQSection />
    </div>
  );
}
