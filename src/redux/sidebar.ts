import { createSlice, current } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { SidebarState, SidebarItemState } from "../types";

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
  width: 225,
  view: viewOptionsForState[0],
  toggled: window.innerWidth > 600,
  viewOptions: viewOptionsForState,
  searchValue: "",
  shiftClickItems: { start: null, end: null, list: [] },
  newTagFormToggled: false,
  dragToggled: false,
  draggedOverItem: null,
  grabbedItem: null,
  inputPosition: {
    referenceId: null,
    toggled: false,
    forFolder: false,
  },
  renameInputToggled: false,
  newNameForRename: "",
  newPageName: "",
  newFolderName: "",
  loading: false,
  floating:
    window.innerWidth > 600
      ? false
      : Boolean(localStorage.getItem("sidebar-floating-toggled")) || false,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    resetSidebarState: () => {
      return initialState;
    },
    setSidebarWidth: (state, { payload }: PayloadAction<number>) => {
      return {
        ...state,
        width: payload,
        toggled: payload >= 52,
      };
    },
    setSidebarToggled: (state, { payload }: PayloadAction<boolean>) => {
      const lastSidebarWidth = parseInt(
        localStorage.getItem("lastSidebarWidth") || "250"
      );
      return {
        ...state,
        toggled: payload,
        width: lastSidebarWidth <= 50 ? 250 : lastSidebarWidth,
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
          (item: SidebarItemState) =>
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
    setInputPosition: (state, { payload }) => {
      return {
        ...state,
        inputPosition: {
          referenceId: payload.referenceId,
          toggled: payload.toggled,
          forFolder: payload.forFolder,
        },
      };
    },
    setRenameInputToggled: (state, { payload }) => {
      return {
        ...state,
        renameInputToggled: payload,
      };
    },
    setNewNameForRename: (state, { payload }) => {
      return {
        ...state,
        newNameForRename: payload,
      };
    },
    setNewPageName: (state, { payload }) => {
      return {
        ...state,
        newPageName: payload,
      };
    },
    setNewFolderName: (state, { payload }) => {
      return {
        ...state,
        newFolderName: payload,
      };
    },
    setSidebarLoading: (state, { payload }) => {
      return {
        ...state,
        loading: payload,
      };
    },
    setSidebarFloating: (state, { payload }) => {
      localStorage.setItem("sidebar-floating-toggled", payload);
      return {
        ...state,
        floating: payload,
      };
    },
  },
});

export const {
  resetSidebarState,
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
  setNewFolderName,
  setSidebarLoading,
  setSidebarToggled,
  setSidebarFloating,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
