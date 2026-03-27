import { useState, useCallback, useEffect } from 'react';

import { Echo } from '@/domain/models/Echo';
import { useEchoStore } from '@/presentation/stores/echoStore';

export type SurfacePhase = 'intro' | 'echo';

const daysSince = (ms: number) => Math.floor((Date.now() - ms) / (1000 * 60 * 60 * 24));

export const useSurfaceModalViewModel = () => {
  const store = useEchoStore();
  const resurgence: Echo | null = store(s => s.resurgence);
  const dismiss = store(s => s.dismissResurgence);

  const [phase, setPhase] = useState<SurfacePhase>('intro');

  
  useEffect(() => { // reset to intro screen whenever a new resurgence arrives.
    if (resurgence) setPhase('intro');
  }, [resurgence]);

  const reveal = useCallback(() => setPhase('echo'), []);

  const daysLabel = resurgence
    ? (() => {
        const d = daysSince(resurgence.createdAt);
        return d === 0 ? 'de hoje' : d === 1 ? 'de ontem' : `de ${d} dias atrás`;
      })()
    : '';

  return { resurgence, dismiss, phase, reveal, daysLabel };
};
