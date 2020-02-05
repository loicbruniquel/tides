<template>
  <path
    :d="svgPath"
    fill="transparent"
    :stroke="strokeColor"
    :stroke-width="strokeWidth"
    vector-effect="non-scaling-stroke" />

</template>

<script>
export default {
  name: 'GraphVerticalLine',
  props: {
    x: { type: Number, required: true },
    strokeColor: { type: String, default: '#ccc' },
    strokeWidth: { type: Number, default: 3 }
  },
  computed: {
    svgPath () {
      return `M${this.x} -10 L${this.x} 120`
    }
  }
}
</script>
