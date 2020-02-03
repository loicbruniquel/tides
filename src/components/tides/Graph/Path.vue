<template>
  <path
    :d="svgPath(heightData)"
    fill="transparent"
    stroke="red"
    stroke-width="3"
    vector-effect="non-scaling-stroke" />
</template>

<script>
import { svgPath } from 'src/utils/plot'

export default {
  name: 'GraphPath',
  props: {
    heightData: { type: Array, required: true }
  },
  methods: {
    svgPath
  }
}
</script>
