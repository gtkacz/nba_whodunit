import { ref, computed } from 'vue'
import type { DraftPick } from '@/types/draft'
import type { TeamAbbreviation } from '@/types/team'
import { parseCSV } from '@/utils/csvParser'
import { getDataUrl } from '@/utils/dataUrl'

const allDraftPicks = ref<DraftPick[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useDraftData() {
  const selectedTeam = ref<TeamAbbreviation | 'ALL'>('ALL')
  const selectedYear = ref<number | 'ALL'>('ALL')
  const yearRange = ref<[number, number]>([1950, 2025])
  const selectedRounds = ref<number[]>([])
  const overallPickRange = ref<[number, number]>([1, 420])
  const preDraftTeamSearch = ref('')
  const tradeFilter = ref<'all' | 'traded' | 'not-traded'>('all')

  const allPreDraftTeams = computed(() => {
    const teams = new Set<string>()
    allDraftPicks.value.forEach(pick => {
      if (pick.preDraftTeam && pick.preDraftTeam.trim() !== '') {
        teams.add(pick.preDraftTeam)
      }
    })
    return Array.from(teams).sort()
  })

  const filteredData = computed(() => {
    let filtered = allDraftPicks.value

    // Team filter
    if (selectedTeam.value !== 'ALL') {
      filtered = filtered.filter(pick => pick.team === selectedTeam.value)
    }

    // Year filter (exact year) - only if not using range
    if (selectedYear.value !== 'ALL') {
      filtered = filtered.filter(pick => pick.year === selectedYear.value)
    } else if (yearRange.value && yearRange.value.length === 2) {
      // Year range filter
      const [minYear, maxYear] = yearRange.value
      filtered = filtered.filter(pick => pick.year >= minYear && pick.year <= maxYear)
    }

    // Round filter
    if (selectedRounds.value.length > 0) {
      filtered = filtered.filter(pick => selectedRounds.value.includes(pick.round))
    }

    // Overall pick range filter
    if (overallPickRange.value && overallPickRange.value.length === 2) {
      const [minOverall, maxOverall] = overallPickRange.value
      // Only filter if not at default full range
      if (minOverall !== 1 || maxOverall !== 420) {
        filtered = filtered.filter(pick => {
          // Calculate overall pick: (round - 1) * 30 + pick
          const overallPick = (pick.round - 1) * 30 + pick.pick
          return overallPick >= minOverall && overallPick <= maxOverall
        })
      }
    }

    // Pre-draft team filter
    if (preDraftTeamSearch.value && preDraftTeamSearch.value.trim() !== '') {
      const searchTerm = preDraftTeamSearch.value.toLowerCase()
      filtered = filtered.filter(pick =>
        pick.preDraftTeam?.toLowerCase().includes(searchTerm)
      )
    }

    // Trade filter
    if (tradeFilter.value === 'traded') {
      filtered = filtered.filter(pick => pick.draftTrades && pick.draftTrades.trim() !== '')
    } else if (tradeFilter.value === 'not-traded') {
      filtered = filtered.filter(pick => !pick.draftTrades || pick.draftTrades.trim() === '')
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
          const response = await fetch(getDataUrl(`csv/${team}.csv`))
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
    yearRange,
    selectedRounds,
    overallPickRange,
    preDraftTeamSearch,
    tradeFilter,
    filteredData,
    allPreDraftTeams,
    loading,
    error,
    loadAllTeamData
  }
}
