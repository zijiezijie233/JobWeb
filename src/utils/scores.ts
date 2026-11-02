import type { InterviewScoreRecord, Position } from '@/types'

/** 按年度升序返回进面分记录（缺失字段时返回空数组） */
export function scoreHistory(position: Position): InterviewScoreRecord[] {
  return (position.interviewScores ?? []).slice().sort((a, b) => a.year - b.year)
}

/** 有成绩记录的年度（升序） */
export function scoredYears(position: Position): number[] {
  return scoreHistory(position)
    .filter((r) => typeof r.minScore === 'number')
    .map((r) => r.year)
}

/** 最新一个有成绩的年度记录 */
export function latestScore(position: Position): InterviewScoreRecord | null {
  const rows = scoreHistory(position).filter((r) => typeof r.minScore === 'number')
  return rows.length ? rows[rows.length - 1] : null
}

/** 最新年度的上一个有成绩年度，用于同比 */
export function previousScore(position: Position): InterviewScoreRecord | null {
  const rows = scoreHistory(position).filter((r) => typeof r.minScore === 'number')
  return rows.length > 1 ? rows[rows.length - 2] : null
}

/** 最新年度较上一年的涨跌，无对比基数时返回 null */
export function scoreDelta(position: Position): number | null {
  const latest = latestScore(position)
  const prev = previousScore(position)
  if (!latest || !prev || latest.minScore === null || prev.minScore === null) return null
  return Number((latest.minScore - prev.minScore).toFixed(1))
}

export interface ScoreSummary {
  /** 最新有成绩年度 */
  latest: InterviewScoreRecord | null
  /** 对比基数年度 */
  previous: InterviewScoreRecord | null
  /** 涨跌分数 */
  delta: number | null
  /** 有效年份数 */
  count: number
  min: number | null
  max: number | null
  avg: number | null
  /** 缺失（未公布）年度 */
  missingYears: number[]
}

export function scoreSummary(position: Position): ScoreSummary {
  const history = scoreHistory(position)
  const values = history.filter((r) => typeof r.minScore === 'number').map((r) => r.minScore as number)
  const latest = latestScore(position)
  const previous = previousScore(position)
  const delta = scoreDelta(position)
  return {
    latest,
    previous,
    delta,
    count: values.length,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    avg: values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : null,
    missingYears: history.filter((r) => r.minScore === null).map((r) => r.year),
  }
}

export interface TrendPoint {
  year: number
  value: number | null
  /** 相对上一有效年度的涨跌 */
  delta: number | null
  /** 用于对比的年度（可能跳过缺失年份） */
  deltaYear: number | null
  /** 对比年度与上一行不连续（中间有缺失年份） */
  crossGap: boolean
  remark: string
  interviewCount: number | null
  isLatest: boolean
}

/** 趋势图与表格共用的行数据 */
export function trendPoints(position: Position): TrendPoint[] {
  const history = scoreHistory(position)
  const latestYear = latestScore(position)?.year ?? null
  let lastValue: number | null = null
  let lastYear: number | null = null
  let prevRowYear: number | null = null
  return history.map((r) => {
    const value = typeof r.minScore === 'number' ? r.minScore : null
    let delta: number | null = null
    let deltaYear: number | null = null
    if (value !== null && lastValue !== null && lastYear !== null) {
      delta = Number((value - lastValue).toFixed(1))
      deltaYear = lastYear
    }
    const crossGap = deltaYear !== null && prevRowYear !== null && deltaYear !== prevRowYear
    if (value !== null) {
      lastValue = value
      lastYear = r.year
    }
    prevRowYear = r.year
    return {
      year: r.year,
      value,
      delta,
      deltaYear,
      crossGap,
      remark: r.remark ?? '',
      interviewCount: r.interviewCount ?? null,
      isLatest: latestYear !== null && r.year === latestYear,
    }
  })
}

/** 柱状图高度百分比：把区间上下留白压缩，让涨跌更明显 */
export function barHeights(position: Position): number[] {
  const rows = trendPoints(position)
  const values = rows.filter((r) => r.value !== null).map((r) => r.value as number)
  if (!values.length) return rows.map(() => 0)
  const lo = Math.min(...values) - 6
  const hi = Math.max(...values) + 2
  return rows.map((r) => {
    if (r.value === null) return 12
    const pct = ((r.value - lo) / (hi - lo)) * 100
    return Math.max(10, Math.min(100, pct))
  })
}
