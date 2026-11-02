<script setup lang="ts">
import { meta } from '@/data'
</script>

<template>
  <footer class="border-t border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-[#0b0d11]/60">
    <div class="page py-8">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div class="max-w-md">
          <div class="flex items-center gap-2">
            <span class="grid h-7 w-7 place-items-center rounded-md bg-brand-600 text-sm font-bold text-white">陕</span>
            <span class="text-sm font-semibold">陕西公考岗位库</span>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {{ meta.disclaimer }}
          </p>
        </div>
        <div class="flex gap-10 text-xs">
          <div>
            <p class="mb-2 font-semibold text-slate-700 dark:text-slate-200">快速导航</p>
            <ul class="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><router-link to="/" class="hover:text-brand-600">岗位列表</router-link></li>
              <li><router-link to="/timeline" class="hover:text-brand-600">考试时间线</router-link></li>
              <li><router-link to="/favorites" class="hover:text-brand-600">我的收藏</router-link></li>
            </ul>
          </div>
          <div>
            <p class="mb-2 font-semibold text-slate-700 dark:text-slate-200">官方渠道</p>
            <ul class="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>
                <a :href="meta.announcementUrl" target="_blank" rel="noopener" class="hover:text-brand-600">陕西人事考试网 ↗</a>
              </li>
              <li class="text-slate-400 dark:text-slate-500">数据更新：{{ meta.updatedAt }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="mt-6 flex flex-col gap-1 border-t border-slate-200 pt-4 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:flex-row sm:justify-between">
        <span>© {{ new Date().getFullYear() }} 陕西公考岗位库 · 备考信息汇总</span>
        <span>本平台不涉及任何商业服务，信息仅供参考</span>
      </div>
    </div>
  </footer>
</template>
