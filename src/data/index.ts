import type { ExamCycle, ExamMeta, Position } from '@/types'
import positionsRaw from './positions.json'
import timelinesRaw from './timelines.json'
import metaRaw from './meta.json'

export const positions = positionsRaw as Position[]
export const timelines = (timelinesRaw as ExamCycle[])
  .slice()
  .sort((a, b) => b.year - a.year)
export const meta = metaRaw as ExamMeta

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
}

export const CITIES = unique(positions.map((p) => p.city))
export const ORGS = unique(positions.map((p) => p.org))
export const CATEGORIES = unique(positions.map((p) => p.category))
export const EDUCATIONS = unique(positions.map((p) => p.education)).sort(
  (a, b) => eduRank(a) - eduRank(b),
)
export const POLITICAL = unique(positions.map((p) => p.political))
export const DEGREES = unique(positions.map((p) => p.degree))

function eduRank(value: string): number {
  if (value.startsWith('大专')) return 1
  if (value.startsWith('本科')) return 2
  if (value.startsWith('研究生')) return 3
  return 9
}

/** 专业大类：按岗位数量从多到少排序，便于高频项优先出现 */
export const MAJORS = (() => {
  const counter = new Map<string, number>()
  for (const p of positions) {
    for (const m of p.majors) counter.set(m, (counter.get(m) ?? 0) + 1)
  }
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hans-CN'))
    .map(([name, count]) => ({ name, count }))
})()

export const STATS = {
  positionCount: positions.length,
  headcount: positions.reduce((sum, p) => sum + p.headcount, 0),
  cityCount: CITIES.length,
  orgCount: ORGS.length,
  freshGradCount: positions.filter((p) => p.freshGrad).length,
  noMajorLimitCount: positions.filter((p) => p.majors.includes('不限专业')).length,
}

export function findPosition(id: string): Position | undefined {
  return positions.find((p) => p.id === id)
}

export function hotCities(limit = 6): { name: string; count: number }[] {
  const counter = new Map<string, number>()
  for (const p of positions) counter.set(p.city, (counter.get(p.city) ?? 0) + 1)
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}
