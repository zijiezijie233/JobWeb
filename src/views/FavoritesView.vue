<script setup lang="ts">
import { computed } from 'vue'
import type { Position } from '@/types'
import { MAX_COMPARE, useFavorites } from '@/composables/useFavorites'

const {
  favoritePositions,
  comparePositions,
  compareIds,
  isCompared,
  toggleCompare,
  toggleFavorite,
  clearCompare,
  clearAll,
} = useFavorites()

const atLimit = computed(() => compareIds.value.length >= MAX_COMPARE)

type Row = { label: string; get: (p: Position) => string; strong?: (p: Position) => boolean }

const maxHeadcount = computed(() => Math.max(0, ...comparePositions.value.map((p) => p.headcount)))

const rows: Row[] = [
  { label: '招录机关', get: (p) => p.org },
  { label: '用人单位', get: (p) => p.unit },
  { label: '职位代码', get: (p) => p.code },
  { label: '地区', get: (p) => `${p.city} · ${p.county}` },
  { label: '招录人数', get: (p) => `${p.headcount} 人`, strong: (p) => p.headcount === maxHeadcount.value && maxHeadcount.value > 0 },
  { label: '职位类别', get: (p) => p.category },
  { label: '学历要求', get: (p) => p.education },
  { label: '学位要求', get: (p) => p.degree },
  { label: '专业要求', get: (p) => p.majorsRaw },
  { label: '政治面貌', get: (p) => p.political },
  { label: '基层经历', get: (p) => (p.grassrootsYears > 0 ? `${p.grassrootsYears} 年及以上` : '不限') },
  { label: '应届要求', get: (p) => (p.freshGrad ? '仅限应届' : '不限') },
  { label: '性别要求', get: (p) => p.gender },
  { label: '年龄要求', get: (p) => p.ageLimit },
]

function diffClass(key: string, p: Position): string {
  const same = comparePositions.value.every((o) => rows.find((r) => r.label === key)?.get(o) === rows.find((r) => r.label === key)?.get(p))
  return same ? '' : 'bg-amber-50/60 dark:bg-amber-500/5'
}
</script>

<template>
  <div class="page max-w-[1080px]">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-[28px]">我的收藏</h1>
        <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          共 {{ favoritePositions.length }} 个岗位 · 已选 {{ compareIds.length }}/{{ MAX_COMPARE }} 个用于对比
        </p>
      </div>
      <div v-if="favoritePositions.length" class="flex gap-2">
        <button type="button" class="btn-ghost" :disabled="!compareIds.length" @click="clearCompare">清空对比</button>
        <button type="button" class="btn-ghost" @click="clearAll">清空收藏</button>
      </div>
    </header>

    <template v-if="favoritePositions.length">
      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <article v-for="p in favoritePositions" :key="p.id" class="surface p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <router-link :to="`/position/${p.id}`" class="block truncate text-sm font-semibold hover:text-brand-700 dark:hover:text-brand-300">
                {{ p.name }}
              </router-link>
              <p class="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{{ p.org }} · {{ p.unit }}</p>
            </div>
            <span class="shrink-0 rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {{ p.headcount }} 人
            </span>
          </div>
          <div class="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
            <span class="tag">{{ p.city }} · {{ p.county }}</span>
            <span class="tag">{{ p.education }}</span>
            <span class="tag">{{ p.category }}</span>
          </div>
          <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <label class="flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                class="h-3.5 w-3.5 accent-brand-600"
                :checked="isCompared(p.id)"
                :disabled="!isCompared(p.id) && atLimit"
                @change="toggleCompare(p.id)"
              />
              加入对比
              <span v-if="!isCompared(p.id) && atLimit" class="text-amber-600 dark:text-amber-400">（已满）</span>
            </label>
            <button type="button" class="text-[11px] text-slate-400 transition hover:text-brand-600" @click="toggleFavorite(p.id)">
              取消收藏
            </button>
          </div>
        </article>
      </div>

      <!-- 对比区 -->
      <section class="mt-8">
        <div class="mb-3 flex items-end justify-between">
          <div>
            <h2 class="text-base font-semibold">岗位对比</h2>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">勾选 2-4 个收藏岗位，横向对比报考条件差异（不同项以浅黄底标记）。</p>
          </div>
        </div>

        <div v-if="comparePositions.length" class="surface overflow-x-auto">
          <table class="w-full min-w-[600px] border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800">
                <th class="sticky left-0 z-10 w-24 bg-slate-50/90 px-3 py-3 text-left font-medium text-slate-500 backdrop-blur dark:bg-[#181c23] dark:text-slate-400">
                  对比项
                </th>
                <th v-for="p in comparePositions" :key="p.id" class="min-w-[160px] px-3 py-3 text-left align-top">
                  <router-link :to="`/position/${p.id}`" class="line-clamp-2 font-semibold text-slate-800 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300">
                    {{ p.name }}
                  </router-link>
                  <button type="button" class="mt-1 text-[10px] text-slate-400 hover:text-brand-600" @click="toggleCompare(p.id)">移除</button>
                </th>
                <th v-if="comparePositions.length < 2" class="w-40 px-3 py-3 text-left align-top text-[11px] font-normal text-slate-400">
                  再勾选 1 个岗位即可对比
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.label" class="border-b border-slate-100 last:border-0 dark:border-slate-800/80">
                <th class="sticky left-0 z-10 bg-white px-3 py-2.5 text-left font-normal text-slate-500 dark:bg-[#14171d] dark:text-slate-400">
                  {{ row.label }}
                </th>
                <td
                  v-for="p in comparePositions"
                  :key="p.id"
                  class="px-3 py-2.5 align-top leading-5 text-slate-700 dark:text-slate-300"
                  :class="[comparePositions.length > 1 ? diffClass(row.label, p) : '', row.strong?.(p) ? 'font-semibold text-brand-700 dark:text-brand-300' : '']"
                >
                  {{ row.get(p) }}
                </td>
                <td v-if="comparePositions.length < 2" />
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="surface px-5 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          尚未选择对比岗位，请在上方卡片中勾选「加入对比」。
        </div>
      </section>
    </template>

    <div v-else class="mt-6">
      <div class="surface px-6 py-16 text-center">
        <div class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
            <path d="M12 20.5 4.8 13.7a4.9 4.9 0 0 1 0-7.1 5.2 5.2 0 0 1 7.2 0l.1.1.1-.1a5.2 5.2 0 0 1 7.2 0 4.9 4.9 0 0 1 0 7.1Z" />
          </svg>
        </div>
        <p class="mt-3 text-sm font-medium">还没有收藏任何岗位</p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">在岗位卡片右上角点击心形图标即可收藏，收藏数据保存在本机浏览器。</p>
        <router-link to="/" class="btn-primary mt-5">去挑选岗位</router-link>
      </div>
    </div>
  </div>
</template>
