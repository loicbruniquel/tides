<template>
  <g>
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="highColor"/>
        <stop offset="100%" :stop-color="lowColor"/>
      </linearGradient>
    </defs>

    <path
      :d="svgPath(heightData)"
      fill="transparent"
      stroke="url(#gradient)"
      stroke-width="3"
      vector-effect="non-scaling-stroke" />
  </g>
</template>

<script>
import { svgPath } from 'src/utils/plot'

export default {
  name: 'GraphPath',
  props: {
    heightData: { type: Array, required: true },
    highColor: { type: String, required: true },
    lowColor: { type: String, required: true }
  },
  methods: {
    svgPath
  }
}
</script>
