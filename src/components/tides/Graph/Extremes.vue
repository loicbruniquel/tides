<template>
  <div class="extremes">
    <div
      v-for="extreme in extremes"
      :key="extreme.dt"
      :style="styles(extreme)"
      class="extreme-badge" >
      {{displayTime(extreme)}}
    </div>
  </div>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'GraphExtreme',
  props: {
    extremes: { type: Array, required: true }
  },
  methods: {
    styles (extreme) {
      return {
        position: 'absolute',
        left: extreme.x + '%',
        top: extreme.y + '%',
        transform: `translateX(-50%) translateY(${extreme.type === 'High' ? -125 : 25}%)`
      }
    },
    displayTime (extreme) {
      let dt = new Date(extreme.dt * 1000)
      return date.formatDate(dt, 'HH:mm')
    }
  }
}
</script>

<style lang="scss" scoped>
.extreme-badge {
  background-color: blue;
  padding: 3px 5px;
  font-weight: bold;
  border-radius: 4px;
  color: white;
}
</style>
