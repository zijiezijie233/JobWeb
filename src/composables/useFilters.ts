import { computed, reactive, watch } from 'vue'
import type { LocationQuery } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import type { Position, SortKey, ViewMode } from '@/types'

export interface FilterState {
  q: string
  city: string
  org: string
  major: string
  edu: string
  political: string
  category: string
  grassroots: '' | 'none' | 'has'
  fresh: '' | 'yes'
  sort: SortKey
  view: ViewMode
  page: number
}

export const PAGE_SIZE = 9

export const defaultState = (): FilterState => ({
  q: '',
  city: '',
  org: '',
  major: '',
  edu: '',
  political: '',
  category: '',
  grassroots: '',
  fresh: '',
  sort: 'default',
  view: 'card',
  page: 1,
})

function str(v: unknown): string {
  if (Array.isArray(v)) return typeof v[0] === 'string' ? v[0] : ''
  return typeof v === 'string' ? v : ''
}

export function fromQuery(query: LocationQuery): FilterState {
  const s = defaultState()
  s.q = str(query.q)
  s.city = str(query.city)
  s.org = str(query.org)
  s.major = str(query.major)
  s.edu = str(query.edu)
  s.political = str(query.political)
  s.category = str(query.category)
  const g = str(query.grassroots)
  s.grassroots = g === 'none' || g === 'has' ? g : ''
  s.fresh = str(query.fresh) === 'yes' ? 'yes' : ''
  const sort = str(query.sort)
  s.sort = sort === 'headcount' || sort === 'city' || sort === 'unit' ? sort : 'default'
  s.view = str(query.view) === 'table' ? 'table' : 'card'
  const page = Number(str(query.page))
  s.page = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  return s
}

export function toQuery(s: FilterState): Record<string, string> {
  const q: Record<string, string> = {}
  if (s.q.trim()) q.q = s.q.trim()
  if (s.city) q.city = s.city
  if (s.org) q.org = s.org
  if (s.major) q.major = s.major
  if (s.edu) q.edu = s.edu
  if (s.political) q.political = s.political
  if (s.category) q.category = s.category
  if (s.grassroots) q.grassroots = s.grassroots
  if (s.fresh) q.fresh = s.fresh
  if (s.sort !== 'default') q.sort = s.sort
  if (s.view !== 'card') q.view = s.view
  if (s.page > 1) q.page = String(s.page)
  return q
}

export function useFilterState() {
  const route = useRoute()
  const router = useRouter()
  const state = reactive<FilterState>(fromQuery(route.query))

  watch(
    () => route.query,
    (raw) => {
      const next = fromQuery(raw)
      if (JSON.stringify(toQuery(next)) !== JSON.stringify(toQuery(state as FilterState))) {
        Object.assign(state, next)
      }
    },
  )

  watch(
    () => toQuery(state as FilterState),
    (next) => {
      if (JSON.stringify(next) !== JSON.stringify(toQuery(fromQuery(route.query)))) {
        router.replace({ path: route.path, query: next })
      }
    },
  )

  return state
}

export function applyFilters(list: Position[], s: FilterState): Position[] {
  const kw = s.q.trim().toLowerCase()
  return list.filter((p) => {
    if (s.city && p.city !== s.city) return false
    if (s.org && p.org !== s.org) return false
    if (s.edu && p.education !== s.edu) return false
    if (s.political && p.political !== s.political) return false
    if (s.category && p.category !== s.category) return false
    if (s.major && !p.majors.includes(s.major) && !p.majorsRaw.includes(s.major)) return false
    if (s.grassroots === 'none' && p.grassrootsYears > 0) return false
    if (s.grassroots === 'has' && p.grassrootsYears === 0) return false
    if (s.fresh === 'yes' && !p.freshGrad) return false
    if (kw) {
      const hay = [
        p.name,
        p.org,
        p.unit,
        p.code,
        p.majorsRaw,
        p.intro,
        p.city,
        p.county,
        p.category,
        p.education,
      ]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(kw)) return false
    }
    return true
  })
}

export function applySort(list: Position[], sort: SortKey): Position[] {
  const arr = list.slice()
  if (sort === 'headcount') {
    arr.sort((a, b) => b.headcount - a.headcount || a.code.localeCompare(b.code))
  } else if (sort === 'city') {
    arr.sort((a, b) => a.city.localeCompare(b.city, 'zh-Hans-CN') || a.org.localeCompare(b.org, 'zh-Hans-CN'))
  } else if (sort === 'unit') {
    arr.sort((a, b) => a.org.localeCompare(b.org, 'zh-Hans-CN') || a.unit.localeCompare(b.unit, 'zh-Hans-CN'))
  }
  return arr
}

export function useResult(list: { value: Position[] }, state: FilterState) {
  return computed(() => {
    const filtered = applyFilters(list.value, state)
    return { filtered, sorted: applySort(filtered, state.sort) }
  })
}
