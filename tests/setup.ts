import { vi } from 'vitest'

// Patch createApp so mount() silently no-ops when the target element is a plain
// object mock (e.g. in usePiP tests where pip.document.createElement returns {}).
// This lets tests assert on composable state without needing a real pip DOM tree.
vi.mock('vue', async (importOriginal) => {
  const original = await importOriginal<typeof import('vue')>()
  return {
    ...original,
    createApp: (...args: ConstructorParameters<never>) => {
      const app = (original.createApp as (...a: unknown[]) => unknown)(...args) as {
        mount: (el: unknown) => unknown
        [key: string]: unknown
      }
      const originalMount = app.mount.bind(app)
      app.mount = (el: unknown) => {
        if (el && typeof el === 'object' && typeof (el as Record<string, unknown>).insertBefore === 'function') {
          return originalMount(el)
        }
        return {}
      }
      return app
    },
  }
})
