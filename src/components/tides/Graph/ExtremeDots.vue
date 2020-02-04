<template>
  <g>
    <ellipse
      v-for="point in extremes"
      :key="`${point.x}-${[point.y]}`"
      :cx="point.x"
      :cy="point.y"
      :rx="dotWidth"
      :ry="dotHeight"
      stroke-width="0"
      :fill="fillColor(point)" />
  </g>
</template>

<script>
export default {
  name: 'GraphExtremeDots',
  props: {
    extremes: { type: Array, required: true },
    highColor: { type: String, required: true },
    lowColor: { type: String, required: true },
    dotWidth: { type: Number, required: true },
    dotHeight: { type: Number, required: true }
  },
  methods: {
    fillColor (extreme) {
      return extreme.type === 'Low' ? this.lowColor : this.highColor
    }
  }
}
</script>
