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
