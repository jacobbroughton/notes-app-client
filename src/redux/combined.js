import { createSlice } from "@reduxjs/toolkit"

const combinedSlice = createSlice({
  name: "combined",
  initialState: [],
  reducers: {
    setCombined: (state, { payload }) => {
      return payload
    } 
  }
})

export default combinedSlice.reducer
export const { setCombined } = combinedSlice.actions