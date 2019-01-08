import { createDatastore } from '>/helpers'
import { pickupSeriesMock } from '>/mockdata'
import { makeStore, makePickupSeries } from '>/enrichedFactories'

describe('pickupSeries module', () => {
  beforeEach(() => jest.resetModules())

  describe('with vuex', () => {
    let datastore
    let series1 = pickupSeriesMock[0]

    beforeEach(() => {
      datastore = createDatastore({
        pickupSeries: require('./pickupSeries').default,
        pickups: { getters: { upcomingAndStarted: () => [] } },
        stores: { getters: { get: () => () => null } },
      })
    })

    beforeEach(() => {
      datastore.commit('pickupSeries/set', [series1])
    })

    it('can update series', () => {
      const changed = { ...series1, description: 'new description' }
      datastore.commit('pickupSeries/update', [changed])
      expect(datastore.getters['pickupSeries/get'](changed.id).description).toEqual(changed.description)
    })

    it('can delete series', () => {
      datastore.commit('pickupSeries/delete', series1.id)
      expect(datastore.getters['pickupSeries/get'](series1.id)).toBeUndefined()
    })
  })

  it('filters by active store', () => {
    const currentStore = makeStore({ isCurrentStore: true })
    const activeSeries = makePickupSeries({ store: currentStore })
    const inactiveStore = makeStore({ isCurrentStore: false })
    const inactiveSeries = makePickupSeries({ store: inactiveStore })
    const { getters } = require('./pickupSeries').default
    const otherGetters = {
      all: [activeSeries, inactiveSeries],
    }

    const result = getters.byCurrentStore(null, otherGetters)
    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(activeSeries.id)
  })
})
