import { createSlice } from '@reduxjs/toolkit'

const initialState = { 
  mediaSourceDir: "",
  dbQueryFields: []
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {

  },
})

// export const { updateMasterTime } = configSlice.actions
export default configSlice.reducer