import { OnboardingReasonScreen } from '@/components/onboarding-reason-screen';
import { StatusBar } from 'react-native';

export default function OnboardingReason() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <OnboardingReasonScreen />
    </>
  );
}

