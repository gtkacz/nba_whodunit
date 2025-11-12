<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TeamAbbreviation } from '@/types/team'
import { getDataUrl } from '@/utils/dataUrl'

const selectedTeam = defineModel<TeamAbbreviation | 'ALL'>({ required: true })

const teams = ref<TeamAbbreviation[]>([])
const loading = ref(true)

interface TeamOption {
  value: TeamAbbreviation | 'ALL'
  title: string
  logo?: string
}

const teamOptions = ref<TeamOption[]>([])

async function loadTeams() {
  try {
    const response = await fetch(getDataUrl('teams.json'))
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
    loading.value = false
  }
}

onMounted(() => {
  loadTeams()
})
</script>

<template>
  <v-select
    v-model="selectedTeam"
    :items="teamOptions"
    :loading="loading"
    label="Filter by Team"
    variant="outlined"
    density="comfortable"
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
</template>

<style scoped lang="scss">
:deep(.v-avatar img),
:deep(.v-avatar .v-img__img) {
  object-fit: contain !important;
}
</style>
