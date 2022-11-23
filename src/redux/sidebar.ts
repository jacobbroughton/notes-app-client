import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useState } from "react";

type SidebarState = {
  width: number
};

const initialState: SidebarState = {
  width: 225
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSidebarWidth: (state, { payload }: PayloadAction<SidebarState>) => {
      if (payload > (state.width + 2)) {
        return {
          ...state,
          width: state.width + 3
        }
      } else if (payload < (state.width - 2)) {
        return {
          ...state,
          width: state.width - 3
        }
      }
      return {
        ...state,
        width: payload
      }
    },
  },
});

export const { setSidebarWidth } = sidebarSlice.actions;
export default sidebarSlice.reducer;
