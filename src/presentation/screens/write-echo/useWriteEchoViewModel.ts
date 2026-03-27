import { useState } from 'react';

import { Game } from '@/domain/models/Game';
import { useAddEcho } from '@/presentation/hooks/echoHooks';

export const useWriteEchoViewModel = (game: Game) => {
  const [text, setText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { mutateAsync: addEcho, isPending: saving, error: mutationError } = useAddEcho();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  // returns true on success so the Screen can trigger navigation.
  const save = async (): Promise<boolean> => {
    if (!text.trim()) return false;
    try {
      await addEcho({ game, text, platform: selectedPlatform, moodTags: selectedTags });
      return true;
    } catch {
      return false;
    }
  };

  const error = mutationError instanceof Error
    ? mutationError.message
    : mutationError ? 'Erro ao salvar' : null;

  return {
    text, setText,
    selectedPlatform, setSelectedPlatform,
    selectedTags, toggleTag,
    saving, error,
    canSave: text.trim().length > 0,
    save,
  };
};
