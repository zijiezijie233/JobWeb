<script setup lang="ts">
import { computed } from 'vue'
import type { Position } from '@/types'
import { meta } from '@/data'
import { barHeights, scoreSummary, trendPoints } from '@/utils/scores'
import { deltaClass, formatDelta, formatScore, formatViews } from '@/utils/format'
import { useViewStats } from '@/composables/useViewStats'

const props = defineProps<{ position: Position }>()
const { viewCountOf } = useViewStats()

const rows = computed(() => trendPoints(props.position))
const heights = computed(() => barHeights(props.position))
const summary = computed(() => scoreSummary(props.position))
const views = computed(() => viewCountOf(props.position))

const missingNotes = computed(() => rows.value.filter((r) => r.value === null && r.remark))

const ratioLabel = computed(() => {
  const latest = summary.value.latest
  if (!latest?.interviewCount || !props.position.headcount) return '—'
  const ratio = latest.interviewCount / props.position.headcount
  const label = Number.isInteger(ratio) ? ratio.toFixed(0) : ratio.toFixed(1)
  return `${latest.interviewCount} 人（约 ${label}:1）`
})

function barClass(value: number | null, isLatest: boolean): string {
  if (value === null) return 'border border-dashed border-slate-300 bg-transparent dark:border-slate-700'
  return isLatest ? 'bg-brand-600' : 'bg-brand-500/35'
}
</script>

<template>
  <section class="surface p-5 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="flex items-center gap-2 text-sm font-semibold">
          <span class="h-3.5 w-1 rounded-full bg-brand-600" />历年进面分数
        </h2>
        <p class="mt-1.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
          统计口径：{{ meta.scoreMeta.caliber }} · 覆盖 {{ meta.scoreMeta.coverage }}
        </p>
      </div>
      <span class="chip shrink-0 border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
        {{ formatViews(views) }}次浏览
      </span>
    </div>

    <template v-if="summary.latest">
      <dl class="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-slate-200 text-center dark:bg-slate-800 sm:grid-cols-4">
        <div class="bg-white px-3 py-3 dark:bg-[#14171d]">
          <dt class="text-[11px] text-slate-500 dark:text-slate-400">{{ summary.latest.year }} 年度最低进面分</dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
            {{ formatScore(summary.latest.minScore) }}
          </dd>
        </div>
        <div class="bg-white px-3 py-3 dark:bg-[#14171d]">
          <dt class="text-[11px] text-slate-500 dark:text-slate-400">
            较 {{ summary.previous ? `${summary.previous.year} 年` : '上一年' }}
          </dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums" :class="deltaClass(summary.delta)">
            {{ formatDelta(summary.delta) }}
          </dd>
        </div>
        <div class="bg-white px-3 py-3 dark:bg-[#14171d]">
          <dt class="text-[11px] text-slate-500 dark:text-slate-400">近 {{ summary.count }} 年区间</dt>
          <dd class="mt-1 text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
            {{ formatScore(summary.min) }} – {{ formatScore(summary.max) }}
          </dd>
        </div>
        <div class="bg-white px-3 py-3 dark:bg-[#14171d]">
          <dt class="text-[11px] text-slate-500 dark:text-slate-400">{{ summary.latest.year }} 年面试入围</dt>
          <dd class="mt-1 text-sm font-semibold tabular-nums text-brand-700 dark:text-brand-300">{{ ratioLabel }}</dd>
        </div>
      </dl>

      <!-- 趋势柱 -->
      <div class="mt-4 rounded-xl border border-slate-100 px-3 py-4 dark:border-slate-800 sm:px-4">
        <p class="mb-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">最低进面分走势</p>
        <div class="flex h-28 items-stretch gap-2 sm:gap-3">
          <div v-for="(pt, i) in rows" :key="pt.year" class="flex min-w-0 flex-1 flex-col items-center">
            <span
              class="mb-1 text-[10px] font-medium tabular-nums"
              :class="pt.value === null ? 'text-slate-300 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'"
            >
              {{ pt.value === null ? '未公布' : formatScore(pt.value) }}
            </span>
            <div class="flex w-full flex-1 items-end">
              <div class="w-full rounded-t-md" :style="{ height: `${heights[i]}%` }" :class="barClass(pt.value, pt.isLatest)" />
            </div>
            <span class="mt-1.5 text-[10px] tabular-nums text-slate-400 dark:text-slate-500">{{ pt.year }}</span>
            <span
              v-if="pt.delta !== null"
              class="text-[10px] tabular-nums"
              :class="deltaClass(pt.delta)"
            >{{ formatDelta(pt.delta) }}</span>
            <span v-else-if="pt.value === null" class="text-[10px] text-slate-300 dark:text-slate-600">—</span>
          </div>
        </div>
      </div>

      <!-- 明细表 -->
      <div class="mt-4 overflow-x-auto">
        <table class="w-full min-w-[300px] border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-200 text-left text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th class="py-2 pr-2 font-medium sm:pr-3">考试年度</th>
              <th class="py-2 pr-2 text-right font-medium sm:pr-3">最低进面分</th>
              <th class="py-2 pr-2 text-right font-medium sm:pr-3">较上年</th>
              <th class="py-2 text-right font-medium sm:pr-3">进面人数</th>
              <th class="hidden py-2 font-medium sm:table-cell">数据说明</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pt in rows"
              :key="pt.year"
              class="border-b border-slate-100 last:border-0 dark:border-slate-800/80"
            >
              <td class="whitespace-nowrap py-2.5 pr-2 sm:pr-3">
                <span class="font-medium text-slate-700 dark:text-slate-200">{{ pt.year }}</span>
                <span v-if="pt.isLatest" class="chip ml-1.5 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">最新</span>
              </td>
              <td
                class="py-2.5 pr-2 text-right font-semibold tabular-nums sm:pr-3"
                :class="pt.value === null ? 'text-slate-300 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'"
              >
                {{ formatScore(pt.value) }}
              </td>
              <td class="py-2.5 pr-2 text-right tabular-nums sm:pr-3" :class="deltaClass(pt.delta)">
                <template v-if="pt.delta !== null">
                  {{ formatDelta(pt.delta) }}
                  <span v-if="pt.crossGap && pt.deltaYear" class="ml-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                    较 {{ pt.deltaYear }}
                  </span>
                </template>
                <span v-else class="text-slate-300 dark:text-slate-600">—</span>
              </td>
              <td class="py-2.5 pr-2 text-right tabular-nums text-slate-500 sm:pr-3 dark:text-slate-400">
                {{ pt.interviewCount ?? '—' }}
              </td>
              <td class="hidden py-2.5 text-[11px] text-slate-400 sm:table-cell dark:text-slate-500">
                {{ pt.remark || '按 1:3 比例确定面试人选' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul v-if="missingNotes.length" class="mt-2 space-y-1 sm:hidden">
        <li v-for="note in missingNotes" :key="note.year" class="text-[11px] leading-5 text-slate-400 dark:text-slate-500">
          {{ note.year }} 年：{{ note.remark }}
        </li>
      </ul>
    </template>

    <p v-else class="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
      该岗位暂无历年进面分记录，通常为新设职位或往年未单独公布分职位名单。
    </p>

    <p class="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400 dark:border-slate-800 dark:text-slate-500">
      数据来源：{{ meta.scoreMeta.sourceName }}；采集于 {{ meta.scoreMeta.collectedAt }}。{{ meta.scoreMeta.note }}
    </p>
    <p v-if="meta.currentYear > (summary.latest?.year ?? meta.currentYear)" class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
      {{ meta.currentYear }} 年度笔试尚未举行，最低进面分将在成绩公布后补充。
    </p>
  </section>
</template>
