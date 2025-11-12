<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  continue: []
}>()

const visible = ref(true)

function handleContinue() {
  visible.value = false
  setTimeout(() => {
    emit('continue')
  }, 300)
}
</script>

<template>
  <v-overlay
    :model-value="visible"
    class="splash-screen"
    persistent
    scrim="rgba(0, 0, 0, 0.7)"
  >
    <v-card
      class="splash-content"
      elevation="12"
      max-width="600"
    >
      <v-card-title class="text-h3 text-center pa-8">
        True Draft History
      </v-card-title>

      <v-card-text class="text-body-1 text-center px-8 pb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
      </v-card-text>

      <v-card-actions class="justify-center pb-8">
        <v-btn
          color="primary"
          size="large"
          variant="elevated"
          @click="handleContinue"
        >
          Continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-overlay>
</template>

<style scoped lang="scss">
.splash-screen {
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
