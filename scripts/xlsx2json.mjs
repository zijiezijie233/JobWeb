#!/usr/bin/env node
/**
 * 陕西省考职位表 Excel → positions.json
 *
 * 用法：
 *   npm run import:excel -- "C:/path/职位表.xlsx"
 *   npm run import:excel -- "C:/path/职位表.xlsx" --sheet 职位表 --out src/data/positions.json
 *
 * 说明：
 *   - 自动在前 12 行内识别表头，按别名匹配字段，缺列自动降级为空值
 *   - 清洗专业、学历、基层年限、应届等字段，输出校验报告
 *   - 默认覆盖写入 src/data/positions.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const input = args.find((a) => !a.startsWith('--'))
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

if (!input) {
  console.error('用法: npm run import:excel -- "<职位表.xlsx 路径>" [--sheet 名称] [--out 输出路径]')
  process.exit(1)
}

const inputPath = path.resolve(input)
if (!fs.existsSync(inputPath)) {
  console.error(`✗ 文件不存在: ${inputPath}`)
  process.exit(1)
}

const ALIASES = {
  code: ['职位代码', '岗位代码', '职位编码'],
  org: ['招录机关', '招录单位', '主管部门', '招考单位', '单位'],
  unit: ['用人单位', '内设机构', '所属单位', '部门名称'],
  name: ['职位名称', '岗位名称', '招录职位'],
  category: ['职位类别', '职位属性', '职位类型'],
  intro: ['职位简介', '岗位简介', '职位描述', '工作内容'],
  headcount: ['招录人数', '招录计划', '招录名额', '计划数', '人数'],
  city: ['地市', '所属地市', '所在市', '地区', '工作地点'],
  county: ['区县', '县区', '所属县区', '县（市、区）'],
  education: ['学历', '最低学历', '学历要求'],
  degree: ['学位', '学位要求'],
  majorsRaw: ['专业', '专业要求', '所学专业', '专业条件'],
  political: ['政治面貌'],
  grassroots: ['基层工作最低年限', '基层工作经历', '基层年限', '工作年限'],
  freshGrad: ['是否限应届', '应届', '是否应届', '应届毕业生'],
  gender: ['性别', '性别要求'],
  age: ['年龄', '年龄要求'],
  otherReq: ['其他条件', '其他要求', '其他资格条件', '资格条件'],
  note: ['备注', '说明'],
  phone: ['咨询电话', '联系电话', '电话'],
}

const MAJOR_TAXONOMY = [
  '法学类', '中国语言文学类', '计算机类', '经济学类', '财政学类', '金融学类', '统计学类',
  '工商管理类', '公共管理类', '新闻传播学类', '临床医学类', '公共卫生与预防医学类', '土木类',
  '水利类', '环境科学与工程类', '农业工程类', '公安学类', '马克思主义理论类', '教育学类',
  '心理学类', '药学类', '食品科学与工程类', '矿业类', '安全科学与工程类', '管理科学与工程类',
  '林学类', '旅游管理类', '生物科学类', '会计学', '审计学', '农学', '生态学',
]

const norm = (v) => String(v ?? '').replace(/[\s\u3000]/g, '').replace(/[（(].*?[)）]/g, '')
const cell = (v) => String(v ?? '').trim()

function scoreHeader(row) {
  let score = 0
  for (const value of row) {
    const h = norm(value)
    if (!h) continue
    for (const list of Object.values(ALIASES)) {
      if (list.some((alias) => h === alias || h.includes(alias))) {
        score += 1
        break
      }
    }
  }
  return score
}

function mapColumns(headerRow) {
  const map = {}
  headerRow.forEach((value, index) => {
    const h = norm(value)
    if (!h) return
    for (const [field, list] of Object.entries(ALIASES)) {
      if (map[field] !== undefined) continue
      if (list.some((alias) => h === alias || h.includes(alias))) {
        map[field] = index
        return
      }
    }
  })
  return map
}

function parseMajors(raw) {
  const text = cell(raw)
  if (!text || /不限/.test(text)) return ['不限专业']
  // 以「类」名为主键匹配，同时兼容「财政学（020203）」这类具体专业写法
  const hits = MAJOR_TAXONOMY.filter((m) => text.includes(m) || text.includes(m.replace(/类$/, '')))
  if (hits.length) return Array.from(new Set(hits)).slice(0, 6)
  return text
    .split(/[、,，;；/]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6)
}

function parseYears(raw) {
  const text = cell(raw)
  if (!text || /不限|无/.test(text)) return 0
  const m = text.match(/\d+/)
  return m ? Number(m[0]) : 0
}

function parseFresh(raw) {
  const text = cell(raw)
  if (!text) return false
  if (/不限|否|^N$/i.test(text)) return false
  if (/^(是|限|Y|√)/i.test(text)) return true
  return /应届/.test(text)
}

function normalizeCity(raw) {
  const t = cell(raw)
  if (!t) return '西安'
  if (/杨凌/.test(t)) return '杨凌'
  return t.replace(/市$/, '').replace(/地区$/, '')
}

function normalizeCounty(raw) {
  const t = cell(raw)
  if (!t) return '—'
  if (/^(省|省级|省直)$/.test(t)) return '省级'
  if (/^(市|市级|市直)$/.test(t)) return '市级'
  return t
}

const wb = XLSX.readFile(inputPath)
const sheetName = getArg('sheet', wb.SheetNames[0])
const sheet = wb.Sheets[sheetName]
if (!sheet) {
  console.error(`✗ 未找到工作表: ${sheetName}，可用: ${wb.SheetNames.join(', ')}`)
  process.exit(1)
}

const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' })
let headerIndex = 0
let best = -1
for (let i = 0; i < Math.min(12, rows.length); i += 1) {
  const score = scoreHeader(rows[i])
  if (score > best) {
    best = score
    headerIndex = i
  }
}

if (best < 3) {
  console.error('✗ 未识别到有效表头，请用 --sheet 指定工作表，或检查文件格式')
  process.exit(1)
}

const columns = mapColumns(rows[headerIndex])
const missing = ['code', 'name', 'org', 'headcount'].filter((k) => columns[k] === undefined)
if (missing.length) {
  console.warn(`⚠ 缺少关键列: ${missing.join(', ')}，相关字段将为空`)
}

const year = Number(getArg('year', new Date().getFullYear() + 1))
const today = new Date().toISOString().slice(0, 10)
const sourceUrl = getArg('source', 'https://www.sxrsks.cn/')

const positions = []
const seen = new Set()

rows.slice(headerIndex + 1).forEach((row) => {
  const pick = (field) => (columns[field] === undefined ? '' : cell(row[columns[field]]))
  const name = pick('name')
  const org = pick('org')
  if (!name && !org) return
  if (/^(合计|总计|说明|备注)/.test(name)) return

  const rawCode = pick('code') || String(positions.length + 1)
  let code = rawCode
  let suffix = 1
  while (seen.has(code)) {
    suffix += 1
    code = `${rawCode}-${suffix}`
  }
  seen.add(code)

  positions.push({
    id: `sn-${year}-${String(positions.length + 1).padStart(4, '0')}`,
    code,
    org: org || '未注明',
    unit: pick('unit') || '—',
    name: name || '未命名职位',
    category: pick('category') || '综合管理',
    intro: pick('intro') || '—',
    headcount: Number(pick('headcount').replace(/[^\d]/g, '')) || 1,
    city: normalizeCity(pick('city')),
    county: normalizeCounty(pick('county')),
    education: pick('education') || '本科及以上',
    degree: pick('degree') || '不限',
    majors: parseMajors(pick('majorsRaw')),
    majorsRaw: pick('majorsRaw') || '不限专业',
    political: /党员/.test(pick('political')) ? '中共党员' : '不限',
    grassrootsYears: parseYears(pick('grassroots')),
    freshGrad: parseFresh(pick('freshGrad')),
    gender: /男/.test(pick('gender')) ? '男' : /女/.test(pick('gender')) ? '女' : '不限',
    ageLimit: pick('age') || '18-35周岁',
    otherReq: pick('otherReq') || '无',
    note: pick('note') || '无',
    phone: pick('phone') || '—',
    sourceUrl,
    updatedAt: today,
  })
})

if (!positions.length) {
  console.error('✗ 未解析到任何岗位数据，请检查表头与数据行')
  process.exit(1)
}

const outPath = path.resolve(ROOT, getArg('out', 'src/data/positions.json'))
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(positions, null, 2)}\n`, 'utf8')

const totalHeadcount = positions.reduce((sum, p) => sum + p.headcount, 0)
const cities = new Set(positions.map((p) => p.city))

console.log(`
✓ 导入完成
  工作表      : ${sheetName}（表头在第 ${headerIndex + 1} 行）
  识别列      : ${Object.keys(columns).length} / ${Object.keys(ALIASES).length}
  岗位数量    : ${positions.length} 个
  招录人数    : ${totalHeadcount} 人
  覆盖地市    : ${cities.size} 个（${Array.from(cities).join('、')}）
  输出文件    : ${outPath}
${missing.length ? `  缺失字段    : ${missing.join('、')}\n` : ''}`)
