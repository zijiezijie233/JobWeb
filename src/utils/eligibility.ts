import type { Position } from '../types'

export interface AcademicRecord {
  id: string
  level: '' | '大专' | '本科' | '硕士' | '博士'
  degree: '' | '无学位' | '学士' | '硕士' | '博士'
  major: string
  majorCode: string
  graduationYear: string
  school: string
  studyMode: '' | '全日制' | '非全日制' | '其他'
  studyStatus: '' | '在读 / 应届预计取得' | '已毕业'
  degreeStatus: '' | '已取得' | '预计取得' | '无学位'
}
export interface ApplicantProfile {
  version: 2
  name: string
  educations: AcademicRecord[]
  freshGrad: '' | '是' | '否' | '不确定'
  political: string
  gender: string
  birthDate: string
  grassrootsYears: string
  preferredCity: string
  updatedAt: string
}
export type CheckStatus = 'pass' | 'mismatch' | 'pending' | 'missing' | 'unrestricted'
export interface EligibilityRow { label: string; requirement: string; actual: string; status: CheckStatus; reason: string }
export const statusLabels: Record<CheckStatus, string> = {
  pass: '按填写信息初步符合', mismatch: '存在条件冲突', pending: '需要确认', missing: '资料待补充', unrestricted: '该项不限',
}
export function emptyProfile(): ApplicantProfile {
  return { version: 2, name: '', educations: [], freshGrad: '', political: '', gender: '', birthDate: '', grassrootsYears: '', preferredCity: '', updatedAt: '' }
}
export function emptyEducation(): AcademicRecord {
  return { id: globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2), level: '', degree: '', major: '', majorCode: '', graduationYear: '', school: '', studyMode: '', studyStatus: '', degreeStatus: '' }
}
export const educationRank: Record<string, number> = { 大专: 1, 本科: 2, 硕士: 3, 博士: 4 }
export function highestEducation(profile: ApplicantProfile): AcademicRecord {
  return [...profile.educations].filter(a => educationRank[a.level]).sort((a, b) => educationRank[b.level]! - educationRank[a.level]! || String(b.graduationYear).localeCompare(String(a.graduationYear)))[0] || emptyEducation()
}
export function normalizeProfile(raw: unknown): ApplicantProfile {
  const base = emptyProfile()
  if (!raw || typeof raw !== 'object') return base
  const p = raw as Record<string, unknown>
  if (p.version !== 1 && p.version !== 2) return base
  for (const key of ['name', 'political', 'gender', 'birthDate', 'preferredCity', 'updatedAt'] as const) base[key] = typeof p[key] === 'string' ? p[key] as string : ''
  base.freshGrad = ['', '是', '否', '不确定'].includes(String(p.freshGrad)) ? p.freshGrad as ApplicantProfile['freshGrad'] : ''
  base.grassrootsYears = typeof p.grassrootsYears === 'string' || typeof p.grassrootsYears === 'number' ? String(p.grassrootsYears) : ''
  const source = p.version === 1 ? [p.undergraduate, p.postgraduate] : Array.isArray(p.educations) ? p.educations : []
  base.educations = source.filter((a): a is Record<string, unknown> => !!a && typeof a === 'object').map(a => {
    const r = emptyEducation()
    for (const key of ['id', 'major', 'majorCode', 'school', 'graduationYear'] as const) if (typeof a[key] === 'string' || key === 'graduationYear' && typeof a[key] === 'number') r[key] = String(a[key])
    r.level = Object.prototype.hasOwnProperty.call(educationRank, String(a.level)) ? a.level as AcademicRecord['level'] : ''
    r.degree = ['', '无学位', '学士', '硕士', '博士'].includes(String(a.degree)) ? a.degree as AcademicRecord['degree'] : ''
    r.studyMode = ['全日制', '非全日制', '其他'].includes(String(a.studyMode)) ? a.studyMode as AcademicRecord['studyMode'] : ''
    r.studyStatus = ['在读 / 应届预计取得', '已毕业'].includes(String(a.studyStatus)) ? a.studyStatus as AcademicRecord['studyStatus'] : ''
    r.degreeStatus = ['已取得', '预计取得', '无学位'].includes(String(a.degreeStatus)) ? a.degreeStatus as AcademicRecord['degreeStatus'] : ''
    return r
  }).filter(a => a.level || a.major || a.school)
  return base
}
export function checkEligibility(p: Position, profile: ApplicantProfile): EligibilityRow[] {
  const a = highestEducation(profile)
  const rows: EligibilityRow[] = []
  const add = (label: string, requirement: string, actual: string, status: CheckStatus, reason: string) => rows.push({ label, requirement, actual: actual || '未填写', status, reason })
  const levels: Record<string, number> = { 大专: 1, 本科: 2, 硕士: 3, 博士: 4 }
  const degrees: Record<string, number> = { 无学位: 0, 学士: 1, 硕士: 2, 博士: 3 }
  const minLevel = p.education.startsWith('大专') ? 1 : p.education.startsWith('本科') ? 2 : p.education.includes('博士') ? 4 : p.education.includes('硕士') ? 3 : undefined
  const minDegree = p.degree.startsWith('学士') ? 1 : p.degree.startsWith('硕士') ? 2 : p.degree.startsWith('博士') ? 3 : undefined
  function academic(label: string, req: string, actual: string, rank: number | undefined, required: number | undefined) {
    if (req === '不限') return add(label, req, actual, 'unrestricted', '岗位该字段未设置限制；其他条件仍需逐项核对。')
    if (!actual) return add(label, req, actual, 'missing', '请补充最高学历及其对应学位信息。')
    if (required === undefined || !req.includes('及以上')) return add(label, req, actual, 'pending', '当前规则无法可靠解释此要求，请对照公告人工确认。')
    const sufficient = rank !== undefined && rank >= required
    const obtained = label === '学历' ? a.studyStatus === '已毕业' : a.degreeStatus === '已取得' || a.degree === '无学位'
    add(label, req, actual, !sufficient ? 'mismatch' : obtained ? 'pass' : 'pending', !sufficient ? '最高学历对应信息低于该字段要求，请核实填写情况。' : obtained ? '按自报已取得信息初步比较层级；证书认可范围仍需核实。' : '层级达到要求，但证书尚未取得或取得状态未填写；需确认公告规定的证书取得期限。')
  }
  academic('学历', p.education, a.level, levels[a.level], minLevel)
  academic('学位', p.degree, a.degree, degrees[a.degree], minDegree)
  const noMajor = /^(不限|不限专业|专业不限)$/.test(p.majorsRaw.trim()) || p.majors.length === 1 && p.majors[0] === '不限专业'
  add('专业', p.majorsRaw, [a.major, a.majorCode && `代码 ${a.majorCode}`].filter(Boolean).join(' / '), noMajor ? 'unrestricted' : !a.major ? 'missing' : 'pending', noMajor ? '该字段不限专业，仍需检查其他条件中的特殊要求。' : '专业名称相似、代码前缀相同或属于相近学科，均不能直接证明可报。需核对本批次专业目录、教育层次及招录机关口径；不会混用本科和研究生专业。')
  const cohort = p.otherReq.match(/(20\d{2})年应届/)
  let freshStatus: CheckStatus = 'unrestricted'
  let freshReason = '该结构化字段不限制应届身份；仍需检查其他报考条件。'
  if (p.freshGrad) {
    freshStatus = !profile.freshGrad ? 'missing' : profile.freshGrad === '否' ? 'mismatch' : 'pending'
    freshReason = '用户自报应届身份不是资格结论，需核对本批次的应届定义、毕业及证书取得期限。'
    if (cohort && a.graduationYear && cohort[1] !== String(a.graduationYear)) { freshStatus = 'mismatch'; freshReason = `其他条件写明 ${cohort[1]} 年应届，最高学历记录填写 ${a.graduationYear} 年毕业；请核实是否存在适用政策或填写错误。` }
  }
  add('应届身份 / 毕业年份', p.freshGrad ? `仅限应届${cohort ? `；其他条件写明 ${cohort[1]} 年` : ''}` : '不限', `${profile.freshGrad || '身份未填写'}；${a.graduationYear ? a.graduationYear + '年毕业' : '毕业年份未填写'}`, freshStatus, freshReason)
  for (const [label, req, actual] of [['政治面貌', p.political, profile.political], ['性别', p.gender, profile.gender]]) {
    add(label!, req!, actual!, req === '不限' ? 'unrestricted' : !actual ? 'missing' : actual === req ? 'pass' : 'pending', req === '不限' ? '岗位该字段不限。' : actual === req ? '按用户填写与岗位原文做完全一致比较，需核验证明材料。' : '未填写或与原文不完全一致；不同身份的包含关系不由系统推断，请确认适用口径。')
  }
  const years = profile.grassrootsYears === '' ? undefined : Number(profile.grassrootsYears)
  add('基层工作经历', p.grassrootsYears > 0 ? `${p.grassrootsYears} 年及以上` : '不限', years === undefined ? '' : `${years} 年（自报）`, p.grassrootsYears <= 0 ? 'unrestricted' : years === undefined || !Number.isFinite(years) || years < 0 ? 'missing' : years < p.grassrootsYears ? 'mismatch' : 'pending', '自报年数不等于认定年数；经历类型、计算截止时间及证明材料应按公告核实。')
  add('年龄', p.ageLimit, profile.birthDate ? `出生日期 ${profile.birthDate}` : '', !profile.birthDate ? 'missing' : 'pending', '岗位只有年龄描述，缺少本批次年龄计算基准日及放宽规则，不能按今天的年龄直接判定。')
  add('其他报考条件', p.otherReq || '未提供', '', 'pending', '自由文本可能含资格证书、特定学位、技能、材料等附加要求，当前不自动判定；需逐项核对原文。')
  return rows
}
