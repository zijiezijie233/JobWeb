import { computed, reactive, watch } from 'vue'
import type { Position } from '@/types'

const KEY = 'sn-gwy-viewstats-v1'

interface StoredStats {
  views: Record<string, number>
  updatedAt: string
}

function load(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as StoredStats | Record<string, number>
    const views = 'views' in parsed && parsed.views ? parsed.views : (parsed as Record<string, number>)
    const out: Record<string, number> = {}
    for (const [id, value] of Object.entries(views ?? {})) {
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) out[id] = Math.floor(value)
    }
    return out
  } catch {
    return {}
  }
}

/** 模块级状态：跨页面、跨路由保持，返回列表后计数不丢失 */
const extra = reactive<Record<string, number>>(load())

watch(
  extra,
  (value) => {
    try {
      const payload: StoredStats = {
        views: { ...value },
        updatedAt: new Date().toISOString().slice(0, 10),
      }
      localStorage.setItem(KEY, JSON.stringify(payload))
    } catch {
      /* 隐私模式下写入失败时静默忽略 */
    }
  },
  { deep: true },
)

export function useViewStats() {
  /** 岗位当前展示的浏览量 = 数据基准值 + 本地访问增量 */
  function viewCountOf(position: Position): number {
    return (position.viewCount ?? 0) + (extra[position.id] ?? 0)
  }

  /** 记录一次详情页访问，返回累加后的本地增量 */
  function recordView(id: string): number {
    if (!id) return 0
    extra[id] = (extra[id] ?? 0) + 1
    return extra[id]
  }

  /** 本地累计访问次数（不含数据基准值） */
  const localViews = computed(() => Object.values(extra).reduce((sum, v) => sum + v, 0))

  return { viewCountOf, recordView, localViews, extra }
}
