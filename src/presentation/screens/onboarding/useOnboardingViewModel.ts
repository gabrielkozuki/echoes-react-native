import { useState } from 'react';

import { useDI } from '@/di/DIContext';

export const useOnboardingViewModel = () => {
  const container = useDI();
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const complete = async () => {
    setCompleting(true);
    try {
      await container.completeOnboardingUseCase.execute();
      setCompleted(true);
    } finally {
      setCompleting(false);
    }
  };

  return { complete, completing, completed };
};
