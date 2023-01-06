import { createSlice } from "@reduxjs/toolkit"

const colorPickerMenuSlice = createSlice({
  name: "colorPickerMenu",
  initialState: {
    toggled: false,
    selectedColor: null
  },
  reducers: {
    setColorPickerMenu: (state, { payload }) => {

      const { toggled } = payload

      return {
        ...state,
        toggled
      }
    }
  }
})

export default colorPickerMenuSlice.reducer
export const { setColorPickerMenu } = colorPickerMenuSlice.actions