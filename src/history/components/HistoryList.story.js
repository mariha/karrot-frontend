import { storiesOf } from '@storybook/vue3'
import { h } from 'vue'

import { storybookDefaults as defaults } from '>/helpers'
import { historyMock } from '>/mockdata'

import HistoryList from './HistoryList'

storiesOf('History List', module)
  .add('Default', () => defaults({
    render: () => h(HistoryList, {
      history: historyMock,
      status: { pending: false, hasValidationErrors: false },
      canFetchPast: true,
      fetchPast: () => {},
    }),
  }))
