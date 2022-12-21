import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useState } from "react";
import SearchIcon from "../components/ui/Icons/SearchIcon"

type SidebarState = {
  width: number
  view: object,
  viewOptions: object[],
  searchValue: string
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
  searchValue: ''
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
    setSearchValue: (state, { payload }) => {
      return {
        ...state,
        searchValue: payload
      }
    }
  },
});

export const { setSidebarWidth, setSidebarView, setSearchValue } = sidebarSlice.actions;
export default sidebarSlice.reducer;
