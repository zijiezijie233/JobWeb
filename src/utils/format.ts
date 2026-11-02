const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** 2027-01-20 → 2027年1月20日 */
export function formatDate(value: string): string {
  if (!value) return '待公布'
  const d = parseDate(value)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/** 2027-01-20 → 01-20 */
export function shortDate(value: string): string {
  if (!value) return ''
  const d = parseDate(value)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function weekday(value: string): string {
  if (!value) return ''
  return WEEKDAYS[parseDate(value).getDay()]
}

export function dateRange(start: string, end?: string): string {
  if (!end || end === start) return formatDate(start)
  const s = parseDate(start)
  const e = parseDate(end)
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日 - ${e.getDate()}日`
  }
  return `${formatDate(start)} - ${formatDate(end)}`
}

export function today(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** 与今天相差的天数，正数为未来 */
export function daysFromToday(value: string): number {
  return Math.round((parseDate(value).getTime() - today().getTime()) / 86_400_000)
}

export type EventStatus = 'done' | 'active' | 'upcoming'

export function statusOf(start: string, end?: string): EventStatus {
  const now = today().getTime()
  const s = parseDate(start).getTime()
  const e = parseDate(end || start).getTime()
  if (now > e) return 'done'
  if (now >= s) return 'active'
  return 'upcoming'
}

export function countdownLabel(value: string): string {
  const diff = daysFromToday(value)
  if (diff === 0) return '就是今天'
  if (diff > 0) return `还有 ${diff} 天`
  return `已过去 ${Math.abs(diff)} 天`
}

/** 212.5 → 212.5；缺失 → — */
export function formatScore(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(1) : '—'
}

/** 12980 → 1.3 万；8634 → 8,634 */
export function formatViews(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '—'
  if (value < 10_000) return value.toLocaleString('zh-CN')
  return `${(value / 10_000).toFixed(1)} 万`
}

/** 4.5 → ▲4.5 / -2 → ▼2.0 / 0 → 持平 */
export function formatDelta(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—'
  if (Math.abs(value) < 0.05) return '持平'
  return value > 0 ? `▲${value.toFixed(1)}` : `▼${Math.abs(value).toFixed(1)}`
}

/** 涨跌对应的语义色：涨红跌绿（与国内行情口径一致） */
export function deltaClass(value: number | null): string {
  if (value === null || Math.abs(value) < 0.05) return 'text-slate-400 dark:text-slate-500'
  return value > 0
    ? 'text-rose-600 dark:text-rose-400'
    : 'text-emerald-600 dark:text-emerald-400'
}

export function highlight(text: string, keyword: string): { text: string; hit: boolean }[] {
  const kw = keyword.trim()
  if (!kw) return [{ text, hit: false }]
  const parts: { text: string; hit: boolean }[] = []
  const lower = text.toLowerCase()
  const target = kw.toLowerCase()
  let cursor = 0
  let index = lower.indexOf(target)
  while (index !== -1) {
    if (index > cursor) parts.push({ text: text.slice(cursor, index), hit: false })
    parts.push({ text: text.slice(index, index + kw.length), hit: true })
    cursor = index + kw.length
    index = lower.indexOf(target, cursor)
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false })
  return parts
}
