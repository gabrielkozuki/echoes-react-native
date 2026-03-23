import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

import { useDI } from '@/di/DIContext';

export const useOnboardingViewModel = () => {
  const container = useDI();
  const navigation = useNavigation();
  const [completing, setCompleting] = useState(false);

  const complete = async () => {
    setCompleting(true);
    try {
      await container.settingsRepository.set('onboarding_completed', 'true');
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
      );
    } finally {
      setCompleting(false);
    }
  };

  return { complete, completing };
};
