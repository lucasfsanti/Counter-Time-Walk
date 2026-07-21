# Unit Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract timer logic into two Vue composables and cover all 7 features (start, stop, reset, add time, subtract time, add timer, remove timer) with Vitest unit tests.

**Architecture:** `useTimer` and `useTimerList` composables hold all reactive logic; `Timer.vue` and `index.vue` are refactored to `<script setup>` consuming those composables. Tests call composables directly inside `effectScope` — no component mounting, no DOM.

**Tech Stack:** Vitest, Vue 3 reactivity (`ref`, `computed`, `watch`, `effectScope`), `vi.useFakeTimers()` for interval control.

## Global Constraints

- Nuxt 4 + Vue 3 project; `"type": "module"` in `package.json`
- Composables live in `app/composables/` (Nuxt auto-imports them in components)
- Tests live in `tests/composables/`
- Run tests with `npm test`
- No `@vue/test-utils` needed — use `effectScope` from `vue` directly
- `getColorPalette` must be explicitly imported via relative path in `useTimerList.ts` (not via Nuxt auto-import) so tests can resolve it

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `vitest.config.ts` | Test runner config |
| Create | `app/composables/useTimer.ts` | Countdown logic |
| Create | `app/composables/useTimerList.ts` | Timer list management |
| Modify | `app/components/Timer.vue` | Consume `useTimer()` via `<script setup>` |
| Modify | `app/pages/index.vue` | Consume `useTimerList()` via `<script setup>` |
| Create | `tests/composables/useTimer.spec.ts` | 9 tests for timer logic |
| Create | `tests/composables/useTimerList.spec.ts` | 5 tests for list logic |

---

## Task 1: Install Vitest and configure test runner

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script + `devDependencies`)

**Interfaces:**
- Produces: `npm test` command that runs all `tests/**/*.spec.ts` files

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest
```

Expected: `package.json` gains a `devDependencies` section with `vitest`.

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
  },
})
```

- [ ] **Step 3: Add test script to package.json**

In the `"scripts"` section, add:

```json
"test": "vitest"
```

- [ ] **Step 4: Verify vitest runs with no tests**

```bash
npm test -- --run
```

Expected output contains: `No test files found` or `0 tests` — no errors.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "feat: add vitest test runner"
```

---

## Task 2: useTimer composable + tests

**Files:**
- Create: `app/composables/useTimer.ts`
- Create: `tests/composables/useTimer.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  useTimer(): {
    currentTime: Ref<number>          // seconds remaining, default 3000
    minutes: ComputedRef<string>      // "50", "01", zero-padded when < 10
    seconds: ComputedRef<string>      // "00", "05", zero-padded when < 10
    interval: Ref<ReturnType<typeof setInterval> | null>  // null when stopped
    startTimer(): void
    stopTimer(): void
    resetTimer(): void
  }
  ```

- [ ] **Step 1: Create the test file**

Create `tests/composables/useTimer.spec.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope } from 'vue'
import { useTimer } from '../../app/composables/useTimer'

describe('useTimer', () => {
  let scope: ReturnType<typeof effectScope>
  let timer: ReturnType<typeof useTimer>

  beforeEach(() => {
    vi.useFakeTimers()
    scope = effectScope()
    scope.run(() => {
      timer = useTimer()
    })
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
  })

  it('initialises at 50 minutes (3000 seconds)', () => {
    expect(timer.currentTime.value).toBe(3000)
    expect(timer.minutes.value).toBe('50')
    expect(timer.seconds.value).toBe('00')
  })

  it('startTimer sets interval and decrements currentTime each second', () => {
    timer.startTimer()
    expect(timer.interval.value).not.toBeNull()
    vi.advanceTimersByTime(3000)
    expect(timer.currentTime.value).toBe(2997)
  })

  it('startTimer is idempotent — a second call does not double-decrement', () => {
    timer.startTimer()
    timer.startTimer()
    vi.advanceTimersByTime(3000)
    expect(timer.currentTime.value).toBe(2997)
  })

  it('stopTimer clears interval and halts countdown', () => {
    timer.startTimer()
    vi.advanceTimersByTime(2000)
    timer.stopTimer()
    expect(timer.interval.value).toBeNull()
    vi.advanceTimersByTime(5000)
    expect(timer.currentTime.value).toBe(2998)
  })

  it('resetTimer restores currentTime to 3000 while keeping timer running', () => {
    timer.startTimer()
    vi.advanceTimersByTime(10000)
    expect(timer.currentTime.value).toBe(2990)
    timer.resetTimer()
    expect(timer.currentTime.value).toBe(3000)
    expect(timer.interval.value).not.toBeNull()
    vi.advanceTimersByTime(5000)
    expect(timer.currentTime.value).toBe(2995)
  })

  it('auto-stops and sets interval to null when currentTime reaches 0', () => {
    timer.startTimer()
    vi.advanceTimersByTime(3000 * 1000)
    expect(timer.currentTime.value).toBe(0)
    expect(timer.interval.value).toBeNull()
  })

  it('minutes and seconds are correctly zero-padded strings', () => {
    timer.currentTime.value = 65  // 1 min 5 sec
    expect(timer.minutes.value).toBe('01')
    expect(timer.seconds.value).toBe('05')
  })

  it('adding time to currentTime updates minutes and seconds', () => {
    timer.currentTime.value += 30
    expect(timer.currentTime.value).toBe(3030)
    expect(timer.minutes.value).toBe('50')
    expect(timer.seconds.value).toBe('30')
  })

  it('subtracting time from currentTime updates minutes and seconds', () => {
    timer.currentTime.value -= 60
    expect(timer.currentTime.value).toBe(2940)
    expect(timer.minutes.value).toBe('49')
    expect(timer.seconds.value).toBe('00')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail with import error**

```bash
npm test -- --run
```

Expected: `Cannot find module '../../app/composables/useTimer'`

- [ ] **Step 3: Create app/composables/useTimer.ts**

```ts
import { ref, computed, watch } from 'vue'

const DEFAULT_DURATION = 50 * 60

export function useTimer() {
  const timerCount = ref(DEFAULT_DURATION)
  const currentTime = ref(DEFAULT_DURATION)
  const interval = ref<ReturnType<typeof setInterval> | null>(null)

  const minutes = computed(() => {
    const min = Math.floor(currentTime.value / 60)
    return min < 10 ? `0${min}` : `${min}`
  })

  const seconds = computed(() => {
    const sec = currentTime.value % 60
    return sec < 10 ? `0${sec}` : `${sec}`
  })

  watch(currentTime, (value) => {
    if (value <= 0) stopTimer()
  }, { immediate: true, flush: 'sync' })

  function startTimer() {
    if (interval.value === null) {
      interval.value = setInterval(() => {
        currentTime.value--
      }, 1000)
    }
  }

  function stopTimer() {
    if (interval.value !== null) {
      clearInterval(interval.value)
      interval.value = null
    }
  }

  function resetTimer() {
    currentTime.value = timerCount.value
  }

  return { currentTime, minutes, seconds, interval, startTimer, stopTimer, resetTimer }
}
```

- [ ] **Step 4: Run tests — verify all 9 pass**

```bash
npm test -- --run
```

Expected: `9 passed`

- [ ] **Step 5: Commit**

```bash
git add app/composables/useTimer.ts tests/composables/useTimer.spec.ts
git commit -m "feat: add useTimer composable with unit tests"
```

---

## Task 3: Refactor Timer.vue to use useTimer

**Files:**
- Modify: `app/components/Timer.vue`

**Interfaces:**
- Consumes: `useTimer()` from Task 2
- No interface changes visible to parent components — same props, same template behaviour

- [ ] **Step 1: Replace Timer.vue script block**

Replace the entire `<script>` block (lines 23–106) with:

```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{
  timerId: number
  palette?: { border: string; text: string; accent: string }
}>(), {
  palette: () => getColorPalette(0)
})

const { currentTime, minutes, seconds, interval, startTimer, stopTimer, resetTimer } = useTimer()

const paletteStyle = computed(() => ({
  '--ui-border': props.palette.border,
  '--ui-text': props.palette.text,
}))

const accentStyle = computed(() => ({
  color: props.palette.accent,
}))

function deleteTimer() {
  const nuxtApp = useNuxtApp()
  nuxtApp.callHook('app:timer:delete', props.timerId)
}
</script>
```

Note: `useTimer`, `getColorPalette`, `useNuxtApp`, and `computed` are all Nuxt auto-imports — no explicit import statements needed.

Also remove the stray `debugger` statement that was on the line after `startTimer`'s `if` block in the old script (it no longer exists, but double-check the final file has no `debugger` keyword).

- [ ] **Step 2: Start the dev server and verify the timer works**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Timer displays `50:00`
- Start, stop, reset buttons work
- +/− time buttons update the display
- Delete button removes the timer

- [ ] **Step 3: Stop the dev server and commit**

```bash
git add app/components/Timer.vue
git commit -m "refactor: Timer.vue to script setup using useTimer"
```

---

## Task 4: useTimerList composable + tests

**Files:**
- Create: `app/composables/useTimerList.ts`
- Create: `tests/composables/useTimerList.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  useTimerList(): {
    timers: Ref<Array<{ timerId: number; palette: { border: string; text: string; accent: string } }>>
    addTimer(): void
    removeTimer(timerId: number): void
  }
  ```

- [ ] **Step 1: Create the test file**

Create `tests/composables/useTimerList.spec.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useTimerList } from '../../app/composables/useTimerList'
import { colorPalettes } from '../../app/utils/colorPalettes.js'

describe('useTimerList', () => {
  let list: ReturnType<typeof useTimerList>

  beforeEach(() => {
    list = useTimerList()
  })

  it('starts with one timer at id 0 using the first palette', () => {
    expect(list.timers.value).toHaveLength(1)
    expect(list.timers.value[0].timerId).toBe(0)
    expect(list.timers.value[0].palette).toEqual(colorPalettes[0])
  })

  it('addTimer appends a new entry with an incrementing timerId', () => {
    list.addTimer()
    expect(list.timers.value).toHaveLength(2)
    expect(list.timers.value[1].timerId).toBe(1)
    expect(list.timers.value[1].palette).toEqual(colorPalettes[1])
  })

  it('addTimer cycles palette back to index 0 after 6 entries', () => {
    for (let i = 0; i < 6; i++) list.addTimer()
    // 7 timers total (ids 0–6); timerId 6 → getColorPalette(6) → 6 % 6 = 0
    expect(list.timers.value[6].palette).toEqual(colorPalettes[0])
  })

  it('removeTimer splices the entry with the matching timerId', () => {
    list.addTimer() // timerId 1
    list.addTimer() // timerId 2
    list.removeTimer(1)
    expect(list.timers.value).toHaveLength(2)
    expect(list.timers.value.find(t => t.timerId === 1)).toBeUndefined()
  })

  it('removeTimer no-ops when timerId does not exist', () => {
    list.removeTimer(999)
    expect(list.timers.value).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests — verify new tests fail with import error**

```bash
npm test -- --run
```

Expected: previous 9 pass, new 5 fail with `Cannot find module '../../app/composables/useTimerList'`

- [ ] **Step 3: Create app/composables/useTimerList.ts**

```ts
import { ref } from 'vue'
import { getColorPalette } from '../utils/colorPalettes.js'

export function useTimerList() {
  let nextId = 1

  const timers = ref([
    { timerId: 0, palette: getColorPalette(0) }
  ])

  function addTimer() {
    timers.value.push({ timerId: nextId, palette: getColorPalette(nextId) })
    nextId++
  }

  function removeTimer(timerId: number) {
    const index = timers.value.findIndex(t => t.timerId === timerId)
    if (index !== -1) timers.value.splice(index, 1)
  }

  return { timers, addTimer, removeTimer }
}
```

- [ ] **Step 4: Run all tests — verify all 14 pass**

```bash
npm test -- --run
```

Expected: `14 passed`

- [ ] **Step 5: Commit**

```bash
git add app/composables/useTimerList.ts tests/composables/useTimerList.spec.ts
git commit -m "feat: add useTimerList composable with unit tests"
```

---

## Task 5: Refactor index.vue to use useTimerList

**Files:**
- Modify: `app/pages/index.vue`

**Interfaces:**
- Consumes: `useTimerList()` from Task 4
- No interface changes visible to parent components

- [ ] **Step 1: Replace index.vue script block**

Replace the entire `<script>` block (lines 7–48) with:

```vue
<script setup lang="ts">
const { timers, addTimer, removeTimer } = useTimerList()

const nuxtApp = useNuxtApp()
nuxtApp.hook('app:timer:add', () => addTimer())
nuxtApp.hook('app:timer:delete', (timerId: number) => removeTimer(timerId))
</script>
```

Note: `useTimerList` and `useNuxtApp` are Nuxt auto-imports — no explicit import statements needed.

- [ ] **Step 2: Start the dev server and verify add/remove timer works**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- The "+" button in the header adds a new timer
- The delete button on each timer removes it
- Multiple timers can run independently

- [ ] **Step 3: Stop the dev server and run the full test suite one final time**

```bash
npm test -- --run
```

Expected: `14 passed`, 0 failed.

- [ ] **Step 4: Commit**

```bash
git add app/pages/index.vue
git commit -m "refactor: index.vue to script setup using useTimerList"
```
