<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { findPosition, meta, positions } from '@/data'
import { useFavorites } from '@/composables/useFavorites'
import { useViewStats } from '@/composables/useViewStats'
import { formatViews } from '@/utils/format'
import EligibilityCheck from '@/components/EligibilityCheck.vue'
import ScoreHistory from '@/components/ScoreHistory.vue'

const route = useRoute()
const { isFavorite, toggleFavorite, isCompared, toggleCompare } = useFavorites()
const { viewCountOf, recordView } = useViewStats()

const position = computed(() => findPosition(String(route.params.id)))
const views = computed(() => (position.value ? viewCountOf(position.value) : 0))

/** 每次进入（或切换到）某个岗位详情页，浏览量 +1 */
watch(
  () => String(route.params.id ?? ''),
  (id) => {
    if (id) recordView(id)
  },
  { immediate: true },
)
const toast = ref('')

const fav = computed(() => (position.value ? isFavorite(position.value.id) : false))
const compared = computed(() => (position.value ? isCompared(position.value.id) : false))

const similar = computed(() => {
  if (!position.value) return []
  return positions
    .filter((p) => p.id !== position.value!.id && p.city === position.value!.city)
    .slice(0, 3)
})

const conditions = computed(() => {
  const p = position.value
  if (!p) return []
  return [
    { label: '学历要求', value: p.education },
    { label: '学位要求', value: p.degree },
    { label: '专业要求', value: p.majorsRaw },
    { label: '政治面貌', value: p.political },
    { label: '基层工作经历', value: p.grassrootsYears > 0 ? `${p.grassrootsYears} 年及以上` : '不限' },
    { label: '应届毕业生', value: p.freshGrad ? '仅限应届毕业生' : '不限' },
    { label: '性别要求', value: p.gender },
    { label: '年龄要求', value: p.ageLimit },
  ]
})

function flash(message: string) {
  toast.value = message
  window.setTimeout(() => (toast.value = ''), 2000)
}

function onFav() {
  if (!position.value) return
  flash(toggleFavorite(position.value.id) ? '已加入收藏' : '已取消收藏')
}

function onCompare() {
  if (!position.value) return
  const p = position.value
  if (!isFavorite(p.id)) toggleFavorite(p.id)
  const result = toggleCompare(p.id)
  const messages: Record<string, string> = {
    added: '已加入对比（最多 4 个）',
    removed: '已移出对比',
    full: '对比列表已满，请先在收藏页移除',
    'need-fav': '请先收藏该岗位',
  }
  flash(messages[result])
}
</script>

<template>
  <div class="page max-w-[1080px]">
    <router-link to="/" class="inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-brand-600 dark:text-slate-400">
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
      返回岗位列表
    </router-link>

    <template v-if="position">
      <!-- 标题区 -->
      <section class="surface mt-3 overflow-hidden">
        <div class="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7 sm:py-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="chip bg-brand-600 text-white">{{ position.category }}</span>
                <span class="font-mono text-[11px] text-slate-400 dark:text-slate-500">职位代码 {{ position.code }}</span>
              </div>
              <h1 class="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{{ position.name }}</h1>
              <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{{ position.org }} · {{ position.unit }}</p>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <span class="tag">{{ position.city }} · {{ position.county }}</span>
                <span class="tag">{{ position.education }}</span>
                <span class="tag">{{ position.degree }}</span>
                <span v-if="position.freshGrad" class="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">限应届</span>
                <span v-if="position.political !== '不限'" class="chip bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{{ position.political }}</span>
              </div>
            </div>

            <div class="flex flex-col items-end gap-3">
              <div class="rounded-xl bg-brand-50 px-4 py-2.5 text-center dark:bg-brand-500/10">
                <p class="text-[11px] text-brand-700/80 dark:text-brand-300/80">计划招录</p>
                <p class="text-2xl font-bold leading-tight text-brand-700 dark:text-brand-300">
                  {{ position.headcount }}<span class="ml-0.5 text-xs font-normal">人</span>
                </p>
                <p class="mt-1 border-t border-brand-200/70 pt-1 text-[11px] tabular-nums text-slate-500 dark:border-brand-500/30 dark:text-slate-400">
                  {{ formatViews(views) }}次浏览
                </p>
              </div>
              <div class="flex gap-2">
                <button type="button" class="btn-ghost" :class="fav ? '!border-brand-300 !text-brand-700 dark:!text-brand-300' : ''" @click="onFav">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" :fill="fav ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20.5 4.8 13.7a4.9 4.9 0 0 1 0-7.1 5.2 5.2 0 0 1 7.2 0l.1.1.1-.1a5.2 5.2 0 0 1 7.2 0 4.9 4.9 0 0 1 0 7.1Z" /></svg>
                  {{ fav ? '已收藏' : '收藏' }}
                </button>
                <button type="button" class="btn-primary" @click="onCompare">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h7M4 12h7M4 18h7M17 4v16M14 8l3-4 3 4" /></svg>
                  {{ compared ? '移出对比' : '加入对比' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="(c, i) in conditions" :key="c.label" class="border-b border-slate-100 px-5 py-3.5 dark:border-slate-800 sm:px-7" :class="i >= 3 ? 'lg:border-b' : ''">
            <p class="text-[11px] text-slate-400 dark:text-slate-500">{{ c.label }}</p>
            <p class="mt-0.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{{ c.value }}</p>
          </div>
        </div>
      </section>

      <EligibilityCheck :position="position" />

      <div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0 space-y-5">
          <section class="surface p-5 sm:p-6">
            <h2 class="flex items-center gap-2 text-sm font-semibold">
              <span class="h-3.5 w-1 rounded-full bg-brand-600" />职位简介
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{{ position.intro }}</p>
          </section>

          <ScoreHistory :position="position" />

          <section class="surface p-5 sm:p-6">
            <h2 class="flex items-center gap-2 text-sm font-semibold">
              <span class="h-3.5 w-1 rounded-full bg-brand-600" />其他报考条件
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{{ position.otherReq || '无' }}</p>
            <div class="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <span class="font-medium text-slate-600 dark:text-slate-300">备注：</span>{{ position.note || '无' }}
            </div>
          </section>

          <section class="surface p-5 sm:p-6">
            <h2 class="flex items-center gap-2 text-sm font-semibold">
              <span class="h-3.5 w-1 rounded-full bg-brand-600" />报考提示
            </h2>
            <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <li class="flex gap-2"><span class="text-brand-500">·</span>专业要求以毕业证书载明的专业名称为准，专业名称与职位要求不完全一致的，需提前与招录机关确认。</li>
              <li class="flex gap-2"><span class="text-brand-500">·</span>每人限报一个职位，报名信息通过资格初审后不可修改，请仔细核对。</li>
              <li class="flex gap-2"><span class="text-brand-500">·</span>报考公安、监狱戒毒等职位须通过体能测评，体检标准按人民警察职位特殊标准执行。</li>
            </ul>
          </section>
        </div>

        <aside class="space-y-4">
          <section class="surface p-5">
            <h2 class="text-sm font-semibold">咨询与来源</h2>
            <dl class="mt-3 space-y-2.5 text-xs">
              <div class="flex items-start justify-between gap-3">
                <dt class="text-slate-500 dark:text-slate-400">咨询电话</dt>
                <dd class="font-mono text-slate-800 dark:text-slate-200">{{ position.phone }}</dd>
              </div>
              <div class="flex items-start justify-between gap-3">
                <dt class="text-slate-500 dark:text-slate-400">数据更新</dt>
                <dd class="text-slate-800 dark:text-slate-200">{{ position.updatedAt }}</dd>
              </div>
              <div class="flex items-start justify-between gap-3">
                <dt class="text-slate-500 dark:text-slate-400">信息来源</dt>
                <dd><a :href="position.sourceUrl" target="_blank" rel="noopener" class="text-brand-600 hover:underline dark:text-brand-300">官方公告 ↗</a></dd>
              </div>
            </dl>
            <p class="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400 dark:border-slate-800 dark:text-slate-500">
              职位信息以{{ meta.sourceName }}正式发布为准。
            </p>
          </section>

          <section v-if="similar.length" class="surface p-5">
            <h2 class="text-sm font-semibold">{{ position.city }}其他岗位</h2>
            <ul class="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
              <li v-for="s in similar" :key="s.id">
                <router-link :to="`/position/${s.id}`" class="block py-2.5 transition hover:text-brand-600 dark:hover:text-brand-300">
                  <p class="truncate text-xs font-medium">{{ s.name }}</p>
                  <p class="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">{{ s.org }} · 招 {{ s.headcount }} 人</p>
                </router-link>
              </li>
            </ul>
            <router-link :to="`/?city=${position.city}`" class="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-300">
              查看该地市全部岗位
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </router-link>
          </section>
        </aside>
      </div>
    </template>

    <div v-else class="mt-6">
      <div class="surface px-6 py-16 text-center">
        <p class="text-sm font-medium">未找到该岗位</p>
        <p class="mt-1 text-xs text-slate-500">链接可能已失效，或岗位数据已更新。</p>
        <router-link to="/" class="btn-primary mt-5">返回岗位列表</router-link>
      </div>
    </div>

    <transition
      enter-active-class="transition duration-200"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div v-if="toast" class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-pop dark:bg-white dark:text-slate-900">
        {{ toast }}
      </div>
    </transition>
  </div>
</template>
