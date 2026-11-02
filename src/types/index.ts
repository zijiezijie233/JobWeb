export interface Position {
  /** 内部唯一 ID */
  id: string
  /** 职位代码 */
  code: string
  /** 招录机关 */
  org: string
  /** 用人单位 */
  unit: string
  /** 职位名称 */
  name: string
  /** 职位类别 */
  category: string
  /** 职位简介 */
  intro: string
  /** 招录人数 */
  headcount: number
  /** 地市 */
  city: string
  /** 区县（省级/市直单位为「—」） */
  county: string
  /** 学历要求 */
  education: string
  /** 学位要求 */
  degree: string
  /** 专业要求（结构化标签） */
  majors: string[]
  /** 专业要求原文 */
  majorsRaw: string
  /** 政治面貌 */
  political: string
  /** 基层工作最低年限，0 表示不限 */
  grassrootsYears: number
  /** 是否仅限应届毕业生 */
  freshGrad: boolean
  /** 性别要求 */
  gender: string
  /** 年龄要求 */
  ageLimit: string
  /** 其他条件 */
  otherReq: string
  /** 备注 */
  note: string
  /** 咨询电话 */
  phone: string
  /** 来源链接 */
  sourceUrl: string
  /** 数据更新时间 */
  updatedAt: string
}

export type StageType =
  | '公告发布'
  | '网上报名'
  | '资格初审'
  | '缴费确认'
  | '准考证打印'
  | '笔试'
  | '成绩查询'
  | '资格复审'
  | '面试'
  | '体检'
  | '政审考察'
  | '公示录用'

export interface TimelineEvent {
  id: string
  stage: StageType
  title: string
  startDate: string
  endDate?: string
  note: string
  /** 日期为预估（官方未发布） */
  estimated?: boolean
}

export interface ExamCycle {
  year: number
  name: string
  announcementUrl: string
  events: TimelineEvent[]
}

export interface ExamMeta {
  currentYear: number
  updatedAt: string
  announcementUrl: string
  sourceName: string
  disclaimer: string
}

export type SortKey = 'default' | 'headcount' | 'city' | 'unit'
export type ViewMode = 'card' | 'table'
