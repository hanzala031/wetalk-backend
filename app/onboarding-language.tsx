import { OnboardingLanguageScreen } from '@/components/onboarding-language-screen';
import { StatusBar } from 'react-native';

export default function OnboardingLanguage() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <OnboardingLanguageScreen />
    </>
  );
}

