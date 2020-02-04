<template>
  <div :style="styles" class="extreme-badge" >
    {{displayTime}}
  </div>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'GraphExtremeBadge',
  props: {
    extreme: { type: Object, required: true },
    highColor: { type: String, required: true },
    lowColor: { type: String, required: true }
  },
  computed: {
    isLow () {
      return this.extreme.type === 'Low'
    },
    styles () {
      return {
        backgroundColor: this.isLow ? this.lowColor : this.highColor,
        position: 'absolute',
        left: this.extreme.x + '%',
        top: this.extreme.y + '%',
        transform: `translateX(-50%) translateY(${this.extreme.type === 'High' ? -125 : 25}%)`
      }
    },
    displayTime () {
      let dt = new Date(this.extreme.dt * 1000)
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
