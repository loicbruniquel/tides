<template>
  <GraphVerticalLine v-if="lineX" :x="lineX" strokeColor="#aa0000" :strokeWidth="2" />
</template>

<script>
import GraphVerticalLine from './VerticalLine'

export default {
  components: {
    GraphVerticalLine
  },
  props: {
    dayStart: { type: Number, required: true },
    dayEnd: { type: Number, required: true }
  },
  data () {
    return {
      dt: null
    }
  },
  computed: {
    lineX () {
      if (!this.dt) {
        return null
      }
      let span = this.dayEnd - this.dayStart
      let fromStart = this.dt - this.dayStart
      let ratio = fromStart / span
      return ratio * 100
    }
  },
  methods: {
    refreshTime () {
      let date = new Date()
      this.dt = date.getTime() / 1000
      setTimeout(this.refreshTime, 5000)
    }
  },
  mounted () {
    this.refreshTime()
  }
}
</script>
