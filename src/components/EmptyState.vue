<script setup lang="ts">
defineProps<{ title: string; desc?: string }>()
</script>

<template>
  <div class="surface flex flex-col items-center justify-center px-6 py-14 text-center">
    <div class="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
      <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </div>
    <p class="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{{ title }}</p>
    <p v-if="desc" class="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">{{ desc }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
