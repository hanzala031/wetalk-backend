import { OnboardingGoalScreen } from '@/components/onboarding-goal-screen';
import { StatusBar } from 'react-native';

export default function OnboardingGoal() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <OnboardingGoalScreen />
    </>
  );
}

