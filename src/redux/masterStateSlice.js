import { createSlice } from '@reduxjs/toolkit'

const initialState = { 
  masterTime: 0,
  playing: false, 
  playbackSpeed: 1,
}

const masterStateSlice = createSlice({
  name: 'masterState',
  initialState,
  reducers: {
    updateMasterTime: (state, action) => {
      state.value += action.payload
    },
  },
})

export const { updateMasterTime } = masterStateSlice.actions
export default masterStateSlice.reducer