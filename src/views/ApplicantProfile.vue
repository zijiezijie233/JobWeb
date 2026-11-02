<script setup lang="ts">
import { computed, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { CITIES } from '@/data'
import { useApplicantProfile } from '@/composables/useApplicantProfile'
import { educationRank, emptyEducation, emptyProfile, highestEducation, type AcademicRecord, type ApplicantProfile } from '@/utils/eligibility'
const { profile, saveProfile, clearProfile } = useApplicantProfile()
const copy = <T,>(v: T): T => JSON.parse(JSON.stringify(v))
const draft = ref<ApplicantProfile>(copy(profile.value))
const route = useRoute(), message = ref(''), editorError = ref(''), editing = ref(false)
const dialog = ref<HTMLDialogElement>(), editor = ref<AcademicRecord>(emptyEducation())
const highest = computed(() => highestEducation(draft.value))
const others = computed(() => draft.value.educations.filter(a => a.id !== highest.value.id).sort((a, b) => educationRank[b.level]! - educationRank[a.level]!))
const dirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(profile.value))
const degrees: Record<string, string[]> = { 大专: ['无学位'], 本科: ['学士', '无学位'], 硕士: ['硕士', '无学位'], 博士: ['博士', '无学位'] }
const degreeOptions = computed(() => degrees[editor.value.level] || [])
const returnTo = computed(() => typeof route.query.returnTo === 'string' && /^\/position\/[^/?#]+$/.test(route.query.returnTo) ? route.query.returnTo : '/')
onBeforeRouteLeave(() => !dirty.value || confirm('档案有未保存的修改，确定离开？'))
function openEducation(record?: AcademicRecord) { editing.value = !!record; editor.value = record ? copy(record) : emptyEducation(); editorError.value = ''; dialog.value?.showModal() }
function commitEducation() {
  const a = editor.value
  if (!a.level || !a.major.trim()) { editorError.value = '请选择学历，并填写专业全称。'; return }
  if (a.degree && !degreeOptions.value.includes(a.degree)) { editorError.value = '请核对该学历对应的学位。'; return }
  if (a.graduationYear && !/^(19|20|21)\d{2}$/.test(a.graduationYear)) { editorError.value = '请填写四位毕业年份，例如 2027。'; return }
  if (a.degree === '无学位') a.degreeStatus = '无学位'
  if (a.degree !== '无学位' && a.degreeStatus === '无学位') a.degreeStatus = ''
  a.major = a.major.trim()
  const i = draft.value.educations.findIndex(e => e.id === a.id)
  if (i < 0) draft.value.educations.push(copy(a)); else draft.value.educations[i] = copy(a)
  dialog.value?.close(); message.value = '教育经历已更新，请保存档案以应用修改。'
}
function removeEducation(id: string) { if (confirm('移除这段教育经历？保存档案后生效，最高学历会自动重新识别。')) draft.value.educations = draft.value.educations.filter(a => a.id !== id) }
function submit() {
  if (!draft.value.educations.length) { message.value = '请先添加最高学历与对应专业。'; return }
  if (draft.value.grassrootsYears !== '' && (!Number.isFinite(Number(draft.value.grassrootsYears)) || Number(draft.value.grassrootsYears) < 0)) { message.value = '基层工作年数应为非负数。'; return }
  draft.value.grassrootsYears = String(draft.value.grassrootsYears)
  if (saveProfile(copy(draft.value))) { draft.value = copy(profile.value); message.value = '档案已保存，岗位核对默认使用最高学历及其对应专业。' } else message.value = '保存失败，请检查浏览器存储权限。'
}
function clear() { if (confirm('清除本浏览器的报考档案？收藏记录不受影响。')) { if (clearProfile()) { draft.value = emptyProfile(); message.value = '报考档案已清除。' } else message.value = '清除失败，请检查浏览器存储权限。' } }
</script>
<template>
  <div class="page max-w-[1080px] py-7">
    <div class="flex flex-wrap items-start justify-between gap-3"><div><p class="text-xs font-medium text-brand-600 dark:text-brand-300">我的选岗资料</p><h1 class="mt-1 text-2xl font-bold">个人报考档案</h1><p class="mt-2 text-sm text-slate-500">先完善学历与专业，再用个人条件核对岗位。</p></div><router-link :to="returnTo" class="btn-ghost">返回岗位</router-link></div>
    <form class="mt-6 space-y-5" @submit.prevent="submit">
      <section class="surface overflow-hidden" aria-labelledby="education-heading">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:px-6"><div><h2 id="education-heading" class="font-semibold">学历与专业</h2><p class="mt-1 text-xs text-slate-500">优先填写最高学历；每段学历与专业、学位配套保存。</p></div><button class="btn-ghost" type="button" @click="openEducation()">＋ 添加教育经历</button></div>
        <div class="p-5 sm:p-6">
          <article v-if="highest.level" class="rounded-xl border border-brand-200 bg-brand-50/40 p-5 dark:border-brand-800 dark:bg-brand-950/20" data-testid="highest-card">
            <div class="flex items-start justify-between gap-3"><div><span class="chip bg-brand-600 text-white">最高学历 · 默认核对</span><h3 class="mt-3 text-lg font-semibold">{{ highest.level }} <span class="mx-1 text-slate-300">/</span> {{ highest.major }}</h3><p class="mt-1 text-xs leading-6 text-slate-500">{{ highest.school || '院校未填写' }} · {{ highest.studyMode || '学习形式未填写' }} · {{ highest.graduationYear ? highest.graduationYear + ' 年毕业' : '毕业年份未填写' }}</p></div><button class="text-sm font-medium text-brand-700 dark:text-brand-300" type="button" @click="openEducation(highest)">编辑</button></div>
            <div class="mt-3 flex flex-wrap gap-2"><span class="tag">{{ highest.studyStatus || '就读状态待补充' }}</span><span class="tag">{{ highest.degree || '学位待补充' }}{{ highest.degreeStatus ? ' · ' + highest.degreeStatus : '' }}</span><span v-if="highest.majorCode" class="tag">专业代码 {{ highest.majorCode }}</span></div>
            <p v-if="highest.studyStatus === '在读 / 应届预计取得'" class="mt-3 text-xs leading-6 text-amber-700 dark:text-amber-300">使用预计取得的最高学历核对，证书取得期限需按对应公告确认。</p><button class="mt-3 text-xs text-slate-400 hover:text-red-600" type="button" @click="removeEducation(highest.id)">移除这段经历</button>
          </article>
          <div v-else class="rounded-xl border border-dashed border-slate-300 px-5 py-9 text-center dark:border-slate-700"><p class="font-medium">填写你的最高学历和专业</p><p class="mt-2 text-xs text-slate-500">只需先填一段；在读应届生可填写预计取得的学历。</p><button class="btn-primary mt-4" type="button" @click="openEducation()">添加学历与专业</button></div>
          <details v-if="others.length" class="mt-5"><summary class="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300">其他教育经历 <span class="ml-1 text-xs text-slate-400">{{ others.length }} 段 · 作为补充资料</span></summary><div class="mt-3 space-y-3"><article v-for="a in others" :key="a.id" class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"><div class="flex justify-between gap-3"><div><h3 class="text-sm font-medium">{{ a.level }} · {{ a.major }}</h3><p class="mt-1 text-xs text-slate-500">{{ a.school || '院校未填写' }} · {{ a.graduationYear || '年份待补充' }} · {{ a.studyStatus || '状态待补充' }}</p></div><div class="flex shrink-0 items-start gap-3 text-xs"><button class="text-brand-700 dark:text-brand-300" type="button" @click="openEducation(a)">编辑</button><button class="text-slate-400" type="button" @click="removeEducation(a.id)">删除</button></div></div></article></div></details>
          <p class="mt-4 text-xs leading-6 text-slate-400">自动使用已填写经历中的最高学历（含预计取得），不会混用不同经历。同层次多段经历暂按毕业年份较晚者核对，适用性仍需确认。</p>
        </div>
      </section>
      <section class="surface p-5 sm:p-6"><h2 class="font-semibold">身份与报考条件</h2><p class="mt-1 text-xs text-slate-500">按实际情况补充；缺失信息不会自动视为符合。</p><div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label><span class="label">称呼（选填）</span><input v-model="draft.name" class="field" maxlength="40" placeholder="例如：林同学"></label>
        <label><span class="label">应届身份（自报）</span><select v-model="draft.freshGrad" aria-label="应届身份" class="field"><option value="">未填写</option><option>是</option><option>否</option><option>不确定</option></select></label>
        <label><span class="label">政治面貌</span><select v-model="draft.political" aria-label="政治面貌" class="field"><option value="">未填写</option><option>中共党员</option><option>中共预备党员</option><option>共青团员</option><option>群众</option><option>其他</option></select></label>
        <label><span class="label">性别</span><select v-model="draft.gender" aria-label="性别" class="field"><option value="">未填写</option><option>男</option><option>女</option></select></label>
        <label><span class="label">出生日期（选填）</span><input v-model="draft.birthDate" class="field" type="date" max="2099-12-31"></label>
        <label><span class="label">基层工作年数（自报）</span><input v-model="draft.grassrootsYears" class="field" type="number" min="0" max="70" step="0.1" placeholder="留空表示未知；0 表示无"></label>
      </div></section>
      <section class="surface p-5 sm:p-6"><h2 class="font-semibold">选岗偏好</h2><label class="mt-4 block sm:max-w-sm"><span class="label">意向城市</span><select v-model="draft.preferredCity" aria-label="意向城市" class="field"><option value="">不限 / 未填写</option><option v-for="city in CITIES" :key="city">{{ city }}</option></select></label><p class="mt-2 text-xs text-slate-400">城市偏好不作为报考资格条件。</p></section>
      <div class="surface flex flex-wrap items-center justify-between gap-4 p-5"><div><p class="text-xs text-slate-500">{{ dirty ? '有未保存的修改' : profile.updatedAt ? '档案已保存' : '尚未建立档案' }} · 仅保存在本浏览器</p><p v-if="message" role="status" class="mt-2 text-xs text-brand-700 dark:text-brand-300">{{ message }}</p></div><div class="flex gap-3"><button class="btn-ghost" type="button" @click="clear">清除档案</button><button class="btn-primary" type="submit">保存档案并更新核对</button></div></div>
      <p class="text-xs leading-6 text-slate-400">学历与专业配套录入参考粉笔公开选岗指南，并非粉笔官方产品。当前岗位为示例，核对仅供辅助，以对应批次公告与招录机关审核为准。</p>
    </form>
    <dialog ref="dialog" class="education-dialog" aria-labelledby="education-dialog-title">
      <form @submit.prevent="commitEducation"><div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700"><div><h2 id="education-dialog-title" class="text-lg font-semibold">{{ editing ? '编辑学历与专业' : '添加学历与专业' }}</h2><p class="mt-1 text-xs text-slate-500">每段经历单独保存，最高学历自动用于核对。</p></div><button aria-label="关闭教育经历编辑" class="text-xl text-slate-400" type="button" @click="dialog?.close()">×</button></div>
        <div class="mt-5"><span id="level-label" class="label">学历 *</span><div class="flex flex-wrap gap-2" role="group" aria-labelledby="level-label"><button v-for="level in (['大专','本科','硕士','博士'] as const)" :key="level" type="button" class="rounded-lg border px-5 py-2 text-sm transition" :class="editor.level === level ? 'border-brand-600 bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200' : 'border-slate-200 text-slate-500 dark:border-slate-700'" :aria-pressed="editor.level === level" @click="editor.level = level; editor.degree = ''; editor.degreeStatus = ''">{{ level }}</button></div></div>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="sm:col-span-2"><span class="label">专业全称 *</span><input v-model="editor.major" class="field" required maxlength="120" placeholder="输入毕业证或学籍记载的完整专业名称"><span class="mt-1 block text-[11px] text-slate-400">暂未接入完整专业目录，不按相似名称自动判定可报。</span></label>
          <label><span class="label">毕业院校</span><input v-model="editor.school" class="field" maxlength="100" placeholder="填写学校全称"></label>
          <label><span class="label">毕业年份（含预计）</span><input v-model="editor.graduationYear" class="field" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="例如：2027"></label>
          <label><span class="label">学历性质</span><select v-model="editor.studyMode" aria-label="学历性质" class="field"><option value="">未填写</option><option>全日制</option><option>非全日制</option><option>其他</option></select></label>
          <label><span class="label">就读状态</span><select v-model="editor.studyStatus" aria-label="就读状态" class="field"><option value="">未填写</option><option>在读 / 应届预计取得</option><option>已毕业</option></select></label>
          <label><span class="label">对应学位</span><select v-model="editor.degree" aria-label="对应学位" class="field"><option value="">未填写</option><option v-for="degree in degreeOptions" :key="degree">{{ degree }}</option></select></label>
          <label v-if="editor.degree && editor.degree !== '无学位'"><span class="label">学位取得状态</span><select v-model="editor.degreeStatus" aria-label="学位取得状态" class="field"><option value="">未填写</option><option>已取得</option><option>预计取得</option></select></label>
          <label class="sm:col-span-2"><span class="label">专业代码（选填）</span><input v-model="editor.majorCode" class="field" maxlength="20" placeholder="按对应学历层次、目录版本填写"></label>
        </div><p v-if="editorError" role="alert" class="mt-3 text-xs text-red-600">{{ editorError }}</p><div class="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-700"><button type="button" class="btn-ghost" @click="dialog?.close()">取消</button><button class="btn-primary" type="submit">确认教育经历</button></div>
      </form>
    </dialog>
  </div>
</template>
<style scoped>
.education-dialog { width: min(640px, calc(100vw - 32px)); max-height: 88vh; padding: 25px; border: 1px solid #e2e8f0; border-radius: 18px; color: #0f172a; background: #fff; box-shadow: 0 24px 100px #0f172a33; }
.education-dialog::backdrop { background: #0f172a77; backdrop-filter: blur(3px); }
:global(.dark) .education-dialog { color: #f1f5f9; background: #14171d; border-color: #334155; }
</style>
