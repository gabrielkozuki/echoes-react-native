import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GameSearchScreen from '@/presentation/screens/game-search/GameSearchScreen';
import * as useGameSearchViewModelModule from '@/presentation/screens/game-search/useGameSearchViewModel';
import { Game } from '@/domain/models/Game';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/presentation/screens/game-search/useGameSearchViewModel', () => ({
  useGameSearchViewModel: jest.fn(),
}));

const mockUseGameSearchViewModel =
  useGameSearchViewModelModule.useGameSearchViewModel as jest.Mock;

const makeGame = (): Game => ({
  id: 'game-1',
  name: 'Hollow Knight',
  coverUrl: null,
  genre: 'Action',
});

const defaultViewModel = {
  query: '',
  setQuery: jest.fn(),
  results: [],
  searching: false,
  selectGame: jest.fn(),
};

describe('GameSearchScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exibe campo de busca', () => {
    mockUseGameSearchViewModel.mockReturnValue(defaultViewModel);

    const { getByPlaceholderText } = render(<GameSearchScreen />);

    expect(getByPlaceholderText('buscar...')).toBeTruthy();
  });

  it('exibe prompt de busca', () => {
    mockUseGameSearchViewModel.mockReturnValue(defaultViewModel);

    const { getByText } = render(<GameSearchScreen />);

    expect(getByText(/que jogo ficou na memória/i)).toBeTruthy();
  });

  it('exibe resultados quando disponíveis', () => {
    mockUseGameSearchViewModel.mockReturnValue({
      ...defaultViewModel,
      results: [makeGame()],
    });

    const { getByText } = render(<GameSearchScreen />);

    expect(getByText('Hollow Knight')).toBeTruthy();
  });

  it('navega para trás ao pressionar fechar', () => {
    mockUseGameSearchViewModel.mockReturnValue(defaultViewModel);

    const { getByLabelText } = render(<GameSearchScreen />);
    fireEvent.press(getByLabelText('Fechar'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
