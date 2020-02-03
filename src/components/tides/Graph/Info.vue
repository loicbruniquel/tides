<template>
  <div class="info flex">
    <span class="time">{{displayTime}}</span>
    <span class="height">{{displayHeight}} m</span>
  </div>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'GraphInfo',
  props: {
    dt: { type: Number },
    height: { type: Number }
  },
  computed: {
    displayTime () {
      let dt = new Date(this.dt * 1000)
      return date.formatDate(dt, 'HH:mm')
    },
    displayHeight () {
      return this.height.toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
.info {
  background-color: white;
  padding: 10px;
  border-radius: 10px;
  .time {
    font-weight: bold;
    margin-right: 10px;
  }
}
</style>
