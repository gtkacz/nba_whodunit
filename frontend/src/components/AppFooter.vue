<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
const copyrightYears = computed(() => {
  const startYear = 2025
  return startYear === currentYear.value ? startYear : `${startYear}-${currentYear.value}`
})
</script>

<template>
  <v-footer class="app-footer" color="surface-variant">
    <v-container>
      <v-row align="center" justify="space-between">
        <v-col cols="12" md="6" class="text-center text-md-left">
          <div class="text-body-2">
            &copy; {{ copyrightYears }} Gabriel Mitelman Tkacz. All rights reserved.
          </div>
        </v-col>

        <v-col cols="12" md="6" class="text-center text-md-right">
          <div class="text-body-2 text-medium-emphasis">
            Data sourced from
            <a
              href="https://basketball.realgm.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-decoration-none"
            >
              RealGM
            </a>
            and used under fair use.
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<style scoped lang="scss">
.app-footer {
  margin-top: auto;

  a {
    color: rgb(var(--v-theme-primary));
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
