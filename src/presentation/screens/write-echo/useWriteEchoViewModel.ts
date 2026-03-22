import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';

import { Game } from '@/domain/models/Game';
import { useEchoStore } from '@/presentation/stores/echoStore';

export const useWriteEchoViewModel = (game: Game) => {
  const [text, setText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const store = useEchoStore();
  const addEcho = store(s => s.addEcho);
  const navigation = useNavigation();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  const save = async () => {
    if (!text.trim()) return;

    setSaving(true);
    setError(null);
    
    try {
      await addEcho(game, text, selectedPlatform, selectedTags);
      navigation.dispatch(StackActions.popToTop());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
      setSaving(false);
    }
  };

  return {
    text, setText,
    selectedPlatform, setSelectedPlatform,
    selectedTags, toggleTag,
    saving, error,
    canSave: text.trim().length > 0,
    save,
  };
};
