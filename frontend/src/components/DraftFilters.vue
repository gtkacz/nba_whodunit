<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { TeamAbbreviation } from '@/types/team'

interface DraftFiltersProps {
  availableYears?: number[]
  allPreDraftTeams?: string[]
}

const props = withDefaults(defineProps<DraftFiltersProps>(), {
  availableYears: () => [],
  allPreDraftTeams: () => []
})

// Team filter
const selectedTeam = defineModel<TeamAbbreviation | 'ALL'>('team', { required: true })
const teams = ref<TeamAbbreviation[]>([])
const loadingTeams = ref(true)

interface TeamOption {
  value: TeamAbbreviation | 'ALL'
  title: string
  logo?: string
}

const teamOptions = ref<TeamOption[]>([])

// Advanced filters with v-model
const yearRange = defineModel<[number, number]>('yearRange', { default: () => [1950, 2025] })
const selectedRounds = defineModel<number[]>('rounds', { default: [] })
const overallPickRange = defineModel<[number, number]>('overallPickRange', { default: () => [1, 420] })
const preDraftTeamSearch = defineModel<string>('preDraftTeam', { default: '' })
const tradeFilter = defineModel<'all' | 'traded' | 'not-traded'>('tradeFilter', { default: 'all' })

const minYear = computed(() => props.availableYears.length > 0 ? Math.min(...props.availableYears) : 1950)
const maxYear = computed(() => props.availableYears.length > 0 ? Math.max(...props.availableYears) : 2025)
const roundOptions = [1, 2, 3, 4, 5, 6, 7]

async function loadTeams() {
  try {
    const response = await fetch('/data/teams.json')
    const data = await response.json() as TeamAbbreviation[]
    teams.value = data

    teamOptions.value = [
      { value: 'ALL', title: 'All Teams' },
      ...data.map((abbr) => ({
        value: abbr,
        title: abbr,
        logo: `https://raw.githubusercontent.com/gtkacz/nba-logo-api/main/icons/${abbr.toLowerCase()}.svg`
      }))
    ]
  } catch (error) {
    console.error('Failed to load teams:', error)
  } finally {
    loadingTeams.value = false
  }
}

const hasInitializedYearRange = ref(false)

watch(() => props.availableYears, (newYears) => {
  if (newYears.length > 0 && !hasInitializedYearRange.value) {
    // Only update if we haven't initialized yet and still at default values
    if (yearRange.value[0] === 1950 && yearRange.value[1] === 2025) {
      const newMin = Math.min(...newYears)
      const newMax = Math.max(...newYears)
      hasInitializedYearRange.value = true
      yearRange.value = [newMin, newMax]
    }
  }
}, { immediate: true })

onMounted(() => {
  loadTeams()
})
</script>

<template>
  <v-expansion-panels variant="accordion">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <v-icon icon="mdi-filter-variant" class="mr-2" />
        Advanced Filters
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row dense>
          <!-- Team Filter -->
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedTeam"
              :items="teamOptions"
              :loading="loadingTeams"
              label="Team"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="mdi-basketball"
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps">
                  <template #prepend v-if="item.raw.logo">
                    <v-avatar size="28" class="mr-2" rounded="0">
                      <v-img :src="item.raw.logo" :alt="item.raw.title" contain />
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>

              <template #selection="{ item }">
                <div class="d-flex align-center">
                  <v-avatar v-if="item.raw.logo" size="24" class="mr-2" rounded="0">
                    <v-img :src="item.raw.logo" :alt="item.raw.title" contain />
                  </v-avatar>
                  <span>{{ item.raw.title }}</span>
                </div>
              </template>
            </v-select>
          </v-col>

          <!-- Year Range Filter -->
          <v-col cols="12" md="6">
            <div class="px-2">
              <label class="text-caption text-medium-emphasis mb-2 d-block">Year Range</label>
              <v-range-slider
                v-model="yearRange"
                :min="minYear"
                :max="maxYear"
                :step="1"
                thumb-label="always"
                hide-details
                color="primary"
                class="mt-4"
              />
            </div>
          </v-col>

          <!-- Round Filter -->
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedRounds"
              :items="roundOptions"
              label="Rounds"
              variant="outlined"
              density="compact"
              multiple
              chips
              hide-details
              prepend-inner-icon="mdi-numeric"
            />
          </v-col>

          <!-- Overall Pick Range -->
          <v-col cols="12" md="6">
            <div class="px-2">
              <label class="text-caption text-medium-emphasis mb-2 d-block">Overall Pick Range</label>
              <v-range-slider
                v-model="overallPickRange"
                :min="1"
                :max="420"
                :step="1"
                thumb-label="always"
                hide-details
                color="primary"
                class="mt-4"
              />
            </div>
          </v-col>

          <!-- Pre-Draft Team Search -->
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="preDraftTeamSearch"
              :items="allPreDraftTeams"
              label="Pre-Draft Team"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              prepend-inner-icon="mdi-school"
            />
          </v-col>

          <!-- Trade Filter -->
          <v-col cols="12" md="6">
            <v-select
              v-model="tradeFilter"
              :items="[
                { value: 'all', title: 'All Picks' },
                { value: 'traded', title: 'Traded Only' },
                { value: 'not-traded', title: 'Not Traded' }
              ]"
              label="Trade Status"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="mdi-swap-horizontal"
            />
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<style scoped lang="scss">
:deep(.v-avatar img),
:deep(.v-avatar .v-img__img) {
  object-fit: contain !important;
}
</style>
