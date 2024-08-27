import { createSlice } from "@reduxjs/toolkit";
import { TagState, TagsState } from "../types";

const initialState: TagsState = {
  list: [],
  selected: null,
  colorOptions: [],
};

const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    resetTagsState: () => {
      return initialState;
    },
    setTags: (state, { payload }) => {
      return {
        ...state,
        list: payload.map((tag: TagState) => {
          return {
            ...tag,
            SELECTED: false,
          };
        }),
      };
    },
    selectTag: (state, { payload }) => {
      return {
        ...state,
        list: state.list.map((tag) => {
          return {
            ...tag,
            ...(tag.id === payload.id && { SELECTED: true }),
            ...(tag.id !== payload.id && tag.SELECTED && { SELECTED: false }),
          };
        }),
        selected: payload,
      };
    },
    deselectTag: (state) => {
      return {
        ...state,
        list: state.list.map((tag) => {
          return {
            ...tag,
            ...(tag.SELECTED && { SELECTED: false }),
          };
        }),
        selected: null,
      };
    },
    editTag: (state, { payload }) => {
      console.log(payload);
      return {
        ...state,
        list: state.list.map((tag) => {
          return {
            ...tag,
            ...(tag.id === payload.id && {
              ...payload
            }),
          };
        }),
      };
    },
    deleteTag: (state, { payload }) => {
      return {
        ...state,
        list: state.list.filter((tag) => {
          return tag.id !== payload.id;
        }),
      };
    },
    addTag: (state, { payload }) => {
      return {
        ...state,
        list: [...state.list, payload],
      };
    },
    setColorOptions: (state, { payload }) => {
      return {
        ...state,
        colorOptions: payload,
      };
    },
  },
});

export default tagsSlice.reducer;
export const {
  resetTagsState,
  setTags,
  selectTag,
  deselectTag,
  editTag,
  deleteTag,
  addTag,
  setColorOptions,
} = tagsSlice.actions;
