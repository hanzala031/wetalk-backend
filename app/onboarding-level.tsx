import { OnboardingLevelScreen } from '@/components/onboarding-level-screen';
import { StatusBar } from 'react-native';

export default function OnboardingLevel() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <OnboardingLevelScreen />
    </>
  );
}

