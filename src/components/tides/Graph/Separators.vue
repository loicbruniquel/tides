<template>
  <g class="lines">
    <GraphVerticalLine :x="25" :strokeColor="strokeColor" :strokeWidth="2" />
    <GraphVerticalLine :x="50" :strokeColor="strokeColor" :strokeWidth="2" />
    <GraphVerticalLine :x="75" :strokeColor="strokeColor" :strokeWidth="2" />

    <path
    d="M 0 50 L 100 50"
    fill="transparent"
    :stroke="strokeColor"
    :stroke-width="1"
    vector-effect="non-scaling-stroke" />
  </g>
</template>

<script>
import GraphVerticalLine from './VerticalLine'

export default {
  name: 'GraphSeparators',
  components: {
    GraphVerticalLine
  },
  props: {
    strokeColor: { type: String, default: '#ccc' },
    majorStrokeWidth: { type: Number, default: 5 },
    minorStrokeWidth: { type: Number, default: 3 }
  }
}
</script>

<style lang="scss" scoped>
.lines rect {
  opacity: 0.4;
}
</style>
