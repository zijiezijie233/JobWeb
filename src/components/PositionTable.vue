<script setup lang="ts">
import type { Position } from '@/types'
import { useFavorites } from '@/composables/useFavorites'

defineProps<{ positions: Position[] }>()
const { isFavorite, toggleFavorite } = useFavorites()
</script>

<template>
  <div class="surface overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/80 text-left text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <th class="px-4 py-3 font-medium">职位名称 / 单位</th>
            <th class="px-3 py-3 font-medium">地区</th>
            <th class="px-3 py-3 font-medium">学历</th>
            <th class="px-3 py-3 font-medium">专业要求</th>
            <th class="px-3 py-3 text-center font-medium">招录</th>
            <th class="px-3 py-3 text-center font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in positions"
            :key="p.id"
            class="border-b border-slate-100 transition last:border-0 hover:bg-brand-50/40 dark:border-slate-800/80 dark:hover:bg-brand-500/5"
          >
            <td class="px-4 py-3">
              <router-link :to="`/position/${p.id}`" class="font-medium text-slate-800 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300">
                {{ p.name }}
              </router-link>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{{ p.org }} · {{ p.unit }}</p>
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-xs text-slate-600 dark:text-slate-300">{{ p.city }} · {{ p.county }}</td>
            <td class="whitespace-nowrap px-3 py-3 text-xs text-slate-600 dark:text-slate-300">{{ p.education }}</td>
            <td class="max-w-[240px] px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
              <span class="line-clamp-2">{{ p.majorsRaw }}</span>
            </td>
            <td class="px-3 py-3 text-center font-semibold text-brand-700 dark:text-brand-300">{{ p.headcount }}</td>
            <td class="px-3 py-3">
              <div class="flex items-center justify-center gap-1">
                <router-link :to="`/position/${p.id}`" class="rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10">
                  详情
                </router-link>
                <button
                  type="button"
                  class="rounded-md p-1.5 transition"
                  :class="isFavorite(p.id) ? 'text-brand-600' : 'text-slate-300 hover:text-brand-500 dark:text-slate-600'"
                  :aria-label="isFavorite(p.id) ? '取消收藏' : '收藏'"
                  @click="toggleFavorite(p.id)"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" :fill="isFavorite(p.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
                    <path d="M12 20.5 4.8 13.7a4.9 4.9 0 0 1 0-7.1 5.2 5.2 0 0 1 7.2 0l.1.1.1-.1a5.2 5.2 0 0 1 7.2 0 4.9 4.9 0 0 1 0 7.1Z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
