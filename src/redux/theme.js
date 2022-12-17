import { createSlice } from '@reduxjs/toolkit'
import { loadState } from "../utils/localStorage"

const initialState = localStorage.getItem("theme") || 'light'

const theme = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, { payload }) => {
      console.log(payload)
      return payload
    }
  }
});

export const { setTheme } = theme.actions

export default theme.reducer