import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useState } from "react";
import SearchIcon from "../components/ui/Icons/SearchIcon";

type SidebarState = {
  width: number;
  view: object;
  viewOptions: object[];
  searchValue: string;
  shiftClickItems: object;
  newTagFormToggled: boolean;
  dragToggled: boolean;
  draggedOverItem: object;
  grabbedItem: object,
  inputPosition: object,
  renameInputToggled: boolean,
  newNameForRename: string,
  newPageName: string,
  newFolderName: string
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
  {
    id: 3,
    name: "Tags",
  },
];

const initialState: SidebarState = {
  width: 275,
  view: viewOptionsForState[0],
  viewOptions: viewOptionsForState,
  searchValue: "",
  shiftClickItems: { start: null, end: null, list: [] },
  newTagFormToggled: false,
  dragToggled: false,
  draggedOverItem: {
    ID: null,
    PAGE_ID: null,
  },
  grabbedItem: null,
  inputPosition: {
    referenceId: null,
    toggled: false,
    forFolder: false,
  },
  renameInputToggled: false,
  newNameForRename: '',
  newPageName: '',
  newFolderName: ''
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSidebarWidth: (state, { payload }: PayloadAction<SidebarState>) => {
      if (payload > state.width + 2) {
        return {
          ...state,
          width: state.width + 3,
        };
      } else if (payload < state.width - 2) {
        return {
          ...state,
          width: state.width - 3,
        };
      }
      return {
        ...state,
        width: payload,
      };
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
        searchValue: payload,
      };
    },
    setShiftClickItems: (state, { payload }) => {
      let list = [];

      if (payload.end !== null) {
        list = payload.list.filter(
          (item) =>
            (item.ORDER >= payload.start && item.ORDER <= payload.end) ||
            (item.ORDER >= payload.end && item.ORDER <= payload.start)
        );
      }

      return {
        ...state,
        shiftClickItems: {
          start: payload.start,
          end: payload.end,
          list,
        },
      };
    },
    setNewTagFormToggled: (state, { payload }) => {
      return {
        ...state,
        newTagFormToggled: payload,
      };
    },
    setDragToggled: (state, { payload }) => {
      return {
        ...state,
        dragToggled: payload,
      };
    },
    setDraggedOverItem: (state, { payload }) => {
      return {
        ...state,
        draggedOverItem: {
          ID: payload.ID,
          PAGE_ID: payload.PAGE_ID,
        },
      };
    },
    setGrabbedItem: (state, { payload }) => {
      return {
        ...state,
        grabbedItem: payload,
      };
    },
    setInputPosition: (state,{payload}) => {
      return {
        ...state,
        inputPosition: {
          referenceId: payload.referenceId,
          toggled: payload.toggled,
          forFolder: payload.forFolder,
        }
      }
    },
    setRenameInputToggled: (state, {payload}) => {
      return {
        ...state,
        renameInputToggled: payload
      }
    },
    setNewNameForRename: (state, {payload}) => {
      return {
        ...state,
        newNameForRename: payload
      }
    },
    setNewPageName: (state, {payload}) => {
      return {
        ...state,
        newPageName: payload
      }
    },
    setNewFolderName: (state, {payload}) => {
      return {
        ...state,
        newFolderName: payload
      }
    }
  },
});

export const {
  setSidebarWidth,
  setSidebarView,
  setSearchValue,
  setShiftClickItems,
  setNewTagFormToggled,
  setDragToggled,
  setDraggedOverItem,
  setGrabbedItem,
  setInputPosition,
  setRenameInputToggled,
  setNewNameForRename,
  setNewPageName,
  setNewFolderName
} = sidebarSlice.actions;
export default sidebarSlice.reducer;
