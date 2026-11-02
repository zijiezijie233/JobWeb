<script setup lang="ts">
import { meta, STATS } from '@/data'
</script>

<template>
  <div class="page max-w-[820px]">
    <header>
      <h1 class="text-2xl font-bold tracking-tight sm:text-[28px]">关于本站</h1>
      <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        一个面向陕西省公务员考试考生的岗位信息汇总工具，专注「查得快、看得清、更新简单」。
      </p>
    </header>

    <section class="surface mt-5 p-5 sm:p-7">
      <h2 class="text-sm font-semibold">数据概况</h2>
      <dl class="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div class="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800/50">
          <dt class="text-slate-500 dark:text-slate-400">岗位数量</dt>
          <dd class="mt-1 text-lg font-semibold">{{ STATS.positionCount }}</dd>
        </div>
        <div class="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800/50">
          <dt class="text-slate-500 dark:text-slate-400">招录人数</dt>
          <dd class="mt-1 text-lg font-semibold text-brand-700 dark:text-brand-300">{{ STATS.headcount }}</dd>
        </div>
        <div class="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800/50">
          <dt class="text-slate-500 dark:text-slate-400">招录机关</dt>
          <dd class="mt-1 text-lg font-semibold">{{ STATS.orgCount }}</dd>
        </div>
        <div class="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800/50">
          <dt class="text-slate-500 dark:text-slate-400">最近更新</dt>
          <dd class="mt-1 text-sm font-semibold">{{ meta.updatedAt }}</dd>
        </div>
      </dl>
    </section>

    <section class="surface mt-4 p-5 sm:p-7">
      <h2 class="text-sm font-semibold">数据如何更新</h2>
      <p class="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
        岗位数据与时间线均为独立 JSON 文件，更新数据不需要改动页面代码。任选一种方式：
      </p>
      <div class="mt-3 space-y-3">
        <div class="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p class="text-xs font-semibold">方式一 · 直接编辑 JSON</p>
          <p class="mt-1.5 text-[11px] leading-6 text-slate-500 dark:text-slate-400">
            编辑 <code class="rounded bg-slate-100 px-1 py-0.5 font-mono dark:bg-slate-800">src/data/positions.json</code>（岗位）与
            <code class="rounded bg-slate-100 px-1 py-0.5 font-mono dark:bg-slate-800">src/data/timelines.json</code>（时间线），保存后刷新页面即可看到变化。
          </p>
        </div>
        <div class="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p class="text-xs font-semibold">方式二 · 从官方职位表导入</p>
          <p class="mt-1.5 text-[11px] leading-6 text-slate-500 dark:text-slate-400">下载官方 xlsx 职位表后执行：</p>
          <pre class="mt-2 overflow-x-auto rounded-md bg-slate-900 px-3 py-2.5 text-[11px] leading-5 text-slate-100"><code>npm run import:excel -- "C:/path/职位表.xlsx"</code></pre>
          <p class="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            脚本会自动识别表头、映射字段、清洗数据并写入 positions.json，输出校验报告。
          </p>
        </div>
      </div>
    </section>

    <section class="surface mt-4 p-5 sm:p-7">
      <h2 class="text-sm font-semibold">进面分与浏览数据</h2>
      <dl class="mt-3 space-y-2.5 text-xs">
        <div class="flex items-start justify-between gap-4">
          <dt class="shrink-0 text-slate-500 dark:text-slate-400">进面分口径</dt>
          <dd class="text-right leading-6 text-slate-700 dark:text-slate-300">{{ meta.scoreMeta.caliber }}</dd>
        </div>
        <div class="flex items-start justify-between gap-4">
          <dt class="shrink-0 text-slate-500 dark:text-slate-400">覆盖年度</dt>
          <dd class="text-right text-slate-700 dark:text-slate-300">{{ meta.scoreMeta.coverage }}</dd>
        </div>
        <div class="flex items-start justify-between gap-4">
          <dt class="shrink-0 text-slate-500 dark:text-slate-400">进面分来源</dt>
          <dd class="text-right leading-6 text-slate-700 dark:text-slate-300">{{ meta.scoreMeta.sourceName }}</dd>
        </div>
        <div class="flex items-start justify-between gap-4">
          <dt class="shrink-0 text-slate-500 dark:text-slate-400">采集时间</dt>
          <dd class="text-right text-slate-700 dark:text-slate-300">{{ meta.scoreMeta.collectedAt }}</dd>
        </div>
        <div class="flex items-start justify-between gap-4">
          <dt class="shrink-0 text-slate-500 dark:text-slate-400">浏览量口径</dt>
          <dd class="text-right leading-6 text-slate-700 dark:text-slate-300">{{ meta.viewMeta.label }}</dd>
        </div>
      </dl>
      <p class="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-[11px] leading-6 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        {{ meta.scoreMeta.note }}
        <br />{{ meta.viewMeta.note }}
      </p>
    </section>

    <section class="surface mt-4 p-5 sm:p-7">
      <h2 class="text-sm font-semibold">免责声明</h2>
      <p class="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">{{ meta.disclaimer }}</p>
      <p class="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-300">
        本站不提供任何付费服务，不收集个人报考信息，收藏与对比数据仅保存在你自己的浏览器本地存储中。
      </p>
      <a :href="meta.announcementUrl" target="_blank" rel="noopener" class="btn-ghost mt-4">
        前往 {{ meta.sourceName }} ↗
      </a>
    </section>
  </div>
</template>
