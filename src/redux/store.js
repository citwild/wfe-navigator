import { configureStore } from '@reduxjs/toolkit'
// Import all reducers
import masterStateReducer from './masterStateSlice'
import streamViewReducer from './streamViewSlice'
import configReducer from './configSlice'

export default configureStore({
  reducer: {
    masterState: masterStateReducer,
    streamView: streamViewReducer,
    config: configReducer
  },
})