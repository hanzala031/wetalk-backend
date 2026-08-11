import OnboardingIntroScreen from '@/components/onboarding-intro-screen';
import { StatusBar } from 'react-native';

export default function OnboardingIntro() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <OnboardingIntroScreen />
    </>
  );
}

