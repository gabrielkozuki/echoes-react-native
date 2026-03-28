🇺🇸 **English** | [🇧🇷 Português](README.pt-BR.md)

# Echoes

Echoes is a game journal — a space to record your experiences, with a mechanic that brings those memories back when you least expect it.

---

## Table of Contents

- [Demo Video](#demo-video)
- [Concept](#concept)
- [Stack](#stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Architecture — Layered MVVM](#architecture--layered-mvvm)
- [Design Patterns](#design-patterns)
- [Dependency Injection](#dependency-injection)
- [Tests](#tests)
- [Database](#database)
- [Clean Code](#clean-code)

---

## Demo Video

🔗 link here

Note: the Echo memory (resurgence) appears immediately after entries subsequent to the first one, because in development it is configured to appear after 30 seconds. In production, an Echo may appear between 30 and 365 days later.

---

## Concept

### What is an Echo

An Echo is a record of your experience tied to a game. You write it whenever you want. It can be a sentence, a thought, a feeling, etc.

```typescript
interface Echo {
  id: string
  gameId: string
  gameName: string
  gameCoverUrl: string | null
  gameGenre: string | null
  text: string
  platform: string | null     // "PS5", "PC", etc.
  moodTags: string[]           // ["epic", "nostalgic", ...]
  intensity: number            // 0–1 based on text length
  createdAt: number            // Unix timestamp in ms
  surfaceAt: number            // when the Echo should resurface (calculated at creation)
  surfacedAt: number | null    // when it actually resurfaced — null = sleeping
}
```

### The Resurgence Mechanic

Every Echo receives a resurgence date calculated at the time of its creation (`surfaceAt`). When the user saves a new Echo, the app checks if any sleeping Echo is ready to resurface. If one exists, it appears full-screen to remind you of that moment.

---

## Stack

| Library | Version | Usage |
|---|---|---|
| React Native + Expo | 0.83 / 55 | Base framework |
| TypeScript | 5.9 | Language + type safety |
| `@shopify/react-native-skia` | 2.4 | Constellation canvas |
| `expo-sqlite` | 55 | Local database |
| `@tanstack/react-query` | 5 | Server state (cache, invalidation) |
| `zustand` | 5 | Client state (ephemeral resurgence) |
| `@react-navigation` | 7 | Navigation (bottom tabs + stack) |
| `react-native-reanimated` | 4.2 | Animations on the Constellation screen |
| `expo-dev-client` | 55 | Custom client with native modules |
| `jest` + `jest-expo` | 29 / 55 | Unit tests |
| `@testing-library/react-native` | 13 | Component tests |

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Android Studio** (for Android) or **Xcode** (for iOS)
- **Expo CLI** (`npm install -g expo-cli`)
- Free API key from [RAWG](https://rawg.io/apidocs)

> The project uses `expo-dev-client` and **does not work with Expo Go**, since `@shopify/react-native-skia` requires compiled native modules.

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/gabrielkozuki/echoes-react-native.git
cd echoes-react-native

# 2. Install dependencies
npm install

# 3. Configure environment variables (see section below)
cp .env.example .env

# 4. Build and run
npx expo run:android
# or
npx expo run:ios
```

### Run tests

```bash
npx jest
# or with watch
npx jest --watch
```

---

## Environment Variables

Create a `.env` file at the project root:

```env
EXPO_PUBLIC_RAWG_API_KEY=your_key_here
```

The key is used by `RawgService` via `process.env.EXPO_PUBLIC_RAWG_API_KEY`

---

## Project Structure

```
src/
├── data/                          # Data Layer
│   ├── __tests__/
│   │   ├── EchoRepository.test.ts
│   │   └── RawgService.test.ts
│   ├── database/
│   │   ├── DatabaseProvider.tsx   # SQLiteProvider with initial schema
│   │   └── schema.ts
│   ├── repositories/
│   │   ├── EchoRepository.ts      # IEchoRepository implementation
│   │   └── SettingsRepository.ts  # ISettingsRepository implementation
│   └── services/
│       └── RawgService.ts         # IGamesService implementation (RAWG API)
│
├── di/                            # Dependency Injection
│   ├── DIContainer.ts             # Container interface + createContainer() factory
│   └── DIContext.tsx              # DIProvider (Context) + useDI() hook
│
├── domain/                        # Domain Layer
│   ├── __tests__/
│   │   ├── CreateEchoUseCase.test.ts
│   │   └── TimeBasedStrategy.test.ts
│   ├── models/
│   │   ├── Echo.ts
│   │   ├── Game.ts
│   │   ├── GameSummary.ts
│   │   ├── IEchoRepository.ts     # Repository contract
│   │   ├── IGamesService.ts       # Games service contract
│   │   └── ISettingsRepository.ts
│   ├── strategies/
│   │   ├── ISurfaceStrategy.ts    # Resurgence Strategy contract
│   │   └── TimeBasedStrategy.ts   # Implementation: 30–365 days (random)
│   └── usecases/
│       ├── CreateEchoUseCase.ts   # Orchestrates creation + resurgence check
│       └── CompleteOnboardingUseCase.ts
│
└── presentation/                  # Presentation Layer (MVVM)
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
    │   └── echoQueryKeys.ts       # TanStack Query hierarchical keys
    ├── navigation/
    │   ├── AppNavigator.tsx
    │   └── types.ts
    ├── screens/
    │   ├── constellation/         # Screen with Skia canvas
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
    │   └── echoStore.tsx          # Zustand store (resurgence state)
    ├── theme/                     # Design Tokens
    │   ├── colors.ts
    │   ├── spacing.ts
    │   └── typography.ts
    └── utils/
        └── date.ts
```

---

## Architecture — Layered MVVM

The project is organized in three layers with unidirectional dependencies pointing inward, following Clean Architecture: `domain` ← `data` ← `presentation`.

### Domain Layer

Pure TypeScript, with no dependency on React Native or Expo — except for `react-native-uuid` used in `CreateEchoUseCase` for ID generation. Contains:

- **Models** — data interfaces (`Echo`, `Game`, `GameSummary`)
- **Contracts** — interfaces that upper layers implement (`IEchoRepository`, `IGamesService`, `ISurfaceStrategy`)
- **Use Cases** — orchestrate business logic using only contracts, never concrete implementations

```typescript
// CreateEchoUseCase only knows interfaces — doesn't know if the DB is SQLite, Firestore, or a mock
export class CreateEchoUseCase {
  constructor(
    private readonly repository: IEchoRepository,
    private readonly strategy: ISurfaceStrategy,
  ) {}
  // ...
}
```

### Data Layer

Implements contracts defined in the domain:

- `EchoRepository` → implements `IEchoRepository` with raw SQL via `expo-sqlite`
- `SettingsRepository` → implements `ISettingsRepository`
- `RawgService` → implements `IGamesService` consuming the RAWG API

The mapping between `snake_case` (database) and `camelCase` (TypeScript) is done exclusively in this layer. The main query uses `GROUP BY` to avoid loading all echoes when rendering the Constellation:

```sql
SELECT game_id, game_name, game_cover_url, game_genre,
       COUNT(*) AS echo_count,
       MAX(created_at) AS latest_created_at
FROM echoes
GROUP BY game_id
ORDER BY latest_created_at DESC
```

### Presentation Layer — MVVM

Each screen is split into two files in the same folder:

| File | Responsibility |
|---|---|
| `useXViewModel.ts` | State, derived logic, callbacks |
| `XScreen.tsx` | Rendering, navigation based on ViewModel state |

The ViewModel returns signals (`save(): Promise<boolean>`, `completed: boolean`, `loading: boolean`, etc.) and the Screen decides when and how to navigate. This keeps ViewModels testable without mocking navigation.

**TanStack Query**: manages server state (data from SQLite):

```typescript
// Hierarchical keys — invalidating the root cascades to all sub-caches
export const echoQueryKeys = {
  all: ['echoes'] as const,
  gameSummaries: () => [...echoQueryKeys.all, 'gameSummaries'] as const,
  byGame: (gameId: string) => [...echoQueryKeys.all, 'byGame', gameId] as const,
  latest: () => [...echoQueryKeys.all, 'latest'] as const,
  count: () => [...echoQueryKeys.all, 'count'] as const,
}

// After saving an echo, a single call invalidates all caches
queryClient.invalidateQueries({ queryKey: echoQueryKeys.all })
```

**Zustand**: manages client state (transient, no external source):

```typescript
// echoStore.tsx — decides when the Echo appears to the user.
interface EchoState { resurgence: Echo | null }
interface EchoActions {
  setResurgence: (echo: Echo) => void
  dismissResurgence: () => void
}
```

### Provider Hierarchy

```
SafeAreaProvider
  └── DatabaseProvider             ← SQLiteProvider + schema init
        └── DIProvider             ← creates all dependencies with database access
              └── QueryClientProvider
                    └── StoreProvider
                          └── AppEntry
                                ├── AppNavigator   ← app screens
                                └── SurfaceModal   ← sibling overlay, covers everything
```

### Design Tokens

The project uses design tokens centralized in `theme/` for main colors, spacing scale, and base typography. Specific visual composition values like opacities, shadows, border-radius, and contextual font sizes are defined locally where used.

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

Abstracts data access behind interfaces. ViewModels and Use Cases never know SQLite — they only know `IEchoRepository`.

```
IEchoRepository (domain)
       ↑
EchoRepository (data) — concrete implementation with SQLite
       ↑
Mock (tests) — implementation for unit tests
```

**Where:** `src/domain/models/IEchoRepository.ts` and `src/data/repositories/EchoRepository.ts`

### Strategy Pattern

The resurgence date calculation algorithm is encapsulated in an interchangeable Strategy without changing repositories or use cases.

```typescript
export interface ISurfaceStrategy {
  calculateSurfaceAt(createdAt: number): number
  findSleepingEcho(echoes: Echo[]): Echo | null
}

// Current implementation: 30–365 random days in production, 30 seconds in dev
export class TimeBasedStrategy implements ISurfaceStrategy {
  constructor(private readonly devMode: boolean = false) {}

  calculateSurfaceAt(createdAt: number): number {
    if (this.devMode) return createdAt + DEV_MS  // DEV_MS = 30 * 1000
    return createdAt + randomBetween(30, 365)
  }
}
```

To implement a new strategy (e.g., based on game genre or number of echoes), just create a new class implementing `ISurfaceStrategy` and register it in the DI container.

**Where:** `src/domain/strategies/`

### Observer Pattern

Implemented at two levels:

1. **TanStack Query** — any component subscribed to a query reacts automatically when `invalidateQueries` is called after `useAddEcho`. Publishers (mutations) notify subscribers (queries) without direct coupling.

2. **Zustand** — `SurfaceModal` (in `App.tsx`) observes `resurgence` in the store. When `useAddEcho` calls `setResurgence(echo)`, the modal reacts automatically — no props, no explicit callbacks.

**Where:** `src/presentation/hooks/echoHooks.ts` and `src/presentation/stores/echoStore.tsx`

### MVVM

Each screen has a ViewModel as a custom hook (`useXViewModel`). The pattern is applied to all screens: Home, GameSearch, WriteEcho, Constellation, Onboarding, and SurfaceModal.

**Where:** each folder in `src/presentation/screens/`

---

## Dependency Injection

The project implements DI without external libraries, using **Context API + Factory**.

### How it works

**1. Interface** — the domain defines the contract:

```typescript
// src/domain/models/IEchoRepository.ts
export interface IEchoRepository {
  create(echo: Echo): Promise<void>
  findSleeping(): Promise<Echo[]>
  findGameSummaries(): Promise<GameSummary[]>
  // ...
}
```

**2. Container** — defines the container shape and factory:

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

**3. Provider** — creates the container with database access and exposes it via Context:

```typescript
// src/di/DIContext.tsx
export const DIProvider = ({ children }: Props) => {
  const db = useSQLiteContext()
  const container = useMemo(() => createContainer(db), [db])
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>
}

export const useDI = (): DIContainer => {
  const context = useContext(DIContext)
  if (!context) throw new Error('useDI must be used inside DIProvider')
  return context
}
```

**4. Consumption** — ViewModels and hooks consume via `useDI()`:

```typescript
// Never import EchoRepository directly — only the interface via useDI()
export const useGameSummaries = () => {
  const repo = useDI().echoRepository
  return useQuery({ queryKey: echoQueryKeys.gameSummaries(), queryFn: () => repo.findGameSummaries() })
}
```

**5. Tests** — in tests, the mock container is injected directly, with no need for complex mocking libraries:

```typescript
const mockRepository: IEchoRepository = {
  create: jest.fn().mockResolvedValue(undefined),
  findSleeping: jest.fn().mockResolvedValue([]),
  // ...
}

// Use Case receives the mock via constructor — DI through direct injection
const useCase = new CreateEchoUseCase(mockRepository, strategy)
```

---

## Tests

The project has **36 tests** in 7 suites covering domain, data, and presentation layers.

### Run tests

```bash
npx jest                    # all tests
npx jest --coverage         # with coverage
npx jest CreateEchoUseCase  # filter by name
```

### Suites and coverage

#### Domain

**`CreateEchoUseCase.test.ts`** (6 tests) — tests the core logic without dependency on database or React Native. The repository is mocked via interface.

**`TimeBasedStrategy.test.ts`** (5 tests) — tests the Strategy algorithm in isolation.

#### Data

**`EchoRepository.test.ts`** (6 tests) — verifies generated SQL and camelCase/snake_case mapping. The `SQLiteDatabase` is mocked.

**`RawgService.test.ts`** (4 tests) — mocks `globalThis.fetch` and validates API response mapping to `Game[]`.

#### Presentation

**`HomeScreen.test.tsx`** (6 tests), **`GameSearchScreen.test.tsx`** (4 tests), **`WriteEchoScreen.test.tsx`** (5 tests) — component tests with `@testing-library/react-native`. The ViewModel is mocked via `jest.mock`, allowing the Screen to be tested in isolation.

### Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  globals: { __DEV__: false },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  transformIgnorePatterns: [ /* native libs */ ],
}
```

---

## Database

```sql
CREATE TABLE IF NOT EXISTS echoes (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  game_name TEXT NOT NULL,
  game_cover_url TEXT,
  game_genre TEXT,
  text TEXT NOT NULL,
  platform TEXT,
  mood_tags TEXT NOT NULL DEFAULT '[]',   -- serialized JSON array
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

Data stored exclusively on the device, with no authentication or account creation.

---

## Clean Code

This project aims to follow a set of Clean Code practices to produce readable, well-structured, and maintainable code. Below are some examples applied across the codebase:

### Semantic Naming

Variable, function, and class names describe intent. For example, `surfaceAt` and `surfacedAt` communicate the difference between when an Echo *should* resurface and when it *actually* resurfaced. `findSleepingEcho`, `markSurfaced`, and `dismissResurgence` are self-explanatory by name.

### Single Responsibility Principle

Each module does exactly one thing. No file accumulates responsibilities from different layers:

- [CreateEchoUseCase.ts](src/domain/usecases/CreateEchoUseCase.ts) — orchestrates Echo creation and resurgence verification
- [TimeBasedStrategy.ts](src/domain/strategies/TimeBasedStrategy.ts) — exclusively calculates when an Echo should resurface
- [echoQueryKeys.ts](src/presentation/hooks/echoQueryKeys.ts) — defines only the TanStack Query cache keys
- [echoStore.tsx](src/presentation/stores/echoStore.tsx) — manages only the ephemeral resurgence state

### Interfaces over Implementations (Dependency Inversion)

All communication between layers goes through interfaces defined in the domain. `CreateEchoUseCase` depends on `IEchoRepository`, not `EchoRepository`. This ensures no high-level layer knows implementation details of lower layers — database, external API, or any other data source can be swapped without changing business logic.

### TypeScript strict

The `tsconfig.json` enables `"strict": true`, activating strict type checking throughout the project: no implicit `any`, no access to potentially `null` values without handling, no ignored optional parameters. The compiler acts as the first line of defense, eliminating an entire category of errors before execution.

### Small and Cohesive Functions

The mapping functions in the data layer — `toEcho`, `toGameSummary`, `toGame` — each perform a single transformation. Use Cases delegate persistence to repositories and algorithms to strategies, rather than concentrating logic. ViewModels derive calculated state via `useMemo` and expose simple callbacks, without mixing presentation logic with business rules.
