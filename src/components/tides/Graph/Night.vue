<template>
  <g>
    <rect
      x="0"
      y="-10"
      :width="sunrise"
      height="120"
      fill="#ccc" />

    <rect
      :x="sunset"
      y="-10"
      :width="100-sunset"
      height="120"
      fill="#ccc" />
  </g>
</template>

<script>
export default {
  name: 'GraphNight',
  props: {
    sunrise: { type: Number, required: true },
    sunset: { type: Number, required: true }
  }
}
</script>
