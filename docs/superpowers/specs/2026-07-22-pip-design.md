# Picture-in-Picture Timer View

**Date:** 2026-07-22  
**Status:** Approved

## Goal

Add a PiP button to the header that opens a floating always-on-top window showing all active timers. Both the main window and the PiP window are fully interactive — controls in either window affect the same shared timer state.

## Browser Support

Requires the Document Picture-in-Picture API (`window.documentPictureInPicture`), available in Chrome 116+ and Edge 116+. Firefox and Safari are not supported. The button is shown disabled with an explanatory tooltip on unsupported browsers.

## State Architecture

### Problem

`useTimer()` currently creates `currentTime` and `interval` as component-local refs inside each `Timer.vue`. A PiP window cannot share component-local state.

### Solution: lift runtime state into the `useTimerList` singleton

`useTimerList` becomes a module-level singleton (all refs hoisted to module scope). The `TimerEntry` type gains two runtime fields:

```ts
interface TimerEntry {
  timerId: number
  palette: ColorPalette
  currentTime: number
  interval: ReturnType<typeof setInterval> | null
}
```

`useTimer` becomes `useTimer(timerId: number)`. It looks up the entry in the singleton and returns:
- Computed `minutes` and `seconds` derived from `entry.currentTime`
- A `watch` that auto-stops the timer when `currentTime` reaches 0
- `startTimer`, `stopTimer`, `resetTimer` that mutate `entry.currentTime` and `entry.interval`

`Timer.vue` changes one line: `useTimer()` → `useTimer(props.timerId)`.

The Nuxt hook for delete (`app:timer:delete`) is removed. `Timer.vue` calls `useTimerList().removeTimer(timerId)` directly, which is safe now that `useTimerList` is a singleton.

## `usePiP` Composable

New file: `app/composables/usePiP.ts`

Module-level singleton managing one PiP window at a time:

```ts
const pipWindow = shallowRef<Window | null>(null)
const isOpen = computed(() => pipWindow.value !== null)
```

**`openPiP()`:**
1. Calls `window.documentPictureInPicture.requestWindow({ width: 480, height: 320 })`
2. Copies all `<link rel="stylesheet">` and `<style>` elements from the main document into `pip.document.head` (transfers clockicons font + Nuxt UI CSS variables)
3. Copies `document.documentElement.className` to `pip.document.documentElement` (preserves dark mode)
4. Creates a mount div, calls `createApp(PiPView).mount(div)`
5. Listens to `pip.addEventListener('pagehide', ...)` to clear `pipWindow` when the user closes the float natively

**`closePiP()`:** calls `pipWindow.value.close()` and nulls the ref.

## PiP Content

New file: `app/components/PiPView.vue`

Root component mounted into the PiP document. Reads `timers` from `useTimerList()` singleton and renders a wrapped grid of `Timer` components. Passes `:show-delete="false"` to suppress the delete button in PiP context.

`Timer.vue` gains an optional `showDelete` prop (default `true`). The delete `UButton` is wrapped in `v-if="showDelete"`. All other controls (play, pause, reset, +/- time) remain and work because they mutate shared singleton state — a click in PiP is immediately reflected in the main window.

## UI Button

Location: `app/app.vue`, `#right` slot of `UHeader`, between the add-timer button and `UColorModeButton`.

```
[ + ]  [ PiP ]  [ 🌙 ]
```

- Icon: `material-symbols:picture-in-picture-2`
- Tooltip (supported, closed): "Picture-in-picture"
- Tooltip (supported, open): "Fechar picture-in-picture"
- Tooltip (unsupported): "Requer Chrome ou Edge 116+"
- Disabled when `!('documentPictureInPicture' in window)`
- Click toggles: `isOpen ? closePiP() : openPiP()`

`isPiPSupported` is a computed property in `app.vue` checking `'documentPictureInPicture' in window`.

## Files Changed

| File | Change |
|------|--------|
| `app/composables/useTimerList.ts` | Hoist to module singleton; add `currentTime`/`interval` to `TimerEntry`; remove delete hook |
| `app/composables/useTimer.ts` | Accept `timerId` param; read/write from singleton entry |
| `app/composables/usePiP.ts` | **New** — PiP window lifecycle |
| `app/components/Timer.vue` | `useTimer(props.timerId)`; add `showDelete` prop; direct `removeTimer` call |
| `app/components/PiPView.vue` | **New** — PiP root component |
| `app/app.vue` | Add PiP toggle button + `isPiPSupported` computed |
