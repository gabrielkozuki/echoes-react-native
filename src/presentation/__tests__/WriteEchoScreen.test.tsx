import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WriteEchoScreen from '@/presentation/screens/write-echo/WriteEchoScreen';
import * as useWriteEchoViewModelModule from '@/presentation/screens/write-echo/useWriteEchoViewModel';
import { Game } from '@/domain/models/Game';

const mockGoBack = jest.fn();

const makeGame = (): Game => ({
  id: 'game-1',
  name: 'Hollow Knight',
  coverUrl: null,
  genre: 'Action',
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, dispatch: jest.fn() }),
  useRoute: () => ({ params: { game: makeGame() } }),
  StackActions: { popToTop: () => ({ type: 'POP_TO_TOP' }) },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/presentation/screens/write-echo/useWriteEchoViewModel', () => ({
  useWriteEchoViewModel: jest.fn(),
}));

const mockUseWriteEchoViewModel =
  useWriteEchoViewModelModule.useWriteEchoViewModel as jest.Mock;

const defaultViewModel = {
  text: '',
  setText: jest.fn(),
  selectedPlatform: null,
  setSelectedPlatform: jest.fn(),
  selectedTags: [],
  toggleTag: jest.fn(),
  saving: false,
  error: null,
  canSave: false,
  save: jest.fn(),
};

describe('WriteEchoScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exibe nome do jogo no banner', () => {
    mockUseWriteEchoViewModel.mockReturnValue(defaultViewModel);

    const { getByText } = render(<WriteEchoScreen />);

    expect(getByText('Hollow Knight')).toBeTruthy();
  });

  it('exibe input de texto', () => {
    mockUseWriteEchoViewModel.mockReturnValue(defaultViewModel);

    const { getByPlaceholderText } = render(<WriteEchoScreen />);

    expect(getByPlaceholderText('registre sua experiência...')).toBeTruthy();
  });

  it('botão guardar fica desabilitado quando canSave é false', () => {
    mockUseWriteEchoViewModel.mockReturnValue({ ...defaultViewModel, canSave: false });

    const { getByLabelText } = render(<WriteEchoScreen />);

    expect(getByLabelText('Guardar echo').props.accessibilityState?.disabled).toBe(true);
  });

  it('chama save ao pressionar o botão quando canSave é true', () => {
    const mockSave = jest.fn();
    mockUseWriteEchoViewModel.mockReturnValue({ ...defaultViewModel, canSave: true, save: mockSave });

    const { getByLabelText } = render(<WriteEchoScreen />);
    fireEvent.press(getByLabelText('Guardar echo'));

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('exibe mensagem de erro quando error está definido', () => {
    mockUseWriteEchoViewModel.mockReturnValue({ ...defaultViewModel, error: 'Erro ao salvar' });

    const { getByText } = render(<WriteEchoScreen />);

    expect(getByText('Erro ao salvar')).toBeTruthy();
  });
});
