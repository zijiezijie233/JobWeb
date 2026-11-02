import { ref } from 'vue'

const KEY = 'sn-gwy-theme-v1'

function initial(): 'light' | 'dark' {
  const saved = localStorage.getItem(KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return 'light'
}

const theme = ref<'light' | 'dark'>(initial())

function apply(next: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', next === 'dark')
  document.documentElement.style.colorScheme = next
}

apply(theme.value)

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(KEY, theme.value)
    apply(theme.value)
  }
  return { theme, toggleTheme }
}
