import { memo } from 'react';
import { useSelector } from 'react-redux';
import { HeroSection, FeaturesSection, TestimonialsSection, CTASection } from './Welcome/index.js';

const Welcome = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
});

Welcome.displayName = 'Welcome';
export default Welcome;
