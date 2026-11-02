<script setup lang="ts">
import { computed, ref } from 'vue'
import { meta, timelines } from '@/data'
import type { TimelineEvent } from '@/types'
import { countdownLabel, dateRange, daysFromToday, parseDate, shortDate, statusOf, weekday } from '@/utils/format'

const year = ref(timelines[0]?.year ?? new Date().getFullYear())
const cycle = computed(() => timelines.find((c) => c.year === year.value) ?? timelines[0])

const events = computed<TimelineEvent[]>(() =>
  cycle.value
    ? cycle.value.events.slice().sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime())
    : [],
)

const activeEvent = computed(() => events.value.find((e) => statusOf(e.startDate, e.endDate) === 'active'))
const nextEvent = computed(() => events.value.find((e) => statusOf(e.startDate, e.endDate) === 'upcoming'))
const doneCount = computed(() => events.value.filter((e) => statusOf(e.startDate, e.endDate) === 'done').length)
const progress = computed(() => (events.value.length ? Math.round((doneCount.value / events.value.length) * 100) : 0))

const stageBadge: Record<string, string> = {
  done: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  active: 'bg-brand-600 text-white',
  upcoming: 'border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400',
}
const stageText: Record<string, string> = { done: '已完成', active: '进行中', upcoming: '未开始' }
</script>

<template>
  <div class="page max-w-[900px]">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-[28px]">考试时间线</h1>
        <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          从公告发布到公示录用的完整流程节点，状态按日期自动更新。
        </p>
      </div>
      <div class="flex overflow-hidden rounded-lg border border-slate-200 bg-white text-xs dark:border-slate-700 dark:bg-transparent">
        <button
          v-for="c in timelines"
          :key="c.year"
          type="button"
          class="px-3 py-1.5 font-medium transition"
          :class="year === c.year ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'"
          @click="year = c.year"
        >
          {{ c.year }} 年度
        </button>
      </div>
    </header>

    <template v-if="cycle">
      <!-- 概览 -->
      <section class="surface mt-4 overflow-hidden">
        <div class="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="chip bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{{ cycle.year }} 年度</span>
              <span v-if="activeEvent" class="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span class="mr-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />{{ activeEvent.stage }}进行中
              </span>
              <span v-if="events.some((e) => e.estimated)" class="tag">部分节点为预估</span>
            </div>
            <h2 class="mt-2 text-base font-semibold sm:text-lg">{{ cycle.name }}</h2>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              <template v-if="nextEvent">
                下一节点：{{ nextEvent.stage }} · {{ dateRange(nextEvent.startDate, nextEvent.endDate) }}
                <span class="ml-1 font-medium text-brand-600 dark:text-brand-300">（{{ countdownLabel(nextEvent.startDate) }}）</span>
              </template>
              <template v-else>本年度流程已全部结束，可切换至其他年度查看。</template>
            </p>
          </div>
          <div class="sm:w-40">
            <div class="flex items-baseline justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>流程进度</span>
              <span class="font-semibold text-slate-800 dark:text-slate-100">{{ doneCount }}/{{ events.length }}</span>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div class="h-full rounded-full bg-brand-600 transition-all duration-500" :style="{ width: `${progress}%` }" />
            </div>
          </div>
        </div>
      </section>

      <!-- 时间轴 -->
      <ol class="relative mt-6">
        <div class="absolute bottom-6 left-3 top-4 w-px -translate-x-1/2 bg-slate-300 dark:bg-slate-700 sm:left-[124px]" aria-hidden="true" />
        <li
          v-for="event in events"
          :key="event.id"
          class="relative grid grid-cols-[24px_minmax(0,1fr)] gap-3 py-2.5 sm:grid-cols-[112px_24px_minmax(0,1fr)] sm:gap-4"
        >
          <div class="hidden pt-3 text-right sm:block">
            <p class="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">{{ shortDate(event.startDate) }}</p>
            <p class="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              {{ weekday(event.startDate) }}
              <template v-if="event.endDate && event.endDate !== event.startDate"> - {{ shortDate(event.endDate) }}</template>
            </p>
          </div>

          <div class="relative flex justify-center">
            <span
              class="mt-[18px] block h-3 w-3 rounded-full ring-4 transition"
              :class="{
                'bg-slate-300 ring-[#f5f5f6] dark:bg-slate-600 dark:ring-[#0d0f13]': statusOf(event.startDate, event.endDate) === 'done',
                'bg-brand-600 ring-brand-500/15': statusOf(event.startDate, event.endDate) === 'active',
                'border-2 border-slate-300 bg-white ring-[#f5f5f6] dark:border-slate-600 dark:bg-[#14171d] dark:ring-[#0d0f13]':
                  statusOf(event.startDate, event.endDate) === 'upcoming',
              }"
            />
          </div>

          <div
            class="surface p-4 transition sm:p-5"
            :class="{
              'opacity-80': statusOf(event.startDate, event.endDate) === 'done',
              'ring-1 ring-brand-500/30': statusOf(event.startDate, event.endDate) === 'active',
            }"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold" :class="statusOf(event.startDate, event.endDate) === 'done' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-50'">
                {{ event.stage }}
              </span>
              <span class="chip" :class="stageBadge[statusOf(event.startDate, event.endDate)]">{{ stageText[statusOf(event.startDate, event.endDate)] }}</span>
              <span v-if="event.estimated" class="chip border border-dashed border-amber-300 text-amber-700 dark:border-amber-500/40 dark:text-amber-300">预估</span>
              <span class="ml-auto font-mono text-[11px] text-slate-400 sm:hidden">{{ shortDate(event.startDate) }}</span>
            </div>
            <p class="mt-1.5 text-sm text-slate-700 dark:text-slate-200">{{ event.title }}</p>
            <p class="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">{{ event.note }}</p>
            <p class="mt-2 text-[11px] text-slate-400 dark:text-slate-500 sm:hidden">
              {{ dateRange(event.startDate, event.endDate) }}
            </p>
            <p
              v-if="statusOf(event.startDate, event.endDate) === 'upcoming' && daysFromToday(event.startDate) >= 0"
              class="mt-2 hidden text-[11px] font-medium text-brand-600 dark:text-brand-300 sm:block"
            >
              距开始 {{ countdownLabel(event.startDate) }}
            </p>
          </div>
        </li>
      </ol>

      <div class="mt-6 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400">
        以上节点依据往年招录节奏整理，标有「预估」的日期为推算值。请以
        <a :href="cycle.announcementUrl" target="_blank" rel="noopener" class="link-underline text-brand-600 dark:text-brand-300">陕西人事考试网</a>
        正式公告为准。{{ meta.disclaimer }}
      </div>
    </template>
  </div>
</template>
