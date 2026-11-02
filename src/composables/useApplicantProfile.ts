import { ref } from 'vue'
import { emptyProfile, normalizeProfile, type ApplicantProfile } from '@/utils/eligibility'
const key = 'sn-applicant-profile-v1'
function load(): ApplicantProfile {
  try {
    const p = JSON.parse(localStorage.getItem(key) || 'null')
    return normalizeProfile(p)
  } catch { return emptyProfile() }
}
const profile = ref<ApplicantProfile>(load())
export function useApplicantProfile() {
  function saveProfile(value: ApplicantProfile): boolean {
    const next = { ...value, updatedAt: new Date().toISOString() }
    try { localStorage.setItem(key, JSON.stringify(next)); profile.value = next; return true } catch { return false }
  }
  function clearProfile(): boolean {
    try { localStorage.removeItem(key); profile.value = emptyProfile(); return true } catch { return false }
  }
  return { profile, saveProfile, clearProfile }
}
