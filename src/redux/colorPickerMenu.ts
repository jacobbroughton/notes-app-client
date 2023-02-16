import { createSlice } from "@reduxjs/toolkit";
import { ColorPickerState } from "../types";

const initialState: ColorPickerState = {
  toggled: false,
};

const colorPickerMenuSlice = createSlice({
  name: "colorPickerMenu",
  initialState,
  reducers: {
    setColorPickerMenu: (state, { payload }) => {
      const { toggled } = payload;

      return {
        ...state,
        toggled,
      };
    },
  },
});

export default colorPickerMenuSlice.reducer;
export const { setColorPickerMenu } = colorPickerMenuSlice.actions;
