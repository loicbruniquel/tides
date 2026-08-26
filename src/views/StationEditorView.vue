<script setup lang="ts">
import { PhTrash } from '@phosphor-icons/vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import LocationPicker from '@/components/map/LocationPicker.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { useStationsStore } from '@/stores/stations'

const route = useRoute()
const router = useRouter()
const stations = useStationsStore()

const editingId = computed(() => (route.params.id ? String(route.params.id) : null))
const existing = computed(() => (editingId.value ? stations.byId(editingId.value) : undefined))

const name = ref(existing.value?.name ?? '')
const latitude = ref(existing.value?.latitude ?? 33.88)
const longitude = ref(existing.value?.longitude ?? -7.04)

const canSave = computed(
  () =>
    name.value.trim().length > 0 &&
    Number.isFinite(latitude.value) &&
    Number.isFinite(longitude.value),
)

function onMapMove(nextLatitude: number, nextLongitude: number) {
  latitude.value = nextLatitude
  longitude.value = nextLongitude
}

function save() {
  if (!canSave.value) return

  const data = {
    name: name.value.trim(),
    latitude: Number(latitude.value),
    longitude: Number(longitude.value),
  }

  const saved = editingId.value
    ? stations.update(editingId.value, data)
    : stations.add(data)

  void router.replace(saved ? `/stations/${saved.id}` : '/')
}

function remove() {
  if (!editingId.value) return
  stations.remove(editingId.value)
  void router.replace('/')
}
</script>

<template>
  <div class="fixed inset-0 flex flex-col">
    <div class="relative min-h-0 flex-1">
      <LocationPicker :latitude="latitude" :longitude="longitude" @move="onMapMove" />
    </div>

    <form
      class="safe-bottom border-t border-border bg-card px-4 pb-4 pt-3"
      @submit.prevent="save"
    >
      <div class="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <Input v-model="name" placeholder="Station name" aria-label="Station name" />

        <div class="flex items-center gap-3">
          <label class="flex-1 text-xs text-muted-foreground">
            Latitude
            <Input v-model.number="latitude" class="mt-1 tabular-nums" type="number" step="0.0001" />
          </label>
          <label class="flex-1 text-xs text-muted-foreground">
            Longitude
            <Input
              v-model.number="longitude"
              class="mt-1 tabular-nums"
              type="number"
              step="0.0001"
            />
          </label>
        </div>

        <div class="flex items-center gap-2">
          <Button
            v-if="editingId"
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Delete station"
            @click="remove"
          >
            <PhTrash class="text-destructive" />
          </Button>

          <Button type="button" variant="outline" class="flex-1" @click="router.back()">
            Cancel
          </Button>
          <Button type="submit" class="flex-1" :disabled="!canSave">Save</Button>
        </div>
      </div>
    </form>
  </div>
</template>
