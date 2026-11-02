<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { favCount } = useFavorites()
const { theme, toggleTheme } = useTheme()
const open = ref(false)

const navs = [
  { to: '/', label: '岗位信息', exact: true },
  { to: '/timeline', label: '考试时间线' },
  { to: '/favorites', label: '我的收藏' },
  { to: '/about', label: '关于' },
]

function isActive(to: string, exact?: boolean): boolean {
  return exact ? route.path === to : route.path.startsWith(to)
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-[#0d0f13]/85"
  >
    <div class="page flex h-14 items-center gap-3 sm:h-16">
      <router-link to="/" class="group flex items-center gap-2.5" @click="open = false">
        <span
          class="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-[15px] font-bold text-white shadow-sm transition group-hover:bg-brand-700 sm:h-9 sm:w-9"
          >陕</span
        >
        <span class="leading-tight">
          <span class="block text-[15px] font-semibold tracking-tight sm:text-base">陕西公考岗位库</span>
          <span class="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block"
            >公务员考试岗位与时间节点</span
          >
        </span>
      </router-link>

      <nav class="ml-6 hidden items-center gap-1 md:flex">
        <router-link
          v-for="nav in navs"
          :key="nav.to"
          :to="nav.to"
          class="relative rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="
            isActive(nav.to, nav.exact)
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
          "
        >
          {{ nav.label }}
          <span
            v-if="nav.to === '/favorites' && favCount > 0"
            class="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white"
            >{{ favCount }}</span
          >
        </router-link>
      </nav>

      <div class="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          class="btn-ghost !px-2.5"
          :aria-label="theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
          :title="theme === 'dark' ? '浅色模式' : '深色模式'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'dark'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" stroke-linecap="round" />
          </svg>
          <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z" stroke-linejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          class="btn-ghost !px-2.5 md:hidden"
          aria-label="打开菜单"
          :aria-expanded="open"
          @click="open = !open"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path v-if="!open" d="M4 7h16M4 12h16M4 17h16" />
            <path v-else d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="open" class="border-t border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-[#0d0f13] md:hidden">
        <router-link
          v-for="nav in navs"
          :key="nav.to"
          :to="nav.to"
          class="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium"
          :class="
            isActive(nav.to, nav.exact)
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
              : 'text-slate-700 dark:text-slate-200'
          "
          @click="open = false"
        >
          {{ nav.label }}
          <span v-if="nav.to === '/favorites' && favCount > 0" class="text-xs text-brand-600 dark:text-brand-300"
            >{{ favCount }} 个</span
          >
        </router-link>
      </div>
    </transition>
  </header>
</template>
