<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-toolbar-title>Test App</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col>
            <v-card>
              <v-card-title>Vuetify Test</v-card-title>
              <v-card-text>
                <p>If you see this card styled, Vuetify is working!</p>
                <v-btn color="primary">Primary Button</v-btn>
                <v-btn color="secondary">Secondary Button</v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col>
            <v-alert type="info">Info Alert</v-alert>
            <v-alert type="success">Success Alert</v-alert>
            <v-alert type="warning">Warning Alert</v-alert>
            <v-alert type="error">Error Alert</v-alert>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
</script>
