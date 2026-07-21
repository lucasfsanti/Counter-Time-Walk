# Unit Tests Design — Counter Time Walk

**Date:** 2026-07-21
**Scope:** Unit tests for all 7 timer features: start, stop, reset, add time, subtract time, add timer, remove timer.

## Approach

Extract timer logic out of Vue components into two composables, then test the composables directly with Vitest. No component mounting or DOM needed. Fake timers (`vi.useFakeTimers()`) control `setInterval` in tests.

## Composables

### `app/composables/useTimer.ts`

Encapsulates all countdown logic for a single timer instance. Each call returns isolated reactive state (no shared singleton).

**Returns:**
- `currentTime: Ref<number>` — seconds remaining (default: 3000 = 50 min)
- `minutes: ComputedRef<string>` — zero-padded string derived from `currentTime`
- `seconds: ComputedRef<string>` — zero-padded string derived from `currentTime`
- `interval: Ref<ReturnType<typeof setInterval> | null>` — null when stopped
- `startTimer(): void`
- `stopTimer(): void`
- `resetTimer(): void`

`minutes` and `seconds` are `computed` (synchronous) rather than watcher-derived. A separate `watch` on `currentTime` auto-stops the timer at 0. Time adjustments (`currentTime.value += 30` etc.) are done directly by callers — no wrapper method.

### `app/composables/useTimerList.ts`

Manages the list of active timers. Each call returns isolated state.

**Returns:**
- `timers: Ref<Array<{ timerId: number, palette: object }>>` — starts with one timer (id 0, palette 0)
- `addTimer(): void` — pushes entry with incrementing id, palette cycles via `getColorPalette(id)`
- `removeTimer(timerId: number): void` — splices by timerId, no-ops on unknown id

Internal `ultimoId` counter lives inside the composable.

## Component Refactoring

### `Timer.vue`

- Switch from Options API `data`/`methods`/`watch`/`computed` to `<script setup>` using `useTimer()`.
- `deleteTimer` stays as a local method (calls `useNuxtApp()` — not part of the composable).
- Remove the `debugger` statement on line 86.
- Time adjustment buttons continue to mutate `currentTime.value` directly inline.

### `index.vue`

- Switch from Options API `data`/`methods` to `<script setup>` using `useTimerList()`.
- Nuxt hooks (`app:timer:add`, `app:timer:delete`) stay in `setup()` and call `addTimer()`/`removeTimer()` from the composable.

## Test Files

### `tests/composables/useTimer.spec.ts`

Uses `vi.useFakeTimers()` / `vi.advanceTimersByTime()`.

| Test | Assertion |
|---|---|
| Start timer | `interval` becomes non-null; after advancing 3 s, `currentTime` decrements by 3 |
| Start timer (idempotent) | Calling `startTimer()` twice does not create two intervals |
| Stop timer | `interval` becomes null; time stops advancing after stop |
| Reset timer | `currentTime` returns to 3000; works while timer is running |
| Minutes/seconds display | Values are correctly zero-padded strings |
| Auto-stop at zero | Timer stops itself (interval → null) when `currentTime` reaches 0 |
| Add time | `currentTime.value += N` updates `minutes`/`seconds` correctly |
| Subtract time | `currentTime.value -= N` updates `minutes`/`seconds` correctly |

### `tests/composables/useTimerList.spec.ts`

No fake timers needed.

| Test | Assertion |
|---|---|
| Initial state | Starts with one timer (timerId 0, palette index 0) |
| Add timer | Pushes entry with incrementing timerId and correct palette |
| Add timer (palette cycling) | After 6 adds, palette index wraps back to 0 |
| Remove timer | Splices the correct entry by timerId |
| Remove timer (unknown id) | No-ops gracefully — list unchanged |

## Setup

**New dev dependencies:**
- `vitest`
- `@vue/test-utils` — provides composable test environment so `watch` and `computed` work correctly

**New files:**
- `vitest.config.ts` — environment: `node`, tests in `tests/`
- `tests/composables/useTimer.spec.ts`
- `tests/composables/useTimerList.spec.ts`

**`package.json` addition:**
```json
"test": "vitest"
```
