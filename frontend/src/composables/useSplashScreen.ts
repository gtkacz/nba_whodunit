import { ref, onMounted } from 'vue'

const SPLASH_STORAGE_KEY = 'nba-draft-splash-seen'

export function useSplashScreen() {
  const showSplash = ref(false)

  function checkFirstVisit(): boolean {
    const seen = localStorage.getItem(SPLASH_STORAGE_KEY)
    return seen !== 'true'
  }

  function markSplashSeen() {
    localStorage.setItem(SPLASH_STORAGE_KEY, 'true')
    showSplash.value = false
  }

  onMounted(() => {
    showSplash.value = checkFirstVisit()
  })

  return {
    showSplash,
    markSplashSeen
  }
}
