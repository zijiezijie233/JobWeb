<script setup lang="ts">
import { computed } from 'vue'
import type { Position } from '@/types'
import { checkEligibility, highestEducation, statusLabels, type CheckStatus } from '@/utils/eligibility'
import { useApplicantProfile } from '@/composables/useApplicantProfile'
const props = defineProps<{ position: Position }>()
const { profile } = useApplicantProfile()
const highest = computed(() => highestEducation(profile.value))
const rows = computed(() => checkEligibility(props.position, profile.value))
const conflicts = computed(() => rows.value.filter(r => r.status === 'mismatch').length)
const unresolved = computed(() => rows.value.filter(r => r.status === 'missing' || r.status === 'pending').length)
function color(status: CheckStatus) {
  return status === 'mismatch' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200' : status === 'pass' || status === 'unrestricted' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
}
</script>
<template>
  <section class="surface mt-5 p-5 sm:p-6" aria-labelledby="eligibility-heading">
    <div class="flex flex-wrap items-center justify-between gap-3"><div><h2 id="eligibility-heading" class="text-base font-semibold">我的资格核对表</h2><p class="mt-1 text-xs text-slate-500">依据岗位字段与已保存的个人档案逐项核对，不生成匹配分数。</p></div><router-link :to="{ path: '/profile', query: { returnTo: `/position/${position.id}` } }" class="btn-primary">{{ profile.updatedAt ? '修改报考档案' : '建立报考档案' }}</router-link></div>
    <div class="mt-4 rounded-lg bg-slate-50 p-4 text-xs leading-6 dark:bg-slate-800/50"><p>默认按最高学历核对：<strong>{{ highest.level || '尚未填写' }}{{ highest.major ? ' · ' + highest.major : '' }}</strong><span v-if="highest.studyStatus === '在读 / 应届预计取得'">（预计取得，需确认期限）</span>。{{ profile.updatedAt ? '使用已保存档案，所有个人情况均为自报。' : '尚未保存档案，请先填写；缺失信息不会被当作符合。' }}</p><p class="mt-1"><span v-if="conflicts" class="font-semibold text-red-700 dark:text-red-300">发现 {{ conflicts }} 项条件冲突。</span><span v-else>暂未识别到明确冲突，不代表符合全部报考条件。</span> 仍有 {{ unresolved }} 项资料待补充或需要人工确认。</p></div>
    <div class="mt-4 overflow-x-auto"><table class="w-full min-w-[700px] text-left text-xs"><thead class="bg-slate-50 text-slate-500 dark:bg-slate-800"><tr><th class="p-3">条件</th><th class="p-3">岗位依据（原文 / 字段）</th><th class="p-3">用户情况</th><th class="p-3">核对结果及原因</th></tr></thead><tbody><tr v-for="row in rows" :key="row.label" class="border-b border-slate-100 align-top dark:border-slate-800"><th class="w-24 p-3 font-medium">{{ row.label }}</th><td class="max-w-xs p-3 leading-6">{{ row.requirement }}</td><td class="max-w-40 break-words p-3 leading-6">{{ row.actual }}</td><td class="max-w-sm p-3"><span class="chip" :class="color(row.status)">{{ statusLabels[row.status] }}</span><p class="mt-2 leading-6 text-slate-500 dark:text-slate-400">{{ row.reason }}</p></td></tr></tbody></table></div>
    <p v-if="profile.preferredCity" class="mt-4 text-xs text-slate-500">城市偏好：{{ profile.preferredCity }}；岗位所在地：{{ position.city }}。{{ profile.preferredCity === position.city ? '符合当前偏好。' : '与当前偏好不同，但不会据此判定资格不符。' }}</p>
    <p class="mt-4 text-xs leading-6 text-amber-700 dark:text-amber-300">仅为规则辅助，不是资格审查结论。专业目录、应届认定、年龄基准日、证书取得期限和其他特殊条件需查阅对应批次公告并咨询招录机关。当前岗位是示例，不能据此报考。</p>
  </section>
</template>
