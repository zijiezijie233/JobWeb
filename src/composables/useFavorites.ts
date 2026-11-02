import { computed, ref, watch } from 'vue'
import { positions } from '@/data'

const FAV_KEY = 'sn-gwy-favorites-v1'
const CMP_KEY = 'sn-gwy-compare-v1'
export const MAX_COMPARE = 4

function read(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

const favIds = ref<string[]>(read(FAV_KEY))
const compareIds = ref<string[]>(read(CMP_KEY))

watch(favIds, (v) => localStorage.setItem(FAV_KEY, JSON.stringify(v)), { deep: true })
watch(compareIds, (v) => localStorage.setItem(CMP_KEY, JSON.stringify(v)), { deep: true })

const favSet = computed(() => new Set(favIds.value))
const compareSet = computed(() => new Set(compareIds.value))

export function useFavorites() {
  const favoritePositions = computed(() =>
    favIds.value.map((id) => positions.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p),
  )
  const comparePositions = computed(() =>
    compareIds.value.map((id) => positions.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p),
  )

  function isFavorite(id: string): boolean {
    return favSet.value.has(id)
  }

  function toggleFavorite(id: string): boolean {
    if (favSet.value.has(id)) {
      favIds.value = favIds.value.filter((v) => v !== id)
      compareIds.value = compareIds.value.filter((v) => v !== id)
      return false
    }
    favIds.value = [id, ...favIds.value]
    return true
  }

  function isCompared(id: string): boolean {
    return compareSet.value.has(id)
  }

  function toggleCompare(id: string): 'added' | 'removed' | 'full' | 'need-fav' {
    if (compareSet.value.has(id)) {
      compareIds.value = compareIds.value.filter((v) => v !== id)
      return 'removed'
    }
    if (!favSet.value.has(id)) return 'need-fav'
    if (compareIds.value.length >= MAX_COMPARE) return 'full'
    compareIds.value = [...compareIds.value, id]
    return 'added'
  }

  function clearCompare() {
    compareIds.value = []
  }

  function clearAll() {
    favIds.value = []
    compareIds.value = []
  }

  return {
    favIds,
    compareIds,
    favCount: computed(() => favIds.value.length),
    compareCount: computed(() => compareIds.value.length),
    favoritePositions,
    comparePositions,
    isFavorite,
    toggleFavorite,
    isCompared,
    toggleCompare,
    clearCompare,
    clearAll,
  }
}
