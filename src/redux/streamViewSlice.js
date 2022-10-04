import { createSlice } from '@reduxjs/toolkit'

const initialState = { 
  streams: [],
  timelineRange: {
    min: 0,
    max: 0,
  },
}

const streamViewSlice = createSlice({
  name: 'streamView',
  initialState,
  reducers: {
  },
})

// export const { updateMasterTime } = streamViewSlice.actions
export default streamViewSlice.reducer