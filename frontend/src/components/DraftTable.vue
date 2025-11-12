<script setup lang="ts">
import { computed } from 'vue'
import type { DraftPick } from '@/types/draft'

interface DraftTableProps {
  data: DraftPick[]
  loading?: boolean
}

const props = withDefaults(defineProps<DraftTableProps>(), {
  loading: false
})

const headers = [
  { title: 'Team', key: 'team', sortable: true, minWidth: '140px' },
  { title: 'Year', key: 'year', sortable: true, width: '80px' },
  { title: 'Round', key: 'round', sortable: true, width: '80px' },
  { title: 'Pick', key: 'pick', sortable: true, width: '70px' },
  { title: 'Player', key: 'player', sortable: true, minWidth: '150px' },
  { title: 'Pos', key: 'position', sortable: true, width: '70px' },
  { title: 'HT', key: 'height', sortable: true, width: '70px' },
  { title: 'WT', key: 'weight', sortable: true, width: '70px' },
  { title: 'Age', key: 'age', sortable: true, width: '70px' },
  { title: 'Pre-Draft Team', key: 'preDraftTeam', sortable: true, minWidth: '120px' },
  { title: 'Class', key: 'class', sortable: true, width: '80px' },
  { title: 'Draft Trades', key: 'draftTrades', sortable: false, minWidth: '200px' },
  { title: 'YOS', key: 'yearsOfService', sortable: true, width: '70px' }
]

const items = computed(() => props.data)

function getTeamLogoUrl(team: string): string {
  return `https://raw.githubusercontent.com/gtkacz/nba-logo-api/main/icons/${team.toLowerCase()}.svg`
}

function parseTradeChain(trades: string | null): { original: string; final: string } | null {
  if (!trades) return null

  // Parse trade chain format like "X traded to Y traded to Z"
  const parts = trades.split('traded to').map(t => t.trim())

  if (parts.length < 2) return null

  return {
    original: parts[0],
    final: parts[parts.length - 1]
  }
}

function parseDraftTrades(trades: string | null): string[] {
  if (!trades) return []
  return trades.split(',').map(t => t.trim()).filter(t => t)
}
</script>

<template>
  <v-card elevation="2" class="draft-table">
    <v-card-title class="d-flex align-center">
      <v-avatar size="32" class="mr-2">
        <v-img
          src="https://raw.githubusercontent.com/gtkacz/nba-logo-api/main/icons/nba.svg"
          alt="NBA"
          cover
        />
      </v-avatar>
      NBA Draft History
      <v-chip class="ml-2" color="primary" size="small" variant="flat">
        {{ items.length }} picks
      </v-chip>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-per-page="50"
      :items-per-page-options="[
        { value: 25, title: '25' },
        { value: 50, title: '50' },
        { value: 100, title: '100' },
        { value: 250, title: '250' },
        { value: 500, title: '500' },
        { value: -1, title: 'All' }
      ]"
      items-per-page-text="Picks per page:"
      density="comfortable"
      hover
    >
      <template #item.team="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="32" class="mr-2">
            <v-img
              :src="getTeamLogoUrl(item.team)"
              :alt="item.team"
              cover
            />
          </v-avatar>
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.team }}</span>
            <span
              v-if="parseTradeChain(item.draftTrades)"
              class="text-caption text-medium-emphasis"
            >
              (via {{ parseTradeChain(item.draftTrades)!.original }})
            </span>
          </div>
        </div>
      </template>

      <template #item.player="{ item }">
        <span class="font-weight-bold text-primary">{{ item.player }}</span>
      </template>

      <template #item.position="{ item }">
        <v-chip size="small" variant="tonal" color="secondary">
          {{ item.position || '-' }}
        </v-chip>
      </template>

      <template #item.height="{ item }">
        <span class="text-body-2">{{ item.height || '-' }}</span>
      </template>

      <template #item.weight="{ item }">
        <span class="text-body-2">{{ item.weight ? `${item.weight} lbs` : '-' }}</span>
      </template>

      <template #item.age="{ item }">
        <v-chip size="small" variant="outlined">
          {{ item.age || '-' }}
        </v-chip>
      </template>

      <template #item.preDraftTeam="{ item }">
        <span class="text-medium-emphasis">{{ item.preDraftTeam || '-' }}</span>
      </template>

      <template #item.class="{ item }">
        <v-chip
          size="small"
          :color="item.class === 'FR' ? 'success' : item.class === 'SO' ? 'info' : item.class === 'JR' ? 'warning' : 'default'"
          variant="tonal"
        >
          {{ item.class || '-' }}
        </v-chip>
      </template>

      <template #item.draftTrades="{ item }">
        <div v-if="item.draftTrades" class="trade-chain">
          <v-chip
            v-for="(trade, index) in parseDraftTrades(item.draftTrades)"
            :key="index"
            size="small"
            variant="outlined"
            color="warning"
            class="mr-1 mb-1"
          >
            <v-icon start icon="mdi-swap-horizontal" size="x-small" />
            {{ trade }}
          </v-chip>
        </div>
        <span v-else class="text-medium-emphasis">-</span>
      </template>

      <template #item.yearsOfService="{ item }">
        <v-chip
          size="small"
          :color="item.yearsOfService > 10 ? 'success' : item.yearsOfService > 5 ? 'info' : 'default'"
          variant="flat"
        >
          {{ item.yearsOfService || 0 }}
        </v-chip>
      </template>

      <template #loading>
        <v-skeleton-loader type="table-row@10" />
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <v-icon icon="mdi-information-outline" size="48" color="info" class="mb-2" />
          <p class="text-h6">No draft picks found</p>
          <p class="text-body-2 text-medium-emphasis">Try adjusting your filters</p>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped lang="scss">
.draft-table {
  :deep(.v-data-table) {
    font-size: 0.875rem;
  }

  :deep(.v-data-table-header) {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }

  :deep(.v-data-table__th) {
    font-weight: 600;
    white-space: nowrap;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
  }

  :deep(.v-data-table__td) {
    white-space: nowrap;
  }

  :deep(.v-data-table__tr:hover) {
    background-color: rgba(var(--v-theme-primary), 0.03);
  }

  .trade-chain {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-width: 300px;
  }
}
</style>
