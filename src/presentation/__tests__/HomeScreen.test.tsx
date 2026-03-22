import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '@/presentation/screens/home/HomeScreen';
import * as useHomeViewModelModule from '@/presentation/screens/home/useHomeViewModel';
import { Echo } from '@/domain/models/Echo';
import { Game } from '@/domain/models/Game';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../screens/home/useHomeViewModel', () => ({
  useHomeViewModel: jest.fn(),
}));

const mockUseHomeViewModel = useHomeViewModelModule.useHomeViewModel as jest.Mock;

const makeEcho = (overrides: Partial<Echo> = {}): Echo => ({
  id: '1',
  gameId: 'game-1',
  gameName: 'Nier: Automata',
  gameCoverUrl: null,
  gameGenre: 'RPG',
  text: 'Uma experiência que vai ficar na memória para sempre.',
  createdAt: new Date('2024-01-03').getTime(),
  surfaceAt: Date.now() + 1000,
  surfacedAt: null,
  intensity: 0.3,
  platform: null,
  moodTags: [],
  ...overrides,
});

const makeTrendingGame = (): Game => ({
  id: 'g1',
  name: 'Elden Ring',
  coverUrl: null,
  genre: 'RPG',
});

const defaultViewModel = {
  loading: false,
  trendingGames: [],
  trendingLoading: false,
  userGames: [],
  lastEcho: null,
  echoCount: 0,
  lastEchoGameCount: 0,
};

describe('HomeScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exibe convite quando não há ecos', () => {
    mockUseHomeViewModel.mockReturnValue(defaultViewModel);

    const { getByText } = render(<HomeScreen />);

    expect(getByText(/Jogando algo/i)).toBeTruthy();
  });

  it('exibe indicador de carregamento dos ecos', () => {
    mockUseHomeViewModel.mockReturnValue({ ...defaultViewModel, loading: true });

    const { getByTestId } = render(<HomeScreen />);

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('exibe seção "seus jogos" e última memória quando há ecos', () => {
    const echo = makeEcho();
    mockUseHomeViewModel.mockReturnValue({
      ...defaultViewModel,
      userGames: [{ id: 'game-1', name: 'Nier: Automata', coverUrl: null, genre: 'RPG' }],
      lastEcho: echo,
      echoCount: 3,
      lastEchoGameCount: 2,
    });

    const { getAllByText, getByText } = render(<HomeScreen />);

    expect(getAllByText('Nier: Automata').length).toBeGreaterThan(0);
    expect(getByText(/seus jogos/i)).toBeTruthy();
    expect(getByText(/2 echoes/i)).toBeTruthy();
    expect(getByText(/última memória/i)).toBeTruthy();
  });

  it('renderiza jogos em alta quando disponíveis', () => {
    mockUseHomeViewModel.mockReturnValue({
      ...defaultViewModel,
      trendingGames: [makeTrendingGame()],
    });

    const { getByText } = render(<HomeScreen />);

    expect(getByText('Elden Ring')).toBeTruthy();
  });

  it('navega para CreateEcho com jogo ao pressionar trending', () => {
    const game = makeTrendingGame();
    mockUseHomeViewModel.mockReturnValue({
      ...defaultViewModel,
      trendingGames: [game],
    });

    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Elden Ring'));

    expect(mockNavigate).toHaveBeenCalledWith('WriteEcho', { game });
  });

  it('navega para CreateEcho ao pressionar o botão +', () => {
    mockUseHomeViewModel.mockReturnValue(defaultViewModel);

    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Registrar eco'));

    expect(mockNavigate).toHaveBeenCalledWith('GameSearch');
  });
});
