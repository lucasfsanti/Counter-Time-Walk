<template>
  <UApp>
    <UHeader>
      <template #left>
        <img src="~/assets/img/Counter_Just_Logo.png" alt="Counter Logo" class="h-15 w-auto"/>
      </template>
      <h1 class="w-auto shrink-0 text-xl">Time Walk</h1>
      <template #right>
        <UTooltip arrow text="Adicionar timer">
          <UButton icon="ic:round-add" variant="solid" @click="addTimer()" />
        </UTooltip>

        <UTooltip arrow :text="isSupported ? (isOpen ? 'Fechar picture-in-picture' : 'Picture-in-picture') : 'Requer Chrome ou Edge 116+'">
          <UButton
            icon="ic:round-picture-in-picture-alt"
            variant="solid"
            :disabled="!isSupported"
            @click="isOpen ? closePiP() : openPiP()"
          />
        </UTooltip>

        <UModal title="Atalhos de teclado">
          <UTooltip arrow text="Atalhos de teclado">
            <UButton icon="ic:round-keyboard" variant="solid" aria-label="Atalhos de teclado" />
          </UTooltip>

          <template #body>
            <dl class="text-sm space-y-2">
              <div class="flex items-center justify-between gap-4">
                <dt><kbd>espaço</kbd></dt>
                <dd class="text-neutral-400">iniciar/pausar timer selecionado</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt><kbd>r</kbd></dt>
                <dd class="text-neutral-400">reiniciar timer selecionado</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt><kbd>↑</kbd> / <kbd>↓</kbd></dt>
                <dd class="text-neutral-400">+30s / -30s no timer selecionado</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt><kbd>←</kbd> / <kbd>→</kbd></dt>
                <dd class="text-neutral-400">selecionar timer anterior/próximo</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt><kbd>1</kbd>-<kbd>9</kbd></dt>
                <dd class="text-neutral-400">selecionar o timer com esse número</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt><kbd>n</kbd></dt>
                <dd class="text-neutral-400">adicionar timer</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt><kbd>p</kbd></dt>
                <dd class="text-neutral-400">abrir/fechar picture-in-picture</dd>
              </div>
            </dl>
            <p class="text-xs text-neutral-500 mt-4">Passe o mouse sobre um timer, ou use as setas/números, para selecioná-lo.</p>
          </template>
        </UModal>

        <UColorModeButton color="primary" variant="solid" />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <div class="mt-2 flex items-center justify-center gap-1 text-xs text-neutral-400">
        <span class="font-semibold transition hover:text-white" href="https://github.com/lucasfsanti/Counter-Time-Walk" target="_blank">Time Walker v{{ config.public.version }}</span>
        - by
        <a class="font-semibold transition hover:text-white" href="https://github.com/lucasfsanti" target="_blank">Lucas Santiago</a>
        {{ currentYear }}
      </div>
    </UFooter>
  </UApp>
</template>

<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: (import.meta.env.NUXT_APP_BASE_URL ? import.meta.env.NUXT_APP_BASE_URL : '/') + 'favicon.png' }
  ],
  htmlAttrs: {
    lang: 'pt-br'
  },
})

const config = useRuntimeConfig()
const currentYear = new Date().getFullYear()

const { addTimer } = useTimerList()

const { isOpen, isSupported, openPiP, closePiP } = usePiP()

useKeyboardShortcuts()
</script>