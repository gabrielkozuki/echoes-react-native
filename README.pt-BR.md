[🇺🇸 English](README.md) | 🇧🇷 **Português**

# Echoes

Echoes é um diário de jogos — um espaço para registrar suas experiências e com uma mecânica que faz essas memórias ressurgirem quando você menos espera.

---

## Sumário

- [Vídeo demonstrativo](#vídeo-demonstrativo)
- [Conceito](#conceito)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Arquitetura — MVVM em camadas](#arquitetura--mvvm-em-camadas)
- [Design Patterns](#design-patterns)
- [Injeção de Dependência](#injeção-de-dependência)
- [Testes](#testes)
- [Banco de dados](#banco-de-dados)
- [Princípios SOLID](#princípios-solid)
- [Clean Code](#clean-code)

---

## Vídeo demonstrativo

🔗 link aqui

Obs: a memória do Echo (ressurgência) aparece instantaneamente após cadastros posteriores ao primeiro, pois em ambiente de desenvolvimento está programado para aparecer após 30 segundos. Em produção um Echo pode aparecer entre 30 e 365 dias.

---

## Conceito

### O que é um Echo

Um Echo é um registro da sua experiência vinculado a um jogo. Você escreve no momento em que quiser. Pode ser uma frase, um pensamento, uma sensação, etc.

```typescript
interface Echo {
  id: string
  gameId: string
  gameName: string
  gameCoverUrl: string | null
  gameGenre: string | null
  text: string
  platform: string | null     // "PS5", "PC", etc.
  moodTags: string[]           // ["épico", "nostálgico", ...]
  intensity: number            // 0–1 baseado no comprimento do texto
  createdAt: number            // Unix timestamp em ms
  surfaceAt: number            // quando o Echo deve ressurgir (calculado na criação)
  surfacedAt: number | null    // quando efetivamente ressurgiu — null = adormecido
}
```

### A mecânica da Ressurgência

Todo Echo recebe uma data de ressurgência calculada no momento do registro (`surfaceAt`). Quando o usuário salva um novo Echo, o app verifica se existe algum Echo adormecido pronto para ressurgir. Se houver, ele aparece em tela cheia para te relembrar deste momento.

---

## Stack

| Biblioteca | Versão | Uso |
|---|---|---|
| React Native + Expo | 0.83 / 55 | Framework base |
| TypeScript | 5.9 | Linguagem + type safety |
| `@shopify/react-native-skia` | 2.4 | Canvas da Constelação |
| `expo-sqlite` | 55 | Banco de dados local |
| `@tanstack/react-query` | 5 | Estado de servidor (cache, invalidação) |
| `zustand` | 5 | Estado de cliente (ressurgência efêmera) |
| `@react-navigation` | 7 | Navegação (bottom tabs + stack) |
| `react-native-reanimated` | 4.2 | Animações na tela Constelação |
| `expo-dev-client` | 55 | Client customizado com módulos nativos |
| `jest` + `jest-expo` | 29 / 55 | Testes unitários |
| `@testing-library/react-native` | 13 | Testes de componente |

---

## Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9
- **Android Studio** (para Android) ou **Xcode** (para iOS)
- **Expo CLI** (`npm install -g expo-cli`)
- Chave de API gratuita do [RAWG](https://rawg.io/apidocs)

> O projeto usa `expo-dev-client` e **não funciona com Expo Go**, pois `@shopify/react-native-skia` exige módulos nativos compilados.

---

## Instalação e execução

```bash
# 1. Clonar o repositório
git clone https://github.com/gabrielkozuki/echoes-react-native.git
cd echoes-react-native

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente (ver seção abaixo)
cp .env.example .env

# 4. Buildar e executar
npx expo run:android
# ou
npx expo run:ios
```

### Rodar testes

```bash
npx jest
# ou com watch
npx jest --watch
```

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_RAWG_API_KEY=sua_chave_aqui
```

A chave é usada pelo `RawgService` via `process.env.EXPO_PUBLIC_RAWG_API_KEY`

---

## Estrutura do projeto

```
src/
├── data/                          # Camada de Dados
│   ├── __tests__/
│   │   ├── EchoRepository.test.ts
│   │   └── RawgService.test.ts
│   ├── database/
│   │   ├── DatabaseProvider.tsx   # SQLiteProvider com schema inicial
│   │   └── schema.ts
│   ├── repositories/
│   │   ├── EchoRepository.ts      # Implementação de IEchoRepository
│   │   └── SettingsRepository.ts  # Implementação de ISettingsRepository
│   └── services/
│       └── RawgService.ts         # Implementação de IGamesService (RAWG API)
│
├── di/                            # Injeção de Dependência
│   ├── DIContainer.ts             # Interface do container + factory createContainer()
│   └── DIContext.tsx              # DIProvider (Context) + hook useDI()
│
├── domain/                        # Camada de Domínio
│   ├── __tests__/
│   │   ├── CreateEchoUseCase.test.ts
│   │   └── TimeBasedStrategy.test.ts
│   ├── models/
│   │   ├── Echo.ts
│   │   ├── Game.ts
│   │   ├── GameSummary.ts
│   │   ├── IEchoRepository.ts     # Contrato do repositório
│   │   ├── IGamesService.ts       # Contrato do serviço de jogos
│   │   └── ISettingsRepository.ts
│   ├── strategies/
│   │   ├── ISurfaceStrategy.ts    # Contrato da Strategy de ressurgência
│   │   └── TimeBasedStrategy.ts   # Implementação: 30–365 dias (aleatório)
│   └── usecases/
│       ├── CreateEchoUseCase.ts   # Orquestra criação + verificação de ressurgência
│       └── CompleteOnboardingUseCase.ts
│
└── presentation/                  # Camada de Apresentação (MVVM)
    ├── __tests__/
    │   ├── GameSearchScreen.test.tsx
    │   ├── HomeScreen.test.tsx
    │   └── WriteEchoScreen.test.tsx
    ├── components/
    │   ├── EchoCard.tsx
    │   ├── GameSearchResult.tsx
    │   └── TrendingGameCard.tsx
    ├── hooks/
    │   ├── echoHooks.ts           # useGameSummaries, useEchosByGame, useAddEcho, etc.
    │   └── echoQueryKeys.ts       # Chaves hierárquicas do TanStack Query
    ├── navigation/
    │   ├── AppNavigator.tsx
    │   └── types.ts
    ├── screens/
    │   ├── constellation/         # Tela com canvas Skia
    │   │   ├── ConstellationScreen.tsx
    │   │   ├── useConstellationViewModel.ts
    │   │   └── components/
    │   │       ├── ConstellationCanvas.tsx
    │   │       └── GameCard.tsx
    │   ├── game-search/
    │   │   ├── GameSearchScreen.tsx
    │   │   └── useGameSearchViewModel.ts
    │   ├── home/
    │   │   ├── HomeScreen.tsx
    │   │   └── useHomeViewModel.ts
    │   ├── onboarding/
    │   │   ├── OnboardingScreen.tsx
    │   │   └── useOnboardingViewModel.ts
    │   ├── resurgence/
    │   │   ├── SurfaceModal.tsx
    │   │   └── useSurfaceModalViewModel.ts
    │   └── write-echo/
    │       ├── WriteEchoScreen.tsx
    │       └── useWriteEchoViewModel.ts
    ├── stores/
    │   └── echoStore.tsx          # Zustand store (para ressurgência)
    ├── theme/                     # Design Tokens
    │   ├── colors.ts
    │   ├── spacing.ts
    │   └── typography.ts
    └── utils/
        └── date.ts
```

---

## Arquitetura — MVVM em camadas

O projeto é organizado em três camadas com dependências unidirecionais apontadas para dentro, conforme Clean Architecture: `domain` ← `data` ← `presentation`.

### Camada de Domínio

TypeScript puro, sem dependência de React Native ou Expo. Contém:

- **Modelos** — interfaces de dados (`Echo`, `Game`, `GameSummary`)
- **Contratos** — interfaces que as camadas superiores implementam (`IEchoRepository`, `IGamesService`, `ISurfaceStrategy`)
- **Use Cases** — orquestram lógica de negócio usando apenas os contratos, nunca implementações concretas

```typescript
// CreateEchoUseCase só conhece interfaces — não sabe se o banco é SQLite, Firestore ou mock
// generateId é injetado para que o domínio não dependa de react-native-uuid
export class CreateEchoUseCase {
  constructor(
    private readonly repository: IEchoWriteRepository,
    private readonly strategy: ISurfaceStrategy,
    private readonly generateId: () => string,
  ) {}
  // ...
}
```

### Camada de Dados

Implementa os contratos definidos no domínio:

- `EchoRepository` → implementa `IEchoRepository` com SQL nativo via `expo-sqlite`
- `SettingsRepository` → implementa `ISettingsRepository`
- `RawgService` → implementa `IGamesService` consumindo a API RAWG

O mapeamento entre `snake_case` (banco) e `camelCase` (TypeScript) é feito exclusivamente nessa camada. A query principal usa `GROUP BY` para evitar carregar todos os echoes ao renderizar a Constelação:

```sql
SELECT game_id, game_name, game_cover_url, game_genre,
       COUNT(*) AS echo_count,
       MAX(created_at) AS latest_created_at
FROM echoes
GROUP BY game_id
ORDER BY latest_created_at DESC
```

### Camada de Apresentação — MVVM

Cada tela é dividida em dois arquivos na mesma pasta:

| Arquivo | Responsabilidade |
|---|---|
| `useXViewModel.ts` | Estado, lógica derivada, callbacks |
| `XScreen.tsx` | Renderização, navegação baseada no estado do ViewModel |

O ViewModel retorna sinais (`save(): Promise<boolean>`, `completed: boolean`, `loading: boolean`, etc) e a Screen decide quando e como navegar. Isso mantém os ViewModels testáveis sem mock de navegação.


**TanStack Query**: gerencia estado de servidor (dados que vêm do SQLite):

```typescript
// Chaves hierárquicas — invalidar a raiz cascateia para todos os sub-caches
export const echoQueryKeys = {
  all: ['echoes'] as const,
  gameSummaries: () => [...echoQueryKeys.all, 'gameSummaries'] as const,
  byGame: (gameId: string) => [...echoQueryKeys.all, 'byGame', gameId] as const,
  latest: () => [...echoQueryKeys.all, 'latest'] as const,
  count: () => [...echoQueryKeys.all, 'count'] as const,
}

// Após salvar um echo, uma única chamada invalida todos os caches
queryClient.invalidateQueries({ queryKey: echoQueryKeys.all })
```

**Zustand**: gerencia estado de cliente (transiente, sem origem externa):

```typescript
// echoStore.tsx — decide quando o Echo aparece para o usuário.
interface EchoState { resurgence: Echo | null }
interface EchoActions {
  setResurgence: (echo: Echo) => void
  dismissResurgence: () => void
}
```

### Hierarquia de Providers

```
SafeAreaProvider
  └── DatabaseProvider             ← SQLiteProvider + schema init
        └── DIProvider             ← cria todas as dependências com acesso ao banco
              └── QueryClientProvider
                    └── StoreProvider
                          └── AppEntry
                                ├── AppNavigator   ← telas do app
                                └── SurfaceModal   ← overlay irmão, sobrepõe tudo
```

### Design Tokens

O projeto adota design tokens centralizados em theme/ para as cores principais, escala de espaçamento e tipografia base. Valores específicos de composição visual como opacidades, sombras, border-radius e tamanhos de fonte contextuais, são definidos localmente onde são usados.

```typescript
// colors.ts
export const colors = {
  background: '#0a0a14',
  surface: '#12121e',
  text: '#e8e8f0',
  genre: { RPG: '#534AB7', Action: '#D85A30', Adventure: '#1D9E75' }
}

// spacing.ts
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
```

---

## Design Patterns

### Repository Pattern

Abstrai o acesso a dados atrás de interfaces. ViewModels e Use Cases nunca conhecem SQLite — só conhecem `IEchoRepository`.

```
IEchoRepository (domínio)
       ↑
EchoRepository (dados) — implementação concreta com SQLite
       ↑
Mock (testes) — implementação para testes unitários
```

**Onde:** `src/domain/models/IEchoRepository.ts` e `src/data/repositories/EchoRepository.ts`

### Strategy Pattern

O algoritmo de cálculo da data de ressurgência é encapsulado em uma Strategy intercambiável sem alterar repositórios ou use cases.

```typescript
export interface ISurfaceStrategy {
  calculateSurfaceAt(createdAt: number): number
  findSleepingEcho(echoes: Echo[]): Echo | null
}

// Implementação atual: 30–365 dias aleatórios em produção, 30 segundos em dev
export class TimeBasedStrategy implements ISurfaceStrategy {
  constructor(private readonly devMode: boolean = false) {}

  calculateSurfaceAt(createdAt: number): number {
    if (this.devMode) return createdAt + DEV_MS  // DEV_MS = 30 * 1000
    return createdAt + randomBetween(30, 365)
  }
}
```

Para implementar uma nova estratégia (ex: baseada em gênero do jogo ou número de echoes), basta criar uma nova classe que implementa `ISurfaceStrategy` e registrá-la no container de DI.

**Onde:** `src/domain/strategies/`

### Observer Pattern

Implementado em dois níveis:

1. **TanStack Query** — qualquer componente subscrito a uma query reage automaticamente quando `invalidateQueries` é chamado após `useAddEcho`. Publishers (mutations) notificam subscribers (queries) sem acoplamento direto.

2. **Zustand** — `SurfaceModal` (em `App.tsx`) observa `resurgence` no store. Quando `useAddEcho` chama `setResurgence(echo)`, o modal reage automaticamente — sem props, sem callbacks explícitos.

**Onde:** `src/presentation/hooks/echoHooks.ts` e `src/presentation/stores/echoStore.tsx`

### MVVM

Cada tela possui um ViewModel como custom hook (`useXViewModel`). O padrão é aplicado em todas as telas: Home, GameSearch, WriteEcho, Constellation, Onboarding e SurfaceModal.

**Onde:** cada pasta em `src/presentation/screens/`

---

## Injeção de Dependência

O projeto implementa DI sem bibliotecas externas, usando **Context API + Factory**.

### Como funciona

**1. Interface** — o domínio define o contrato:

```typescript
// src/domain/models/IEchoRepository.ts
export interface IEchoRepository {
  create(echo: Echo): Promise<void>
  findSleeping(): Promise<Echo[]>
  findGameSummaries(): Promise<GameSummary[]>
  // ...
}
```

**2. Container** — define o shape do container e a factory:

```typescript
// src/di/DIContainer.ts
export interface DIContainer {
  echoRepository: IEchoRepository
  settingsRepository: ISettingsRepository
  rawgService: IGamesService
  surfaceStrategy: ISurfaceStrategy
  createEchoUseCase: CreateEchoUseCase
  completeOnboardingUseCase: CompleteOnboardingUseCase
}

export const createContainer = (db: SQLiteDatabase): DIContainer => { /* ... */ }
```

**3. Provider** — cria o container com acesso ao banco e expõe via Context:

```typescript
// src/di/DIContext.tsx
export const DIProvider = ({ children }: Props) => {
  const db = useSQLiteContext()
  const container = useMemo(() => createContainer(db), [db])
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>
}

export const useDI = (): DIContainer => {
  const context = useContext(DIContext)
  if (!context) throw new Error('useDI deve ser usado dentro de DIProvider')
  return context
}
```

**4. Consumo** — ViewModels e hooks consomem via `useDI()`:

```typescript
// Nunca importam EchoRepository diretamente — só a interface via useDI()
export const useGameSummaries = () => {
  const repo = useDI().echoRepository
  return useQuery({ queryKey: echoQueryKeys.gameSummaries(), queryFn: () => repo.findGameSummaries() })
}
```

**5. Testes** — nos testes, o container mock é injetado diretamente, sem necessidade de bibliotecas de mocking complexas:

```typescript
const mockRepository: IEchoRepository = {
  create: jest.fn().mockResolvedValue(undefined),
  findSleeping: jest.fn().mockResolvedValue([]),
  // ...
}

// Use Case recebe o mock via construtor — DI por injeção direta
const useCase = new CreateEchoUseCase(mockRepository, strategy)
```

---

## Testes

O projeto possui **36 testes** em 7 suites cobrindo domínio, dados e apresentação.

### Rodar testes

```bash
npx jest                    # todos os testes
npx jest --coverage         # com cobertura
npx jest CreateEchoUseCase  # filtrar por nome
```

### Suites e cobertura

#### Domínio

**`CreateEchoUseCase.test.ts`** (6 testes) — testa a lógica central sem dependência de banco ou React Native. O repositório é mockado via interface.

**`TimeBasedStrategy.test.ts`** (5 testes) — testa o algoritmo da Strategy isoladamente.

#### Dados

**`EchoRepository.test.ts`** (6 testes) — verifica SQL gerado e mapeamento camelCase/snake_case. O `SQLiteDatabase` é mockado.

**`RawgService.test.ts`** (4 testes) — mocka `globalThis.fetch` e valida o mapeamento da resposta da API para `Game[]`.

#### Apresentação

**`HomeScreen.test.tsx`** (6 testes), **`GameSearchScreen.test.tsx`** (4 testes), **`WriteEchoScreen.test.tsx`** (5 testes) — testes de componente com `@testing-library/react-native`. O ViewModel é mockado via `jest.mock`, permitindo testar a Screen isoladamente.

### Configuração

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  globals: { __DEV__: false },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  transformIgnorePatterns: [ /* libs nativas */ ],
}
```

---

## Banco de dados

```sql
CREATE TABLE IF NOT EXISTS echoes (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  game_name TEXT NOT NULL,
  game_cover_url TEXT,
  game_genre TEXT,
  text TEXT NOT NULL,
  platform TEXT,
  mood_tags TEXT NOT NULL DEFAULT '[]',   -- JSON array serializado
  intensity REAL NOT NULL,
  created_at INTEGER NOT NULL,
  surface_at INTEGER NOT NULL,
  surfaced_at INTEGER
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

Dados armazenados exclusivamente no dispositivo, sem autenticação e criação de conta.

---

## Princípios SOLID

### S — Single Responsibility Principle

Cada módulo tem responsabilidade clara:

- `CreateEchoUseCase` → orquestra criação do Echo e verificação de ressurgência
- `TimeBasedStrategy` → calcula quando um Echo deve ressurgir
- `EchoRepository` → acesso ao banco; mapeamento `snake_case` ↔ `camelCase` isolado aqui
- `echoQueryKeys` → define exclusivamente as chaves de cache do TanStack Query
- ViewModels → estado + callbacks; Screens → renderização

### O — Open/Closed Principle

Bem representado pelo Strategy Pattern:

```typescript
// Para nova estratégia, basta implementar ISurfaceStrategy
// sem tocar em repositórios ou use cases
export class GenreBasedStrategy implements ISurfaceStrategy {
  calculateSurfaceAt(createdAt: number): number { ... }
  findSleepingEcho(echoes: Echo[]): Echo | null { ... }
}
```

Novos comportamentos de ressurgência → nova classe, zero modificação no código existente.

### L — Liskov Substitution Principle

As implementações são substituíveis pelos contratos sem quebrar o sistema:

```typescript
// CreateEchoUseCase recebe IEchoWriteRepository
// EchoRepository (SQLite), mock (testes) e qualquer futura implementação são intercambiáveis
const useCase = new CreateEchoUseCase(mockRepository, strategy)
```

Nos testes, o mock é injetado diretamente, uma evidência do LSP funcionando.

### I — Interface Segregation Principle

`IEchoRepository` é dividida em duas interfaces para que cada consumidor dependa apenas do que realmente usa:

```typescript
// CreateEchoUseCase só precisa das operações de escrita + ressurgência
export interface IEchoWriteRepository {
  create(echo: Echo): Promise<void>
  findSleeping(): Promise<Echo[]>
  markSurfaced(id: string, surfacedAt: number): Promise<void>
}

// Hooks e queries precisam da superfície completa de leitura
export interface IEchoRepository extends IEchoWriteRepository {
  findGameSummaries(): Promise<GameSummary[]>
  findByGameId(gameId: string): Promise<Echo[]>
  findLatest(): Promise<Echo | null>
  findCount(): Promise<number>
}
```

`CreateEchoUseCase` depende de `IEchoWriteRepository`. `EchoRepository` implementa `IEchoRepository` (que estende `IEchoWriteRepository`) — a classe concreta não precisou de nenhuma mudança.

### D — Dependency Inversion Principle

Toda comunicação entre camadas passa por abstrações:

```
Presentation → echoHooks → useDI() → IEchoRepository
                                   → IGamesService
                                   → ISurfaceStrategy

Domain (CreateEchoUseCase) → IEchoWriteRepository (nunca EchoRepository)
```

O `DIContainer` concentra a composição, e o `DIProvider` injeta via Context.

---

## Clean Code

Este projeto visa seguir um conjunto de práticas de Clean Code para produzir código legível, bem estruturado e de fácil manutenção. Segue abaixo, em sessões, alguns dos exemplos aplicados na codebase:

### Nomenclatura semântica

Nomes de variáveis, funções e classes descrevem intenção. Por exemplo `surfaceAt` e `surfacedAt` comunicam a diferença entre quando o Echo *deve* ressurgir e quando *efetivamente* ressurgiu. `findSleepingEcho`, `markSurfaced` e `dismissResurgence` são autoexplicativos pelo nome.

### Responsabilidade única (Single Responsibility Principle)

Cada módulo faz exatamente uma coisa. Nenhum arquivo acumula responsabilidades de camadas diferentes:

- [CreateEchoUseCase.ts](src/domain/usecases/CreateEchoUseCase.ts) — orquestra criação do Echo e verificação de ressurgência
- [TimeBasedStrategy.ts](src/domain/strategies/TimeBasedStrategy.ts) — calcula exclusivamente quando um Echo deve ressurgir
- [echoQueryKeys.ts](src/presentation/hooks/echoQueryKeys.ts) — define apenas as chaves de cache do TanStack Query
- [echoStore.tsx](src/presentation/stores/echoStore.tsx) — gerencia apenas o estado efêmero de ressurgência

### Interfaces sobre implementações (Dependency Inversion)

Toda comunicação entre camadas passa por interfaces definidas no domínio. `CreateEchoUseCase` depende de `IEchoRepository`, não de `EchoRepository`. Isso garante que nenhuma camada de alto nível conhece detalhes de implementação das camadas inferiores — banco de dados, API externa ou qualquer outra fonte de dados podem ser trocados sem alterar a lógica de negócio.

### TypeScript strict

O `tsconfig.json` habilita `"strict": true`, ativando verificações rigorosas de tipo em todo o projeto: sem `any` implícito, sem acesso a valores potencialmente `null` sem tratamento, sem parâmetros opcionais ignorados. O compilador funciona como primeira linha de defesa, eliminando uma categoria inteira de erros antes da execução.

### Funções pequenas e coesas

As funções de mapeamento na camada de dados — `toEcho`, `toGameSummary`, `toGame` — fazem uma única transformação cada. Use Cases delegam persistência para repositórios e algoritmos para strategies, em vez de concentrar lógica. ViewModels derivam estado calculado via `useMemo` e expõem callbacks simples, sem misturar lógica de apresentação com regras de negócio.
