<template>
  <div class="date-control">
    <q-btn @click="previous" outline round color="primary" icon="arrow_left" />
    <q-btn class="date-button" flat icon="calendar_today" :label="displayDate" @click="showDatepicker = true" />
    <q-btn @click="next" outline round color="primary" icon="arrow_right" />

    <q-dialog v-model="showDatepicker">
      <q-card>
        <q-card-section>
          <q-date v-model="datepickerDate" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'DateControl',
  props: {
    value: { type: Date, required: true }
  },
  data () {
    return {
      date: this.value,
      showDatepicker: false
    }
  },
  watch: {
    date (newValue) {
      this.$emit('input', newValue)
    }
  },
  computed: {
    displayDate () {
      return date.formatDate(this.date, 'dddd Do MMMM')
    },
    datepickerDate: {
      get () {
        return date.formatDate(this.date, 'YYYY/MM/DD')
      },
      set (val) {
        this.date = date.extractDate(val, 'YYYY/MM/DD')
        this.showDatepicker = false
      }
    }
  },
  methods: {
    previous () {
      this.date = date.subtractFromDate(this.date, { days: 1 })
    },
    next () {
      this.date = date.addToDate(this.date, { days: 1 })
    }
  }
}
</script>

<style lang="scss" scoped>
.date-control {
  text-align: center;
  display: flex;
  flex-direction: row;
  padding: 0 10px;
  .date-button {
    flex: 1;
    margin: 0 10px;
  }
}
</style>
