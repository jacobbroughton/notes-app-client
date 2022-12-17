import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useState } from "react";
import SearchIcon from "../components/ui/Icons/SearchIcon"

type SidebarState = {
  width: number
  view: object,
  viewOptions: object[]
};

const viewOptionsForState = [
  {
    id: 1,
    name: "Notes",
  },
  {
    id: 2,
    name: "Search",
  },
];

const initialState: SidebarState = {
  width: 275,
  view: viewOptionsForState[0],
  viewOptions: viewOptionsForState,
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
    setSidebarView: (state, { payload }) => {
      if (!viewOptionsForState.find((option) => option.id === payload.id)) return state;

      return {
        ...state,
        view: payload,
      };
    },
  },
});

export const { setSidebarWidth, setSidebarView } = sidebarSlice.actions;
export default sidebarSlice.reducer;
