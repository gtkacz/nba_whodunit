<script setup lang="ts">
import { computed } from 'vue'

const selectedYear = defineModel<number | 'ALL'>({ required: true })

interface YearFilterProps {
  availableYears?: number[]
}

const props = withDefaults(defineProps<YearFilterProps>(), {
  availableYears: () => []
})

interface YearOption {
  value: number | 'ALL'
  title: string
}

const yearOptions = computed<YearOption[]>(() => {
  const sorted = [...props.availableYears].sort((a, b) => b - a)
  return [
    { value: 'ALL', title: 'All Years' },
    ...sorted.map((year) => ({
      value: year,
      title: year.toString()
    }))
  ]
})
</script>

<template>
  <v-select
    v-model="selectedYear"
    :items="yearOptions"
    label="Filter by Year"
    variant="outlined"
    density="comfortable"
    hide-details
    prepend-inner-icon="mdi-calendar-range"
  />
</template>
