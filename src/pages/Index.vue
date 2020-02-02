<template>
  <q-page class="index">
    <div class="head">
      <q-btn outline round color="primary" icon="add" to="/stations/new" />
    </div>
    <StationList />
  </q-page>
</template>

<script>
import StationList from 'components/stations/List.vue'

export default {
  name: 'PageIndex',
  components: {
    StationList
  },
  mounted () {
    this.$store.commit('pageTitle', 'Stations')
  }
}
</script>

<style lang="scss" scoped>
.head {
  padding: 20px;
  .q-btn {
    margin:0
  }
}
</style>
