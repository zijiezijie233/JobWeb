import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import vm from 'node:vm'
import assert from 'node:assert/strict'
const source = await readFile(new URL('../src/utils/eligibility.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const ctx = vm.createContext({ exports: {} })
vm.runInContext(compiled, ctx)
const { emptyProfile, emptyEducation, highestEducation, normalizeProfile, checkEligibility } = ctx.exports
const positions = JSON.parse(await readFile(new URL('../src/data/positions.json', import.meta.url), 'utf8'))
const p = positions.find(p => p.code === '27010006')
const row = (rows, label) => rows.find(r => r.label === label)
let profile = emptyProfile()
assert.equal(row(checkEligibility(p, profile), '学历').status, 'missing')
const undergraduate = { ...emptyEducation(), level: '本科', degree: '学士', major: '计算机科学与技术', majorCode: '080901', graduationYear: '2024', studyStatus: '已毕业', degreeStatus: '已取得' }
const postgraduate = { ...emptyEducation(), level: '硕士', degree: '硕士', major: '金融学', majorCode: '020204', graduationYear: '2027', studyStatus: '已毕业', degreeStatus: '已取得' }
profile.educations = [undergraduate, postgraduate]
profile.freshGrad = '是'
let rows = checkEligibility(p, profile)
assert.equal(row(rows, '学历').status, 'pass')
assert.ok(row(rows, '专业').actual.includes('金融学'))
assert.ok(!row(rows, '专业').actual.includes('计算机'))
assert.equal(row(rows, '专业').status, 'pending')
assert.equal(row(rows, '应届身份 / 毕业年份').status, 'pending')
assert.equal(highestEducation(profile).id, postgraduate.id)
profile.educations = [undergraduate]
rows = checkEligibility(p, profile)
assert.ok(row(rows, '专业').actual.includes('计算机'))
assert.equal(row(rows, '专业').status, 'pending')
assert.equal(row(rows, '应届身份 / 毕业年份').status, 'mismatch')
const master = positions.find(p => p.education.includes('硕士'))
assert.equal(row(checkEligibility(master, profile), '学历').status, 'mismatch')
profile.birthDate = '2000-01-01'
assert.equal(row(checkEligibility(p, profile), '年龄').status, 'pending')
profile.preferredCity = '上海'
assert.ok(!checkEligibility(p, profile).some(r => r.label.includes('城市')))
const grassroots = { ...p, grassrootsYears: 2 }
profile.grassrootsYears = ''
assert.equal(row(checkEligibility(grassroots, profile), '基层工作经历').status, 'missing')
profile.grassrootsYears = '0'
assert.equal(row(checkEligibility(grassroots, profile), '基层工作经历').status, 'mismatch')
profile.grassrootsYears = '3'
assert.equal(row(checkEligibility(grassroots, profile), '基层工作经历').status, 'pending')
assert.equal(row(checkEligibility({ ...p, majorsRaw: '不限专业', majors: ['不限专业'] }, emptyProfile()), '专业').status, 'unrestricted')
profile.educations = [undergraduate, { ...postgraduate, studyStatus: '在读 / 应届预计取得', degreeStatus: '预计取得' }]
assert.equal(row(checkEligibility(p, profile), '学历').status, 'pending')
assert.equal(row(checkEligibility(p, profile), '学位').status, 'pending')
assert.ok(row(checkEligibility(p, profile), '专业').actual.includes('金融学'))
const migrated = normalizeProfile({ version: 1, name: '旧档案', undergraduate, postgraduate, applicationStage: 'undergraduate', grassrootsYears: 0 })
assert.equal(migrated.version, 2)
assert.equal(migrated.educations.length, 2)
assert.equal(highestEducation(migrated).major, '金融学')
assert.equal(migrated.grassrootsYears, '0')
assert.equal(highestEducation(normalizeProfile({ version: 2, educations: [{ level: '火星学历' }] })).level, '')
assert.equal(normalizeProfile(null).educations.length, 0)
const doctoral = { ...emptyEducation(), level: '博士', major: '物理学', graduationYear: '2030' }
profile.educations.push(doctoral)
assert.equal(highestEducation(profile).major, '物理学')
console.log('PASS: highest-degree default, no credential mixing, pending certificates, v1 migration, degree deletion fallback, malformed input, cohort conflict, conservative rules')
