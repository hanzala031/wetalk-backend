import { OnboardingSourceScreen } from '@/components/onboarding-source-screen';
import { StatusBar } from 'react-native';

export default function OnboardingSource() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <OnboardingSourceScreen />
    </>
  );
}

