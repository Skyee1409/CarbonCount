import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';

interface WelcomeStepProps {
  nextStep: () => void;
}

export default function WelcomeStep({ nextStep }: WelcomeStepProps) {
  return (
    <div className="onboarding-step-content active" id="step-1">
      <Globe className="welcome-icon text-emerald" />
      <h2>Let&apos;s Discover Your Environmental Impact</h2>
      <p className="welcome-lead">Before you can reduce your carbon footprint, we need to calculate your current emissions. This will take less than 2 minutes!</p>
      <button className="btn btn-primary" onClick={nextStep}>
        Get Started <ArrowRight />
      </button>
    </div>
  );
}
