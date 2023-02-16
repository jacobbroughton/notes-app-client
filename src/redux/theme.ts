import { createSlice } from "@reduxjs/toolkit";

type ThemeState = string;

const initialState: ThemeState = localStorage.getItem("theme") || "light";

const theme = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, { payload }) => {
      return payload;
    },
  },
});

export const { setTheme } = theme.actions;

export default theme.reducer;
