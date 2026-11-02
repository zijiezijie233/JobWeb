<script setup lang="ts">
import { computed } from 'vue'
import type { Position } from '@/types'
import { useFavorites } from '@/composables/useFavorites'
import { highlight } from '@/utils/format'

const props = defineProps<{ position: Position; keyword?: string }>()
const { isFavorite, toggleFavorite } = useFavorites()

const fav = computed(() => isFavorite(props.position.id))
const nameParts = computed(() => highlight(props.position.name, props.keyword ?? ''))
const unitParts = computed(() => highlight(`${props.position.org} · ${props.position.unit}`, props.keyword ?? ''))
</script>

<template>
  <article
    class="surface group relative flex min-w-0 flex-col p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-pop dark:hover:border-brand-500/50 sm:p-5"
  >
    <div class="flex items-start gap-3">
      <router-link :to="`/position/${position.id}`" class="min-w-0 flex-1">
        <h3 class="truncate text-[15px] font-semibold leading-6 text-slate-900 group-hover:text-brand-700 dark:text-slate-50 dark:group-hover:text-brand-300">
          <template v-for="(part, i) in nameParts" :key="i">
            <mark v-if="part.hit" class="rounded bg-brand-100 px-0.5 text-brand-800 dark:bg-brand-500/25 dark:text-brand-200">{{ part.text }}</mark>
            <span v-else>{{ part.text }}</span>
          </template>
        </h3>
        <p class="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
          <template v-for="(part, i) in unitParts" :key="i">
            <mark v-if="part.hit" class="rounded bg-brand-100 px-0.5 text-brand-800 dark:bg-brand-500/25 dark:text-brand-200">{{ part.text }}</mark>
            <span v-else>{{ part.text }}</span>
          </template>
        </p>
      </router-link>

      <button
        type="button"
        class="shrink-0 rounded-lg p-1.5 transition"
        :class="fav ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 hover:text-brand-500 dark:text-slate-600'"
        :aria-label="fav ? '取消收藏' : '收藏岗位'"
        :title="fav ? '取消收藏' : '收藏岗位'"
        @click="toggleFavorite(position.id)"
      >
        <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" :fill="fav ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
          <path d="M12 20.5 4.8 13.7a4.9 4.9 0 0 1 0-7.1 5.2 5.2 0 0 1 7.2 0l.1.1.1-.1a5.2 5.2 0 0 1 7.2 0 4.9 4.9 0 0 1 0 7.1Z" />
        </svg>
      </button>
    </div>

    <div class="mt-3 flex flex-wrap gap-1.5">
      <span class="chip bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{{ position.city }} · {{ position.county }}</span>
      <span class="tag">{{ position.education }}</span>
      <span class="tag">{{ position.category }}</span>
      <span v-if="position.freshGrad" class="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">限应届</span>
      <span v-if="position.political !== '不限'" class="chip bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{{ position.political }}</span>
    </div>

    <p class="mt-3 line-clamp-2 break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400">
      专业：{{ position.majorsRaw }}
    </p>

    <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
      <div class="flex items-baseline gap-3">
        <span class="text-xs text-slate-400 dark:text-slate-500">招录</span>
        <span class="text-lg font-semibold leading-none text-brand-700 dark:text-brand-300">{{ position.headcount }}</span>
        <span class="text-xs text-slate-400 dark:text-slate-500">人</span>
        <span class="ml-1 font-mono text-[11px] text-slate-400 dark:text-slate-500">{{ position.code }}</span>
      </div>
      <router-link
        :to="`/position/${position.id}`"
        class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
      >
        查看详情
        <svg class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </router-link>
    </div>
  </article>
</template>
