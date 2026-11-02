<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { meta, positions, STATS } from '@/data'
import { applyFilters, applySort, defaultState, PAGE_SIZE, useFilterState } from '@/composables/useFilters'
import type { FilterState } from '@/composables/useFilters'
import FilterPanel from '@/components/FilterPanel.vue'
import PositionCard from '@/components/PositionCard.vue'
import PositionTable from '@/components/PositionTable.vue'
import EmptyState from '@/components/EmptyState.vue'

const state = useFilterState()
const filterOpen = ref(false)

const filtered = computed(() => applyFilters(positions, state as FilterState))
const sorted = computed(() => applySort(filtered.value, state.sort))
const total = computed(() => filtered.value.length)
const totalHeadcount = computed(() => filtered.value.reduce((sum, p) => sum + p.headcount, 0))
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pageItems = computed(() =>
  sorted.value.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE),
)

watch(totalPages, (tp) => {
  if (state.page > tp) state.page = tp
})

const pageList = computed<(number | '…')[]>(() => {
  const tp = totalPages.value
  const cur = state.page
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const set = new Set<number>([1, tp, cur, cur - 1, cur + 1])
  if (cur <= 3) [2, 3, 4].forEach((n) => set.add(n))
  if (cur >= tp - 2) [tp - 3, tp - 2, tp - 1].forEach((n) => set.add(n))
  const nums = Array.from(set)
    .filter((n) => n >= 1 && n <= tp)
    .sort((a, b) => a - b)
  const out: (number | '…')[] = []
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('…')
    out.push(n)
  })
  return out
})

const activeTags = computed(() => {
  const s = state as FilterState
  const tags: { key: keyof FilterState; label: string; value: string }[] = []
  if (s.q.trim()) tags.push({ key: 'q', label: `关键词：${s.q.trim()}`, value: s.q })
  if (s.city) tags.push({ key: 'city', label: `地市：${s.city}`, value: s.city })
  if (s.org) tags.push({ key: 'org', label: `机关：${s.org}`, value: s.org })
  if (s.major) tags.push({ key: 'major', label: `专业：${s.major}`, value: s.major })
  if (s.edu) tags.push({ key: 'edu', label: `学历：${s.edu}`, value: s.edu })
  if (s.political) tags.push({ key: 'political', label: `政治面貌：${s.political}`, value: s.political })
  if (s.category) tags.push({ key: 'category', label: `类别：${s.category}`, value: s.category })
  if (s.grassroots) tags.push({ key: 'grassroots', label: s.grassroots === 'none' ? '无基层要求' : '需基层经历', value: s.grassroots })
  if (s.fresh) tags.push({ key: 'fresh', label: '限应届', value: s.fresh })
  return tags
})

function removeTag(key: keyof FilterState) {
  ;(state as Record<string, unknown>)[key] = ''
  state.page = 1
}

function resetAll() {
  Object.assign(state, defaultState(), { view: state.view })
}

function onFilterChange() {
  state.page = 1
}

function goPage(n: number) {
  state.page = n
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="page">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-6 shadow-card dark:border-slate-800 dark:bg-[#14171d] sm:px-8 sm:py-8">
      <div class="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
      <div class="relative">
        <div class="flex flex-wrap items-center gap-2">
          <span class="chip bg-brand-600 text-white">{{ meta.currentYear }} 年度</span>
          <span class="tag">职位表数据 · 示例</span>
          <span class="text-xs text-slate-400 dark:text-slate-500">更新于 {{ meta.updatedAt }}</span>
        </div>
        <h1 class="mt-3 text-2xl font-bold tracking-tight sm:text-[30px]">陕西省公务员考试岗位库</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          汇总全省各层级招录岗位，支持按地市、招录机关、专业、学历、政治面貌等条件组合筛选，快速定位可报考职位。
        </p>

        <dl class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-slate-200 text-center dark:bg-slate-800 sm:grid-cols-4">
          <div class="bg-white px-3 py-3.5 dark:bg-[#14171d]">
            <dt class="text-[11px] text-slate-500 dark:text-slate-400">招录岗位</dt>
            <dd class="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              {{ STATS.positionCount }}<span class="ml-0.5 text-xs font-normal text-slate-400">个</span>
            </dd>
          </div>
          <div class="bg-white px-3 py-3.5 dark:bg-[#14171d]">
            <dt class="text-[11px] text-slate-500 dark:text-slate-400">计划招录</dt>
            <dd class="mt-1 text-xl font-semibold text-brand-700 dark:text-brand-300">
              {{ STATS.headcount }}<span class="ml-0.5 text-xs font-normal text-slate-400">人</span>
            </dd>
          </div>
          <div class="bg-white px-3 py-3.5 dark:bg-[#14171d]">
            <dt class="text-[11px] text-slate-500 dark:text-slate-400">覆盖地市</dt>
            <dd class="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              {{ STATS.cityCount }}<span class="ml-0.5 text-xs font-normal text-slate-400">个</span>
            </dd>
          </div>
          <div class="bg-white px-3 py-3.5 dark:bg-[#14171d]">
            <dt class="text-[11px] text-slate-500 dark:text-slate-400">应届专属岗</dt>
            <dd class="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
              {{ STATS.freshGradCount }}<span class="ml-0.5 text-xs font-normal text-slate-400">个</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- 搜索与工具条 -->
    <div class="sticky top-14 z-30 -mx-4 mt-5 bg-[#f5f5f6]/90 px-4 py-2.5 backdrop-blur-md dark:bg-[#0d0f13]/90 sm:top-16 sm:mx-0 sm:rounded-xl sm:px-0">
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div class="relative w-full sm:min-w-0 sm:flex-1">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            v-model="state.q"
            type="search"
            class="field !pl-9 !pr-9"
            placeholder="搜索职位名称、单位、职位代码、专业…"
            aria-label="搜索岗位"
            @input="state.page = 1"
          />
          <button
            v-if="state.q"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="清空搜索"
            @click="state.q = ''; state.page = 1"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div class="flex items-center gap-2 sm:contents">
        <select v-model="state.sort" class="field min-w-0 flex-1 !w-auto text-xs sm:flex-none" aria-label="排序方式" @change="state.page = 1">
          <option value="default">默认排序</option>
          <option value="headcount">招录人数优先</option>
          <option value="city">按地市</option>
          <option value="unit">按单位名称</option>
        </select>

        <div class="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            class="px-2.5 py-2 text-xs font-medium transition"
            :class="state.view === 'card' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-transparent dark:text-slate-300'"
            aria-label="卡片视图"
            @click="state.view = 'card'"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
          </button>
          <button
            type="button"
            class="px-2.5 py-2 text-xs font-medium transition"
            :class="state.view === 'table' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-transparent dark:text-slate-300'"
            aria-label="表格视图"
            @click="state.view = 'table'"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" /></svg>
          </button>
        </div>

        <button type="button" class="btn-ghost lg:hidden" @click="filterOpen = true">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4" /></svg>
          筛选
          <span v-if="activeTags.length" class="ml-0.5 rounded bg-brand-600 px-1 text-[10px] text-white">{{ activeTags.length }}</span>
        </button>
        </div>
      </div>
    </div>

    <div class="mt-4 grid gap-5 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-6">
      <!-- 桌面侧栏 -->
      <aside class="hidden lg:block">
        <div class="surface sticky top-[7.5rem] max-h-[calc(100vh-9rem)] overflow-y-auto p-4">
          <FilterPanel :state="state as FilterState" @change="onFilterChange" @reset="resetAll" />
        </div>
      </aside>

      <section class="min-w-0">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              共 <span class="font-semibold text-slate-800 dark:text-slate-100">{{ total }}</span> 个岗位 ·
              招录 <span class="font-semibold text-brand-700 dark:text-brand-300">{{ totalHeadcount }}</span> 人
            </p>
            <span
              v-for="tag in activeTags"
              :key="tag.key"
              class="chip border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
            >
              {{ tag.label }}
              <button type="button" class="ml-0.5 hover:text-brand-900 dark:hover:text-white" :aria-label="`移除${tag.label}`" @click="removeTag(tag.key)">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </span>
            <button v-if="activeTags.length > 0" type="button" class="text-[11px] text-slate-400 underline-offset-2 hover:text-brand-600 hover:underline" @click="resetAll">
              清空全部
            </button>
          </div>
          <p v-if="total > 0" class="text-[11px] text-slate-400 dark:text-slate-500">
            第 {{ state.page }} / {{ totalPages }} 页
          </p>
        </div>

        <template v-if="total > 0">
          <div v-if="state.view === 'card'" class="grid gap-3.5 sm:grid-cols-2">
            <PositionCard v-for="p in pageItems" :key="p.id" :position="p" :keyword="state.q" />
          </div>
          <PositionTable v-else :positions="pageItems" />

          <nav v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-1" aria-label="分页">
            <button type="button" class="btn-ghost !px-2.5" :disabled="state.page === 1" aria-label="上一页" @click="goPage(state.page - 1)">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <template v-for="(item, i) in pageList" :key="`${item}-${i}`">
              <span v-if="item === '…'" class="px-1.5 text-xs text-slate-400">…</span>
              <button
                v-else
                type="button"
                class="min-w-[32px] rounded-lg px-2 py-1.5 text-xs font-medium transition"
                :class="item === state.page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800'"
                :aria-current="item === state.page ? 'page' : undefined"
                @click="goPage(item as number)"
              >
                {{ item }}
              </button>
            </template>
            <button type="button" class="btn-ghost !px-2.5" :disabled="state.page === totalPages" aria-label="下一页" @click="goPage(state.page + 1)">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </nav>
        </template>

        <EmptyState v-else title="没有符合条件的岗位" desc="试试放宽筛选条件，或清空关键词重新搜索。">
          <button type="button" class="btn-primary" @click="resetAll">清空筛选条件</button>
        </EmptyState>
      </section>
    </div>

    <!-- 移动端筛选抽屉 -->
    <transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="filterOpen" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="filterOpen = false" />
        <div class="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-pop dark:bg-[#14171d]">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-sm font-semibold">筛选岗位</span>
            <button type="button" class="rounded-lg p-1.5 text-slate-400" aria-label="关闭" @click="filterOpen = false">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <FilterPanel :state="state as FilterState" @change="onFilterChange" @reset="resetAll" />
          <div class="sticky bottom-0 mt-5 flex gap-2 bg-white pt-3 dark:bg-[#14171d]">
            <button type="button" class="btn-ghost flex-1" @click="resetAll">重置</button>
            <button type="button" class="btn-primary flex-1" @click="filterOpen = false">查看 {{ total }} 个岗位</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
