// Minimal stand-ins for the @nuxt/ui components used by app.vue and Timer.vue.
// The real components rely on Nuxt build-time aliases (#imports, #build/*) that
// don't exist outside a running Nuxt app, so component tests stub them out and
// focus on the logic our own code adds: class bindings, event wiring, slot
// content, and prop forwarding.
export const nuxtUiStubs = {
  UApp: { template: '<div><slot /></div>' },
  UHeader: { template: '<header><slot name="left" /><slot /><slot name="right" /></header>' },
  UMain: { template: '<main><slot /></main>' },
  UFooter: { template: '<footer><slot /></footer>' },
  USeparator: { template: '<hr />' },
  UColorModeButton: { template: '<button aria-label="Color mode" />' },
  UTooltip: { template: '<div><slot /></div>' },
  UButton: {
    props: ['label'],
    data() {
      return {
        ui: { leadingIcon: ({ class: c }: { class?: unknown } = {}) => (Array.isArray(c) ? c.filter(Boolean).join(' ') : c || '') },
      }
    },
    template: '<button><slot name="leading" :ui="ui" /><slot />{{ label }}</button>',
  },
  UIcon: { props: ['name'], template: '<i :data-icon="name" />' },
  UCard: { template: '<div><slot /></div>' },
  UModal: {
    props: ['title'],
    template: '<div><slot /><div data-testid="modal-title">{{ title }}</div><div data-testid="modal-body"><slot name="body" /></div></div>',
  },
  NuxtPage: { template: '<div />' },
}
