// eslint-disable-next-line no-unused-vars
import Vue from 'vue'
import {
  computed,
  // eslint-disable-next-line no-unused-vars
  markRaw, reactive,
  ref, toRefs,
  unref,
} from '@vue/composition-api'
import { indexById } from '@/utils/datastore/helpers'
import { useFetcher } from '@/activities/data/useFetcher'
// eslint-disable-next-line no-unused-vars
import { objectDiff } from '@/utils/utils'
import deepEqual from 'deep-equal'

function defaultEnrich (value) {
  return value
}

export function useCollection (params, fetcher, enrich = defaultEnrich) {
  const { status } = useFetcher(params, { fetcher, onInvalidate })

  // state

  const reactives = ref({})
  const entries = ref({})

  // getters

  const collection = computed(() => Object.keys(entries.value).map(id => entries.value[id]))

  // helpers

  function getById (id) {
    return Boolean(entries.value[id])
  }

  function objectDiffNoNewKeys (a, b) {
    const diff = {}
    for (const key of Object.keys(a)) {
      if (!deepEqual(a[key], b[key])) {
        diff[key] = b[key]
      }
    }
    return diff
  }

  // utilities

  function update (items) {
    // const newReactives = items.map(reactive)
    // reactives.value = { ...unref(reactives), ...indexById(newReactives) }
    for (const entry of items) {
      let reactiveEntry = reactives.value[entry.id]
      if (reactiveEntry) {
        // only update the individual properties that have changed
        // does not handle new keys... on purpose I guess... but wondering for the case of the pre-emptive fetching... maybe can
        // do Vue.set on those specifically... knowing they are pre-emptive objects...
        const diff = objectDiffNoNewKeys(reactiveEntry, entry)
        if (Object.keys(diff).length > 0) {
          console.log('object diff', diff)
          Object.assign(reactiveEntry, diff)
        }
      }
      else {
        reactiveEntry = reactive(entry)
        Vue.set(reactives.value, entry.id, reactiveEntry)
      }
      const existingEntry = entries.value[entry.id]
      if (existingEntry) {
        // do nothing? it should have updated
      }
      else {
        // const newEntry = reactive({
        //   ...reactiveEntry, // does this copy the reactiveness of the values??? probably not...
        //   enriched: computed(() => enrich(reactiveEntry)), // meh I don't want this inside it...
        // })
        // const newEntry = reactive(enrich(reactiveEntry)
        const newEntry = reactive({
          ...toRefs(reactiveEntry),
          ...enrich(reactiveEntry),
        })
        Vue.set(entries.value, entry.id, newEntry)
      }
    }
  }

  // eslint-disable-next-line no-unused-vars
  function updateOFF (items) {
    // entries.value = { ...unref(entries), ...indexById(items.map(enrich)) }
    // eslint-disable-next-line no-unreachable
    if (items.length > 10) {
      entries.value = { ...unref(entries), ...indexById(items.map(enrich)) }
    }
    else {
      for (const entry of items) {
        Vue.set(entries.value, entry.id, enrich(entry))
        // cannot update existing entry, because the computed parts would only have a reference to the original "entry", not the new one...
        // I wonder if I can make it reference itself?
        // console.log('updating entry', entry.id, entry)
        // const existingEntry = entries.value[entry.id]
        // if (existingEntry) {
        //   console.log('... existing! just updating props...', existingEntry, entry)
        //   Object.assign(existingEntry, entry)
        // }
        // else {
        //   Vue.set(entries.value, entry.id, enrich(entry))
        // }
      }
    }
  }

  function onInvalidate () {
    entries.value = {}
  }

  return {
    // getters
    collection,
    status,

    // helpers
    getById,

    // methods
    update,
  }
}