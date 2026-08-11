import { OnboardingPlacementScreen } from '@/components/onboarding-placement-screen';
import { StatusBar } from 'react-native';

export default function OnboardingPlacement() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <OnboardingPlacementScreen />
    </>
  );
}

