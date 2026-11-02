<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORIES, CITIES, EDUCATIONS, MAJORS, ORGS, POLITICAL } from '@/data'
import type { FilterState } from '@/composables/useFilters'

const props = defineProps<{ state: FilterState }>()
const emit = defineEmits<{ change: []; reset: [] }>()

const activeCount = computed(() => {
  const s = props.state
  return [s.city, s.org, s.major, s.edu, s.political, s.category, s.grassroots, s.fresh].filter(Boolean).length
})

function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
  props.state[key] = value
  emit('change')
}

const grassrootsOptions = [
  { value: '', label: '不限' },
  { value: 'none', label: '无基层要求' },
  { value: 'has', label: '需基层经历' },
] as const
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="flex items-center gap-1.5 text-sm font-semibold">
        <svg class="h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M3 5h18M6 12h12M10 19h4" stroke-linecap="round" />
        </svg>
        筛选条件
      </h2>
      <button
        v-if="activeCount > 0"
        type="button"
        class="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300"
        @click="emit('reset')"
      >
        重置{{ activeCount ? `(${activeCount})` : '' }}
      </button>
    </div>

    <div>
      <p class="label">地市</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          type="button"
          class="chip border transition"
          :class="
            !state.city
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
          "
          @click="set('city', '')"
        >
          全部
        </button>
        <button
          v-for="c in CITIES"
          :key="c"
          type="button"
          class="chip border transition"
          :class="
            state.city === c
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
          "
          @click="set('city', state.city === c ? '' : c)"
        >
          {{ c }}
        </button>
      </div>
    </div>

    <div>
      <p class="label">学历要求</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          type="button"
          class="chip border transition"
          :class="
            !state.edu
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
          "
          @click="set('edu', '')"
        >
          不限
        </button>
        <button
          v-for="e in EDUCATIONS"
          :key="e"
          type="button"
          class="chip border transition"
          :class="
            state.edu === e
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
          "
          @click="set('edu', state.edu === e ? '' : e)"
        >
          {{ e }}
        </button>
      </div>
    </div>

    <div>
      <p class="label">专业要求</p>
      <div class="max-h-56 space-y-0.5 overflow-y-auto pr-1">
        <label
          v-for="m in MAJORS"
          :key="m.name"
          class="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
          :class="state.major === m.name ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-slate-600 dark:text-slate-300'"
        >
          <span class="flex items-center gap-2">
            <input
              type="radio"
              class="h-3.5 w-3.5 accent-brand-600"
              :checked="state.major === m.name"
              @click="set('major', state.major === m.name ? '' : m.name)"
            />
            {{ m.name }}
          </span>
          <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ m.count }}</span>
        </label>
      </div>
    </div>

    <div>
      <p class="label">政治面貌</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="p in POLITICAL"
          :key="p"
          type="button"
          class="chip border transition"
          :class="
            state.political === p
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
          "
          @click="set('political', state.political === p ? '' : p)"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <div>
      <p class="label">职位类别</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="c in CATEGORIES"
          :key="c"
          type="button"
          class="chip border transition"
          :class="
            state.category === c
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
          "
          @click="set('category', state.category === c ? '' : c)"
        >
          {{ c }}
        </button>
      </div>
    </div>

    <div>
      <p class="label">基层工作经历</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="g in grassrootsOptions"
          :key="g.value"
          type="button"
          class="chip border transition"
          :class="
            state.grassroots === g.value
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
          "
          @click="set('grassroots', g.value)"
        >
          {{ g.label }}
        </button>
      </div>
    </div>

    <div>
      <p class="label">应届生</p>
      <label class="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <input type="checkbox" class="h-3.5 w-3.5 accent-brand-600" :checked="state.fresh === 'yes'" @change="set('fresh', state.fresh === 'yes' ? '' : 'yes')" />
        仅看限应届毕业生岗位
      </label>
    </div>

    <div>
      <label class="label" for="org-select">招录机关</label>
      <select id="org-select" class="field text-xs" :value="state.org" @change="set('org', ($event.target as HTMLSelectElement).value)">
        <option value="">全部机关（{{ ORGS.length }}）</option>
        <option v-for="o in ORGS" :key="o" :value="o">{{ o }}</option>
      </select>
    </div>
  </div>
</template>
