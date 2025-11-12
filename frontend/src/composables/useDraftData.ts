import { ref, computed } from 'vue'
import type { DraftPick } from '@/types/draft'
import type { TeamAbbreviation } from '@/types/team'
import { parseCSV } from '@/utils/csvParser'

const allDraftPicks = ref<DraftPick[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useDraftData() {
  const selectedTeam = ref<TeamAbbreviation | 'ALL'>('ALL')
  const selectedYear = ref<number | 'ALL'>('ALL')

  const filteredData = computed(() => {
    let filtered = allDraftPicks.value

    if (selectedTeam.value !== 'ALL') {
      filtered = filtered.filter(pick => pick.team === selectedTeam.value)
    }

    if (selectedYear.value !== 'ALL') {
      filtered = filtered.filter(pick => pick.year === selectedYear.value)
    }

    return filtered
  })

  async function loadAllTeamData(teams: TeamAbbreviation[]) {
    loading.value = true
    error.value = null

    try {
      const picks: DraftPick[] = []

      for (const team of teams) {
        try {
          const response = await fetch(`/data/csv/${team}.csv`)
          if (!response.ok) {
            console.error(`Failed to fetch ${team}.csv:`, response.status)
            continue
          }
          const csvText = await response.text()
          const teamPicks = await parseCSV(csvText, team)
          picks.push(...teamPicks)
        } catch (teamErr) {
          console.error(`Error loading ${team}:`, teamErr)
        }
      }

      allDraftPicks.value = picks
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load draft data'
      console.error('Error loading draft data:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    selectedTeam,
    selectedYear,
    filteredData,
    loading,
    error,
    loadAllTeamData
  }
}
