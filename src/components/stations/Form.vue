<template>
  <q-form @submit="save" class="q-gutter-md" >
    <q-input v-model="editingStation.name" label="Name" />
    <q-input v-model="editingStation.latitude" label="Latitude" />
    <q-input v-model="editingStation.longitude" label="Longitude" />
  <div>
  <q-btn label="Submit" type="submit" color="primary"/>
  </div>
  </q-form>

</template>

<script>
export default {
  name: 'StationForm',
  props: {
    value: { type: Object, required: false }
  },
  data () {
    return {
      editingStation: JSON.parse(JSON.stringify(this.value))
    }
  },
  methods: {
    save () {
      this.$emit('save', this.editingStation)
    }
  }
}
</script>

<style>

</style>
