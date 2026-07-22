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
</script>