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
            selected: false,
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
            ...(tag.id === payload.id && { selected: true }),
            ...(tag.id !== payload.id && tag.selected && { selected: false }),
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
            ...(tag.selected && { selected: false }),
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
    deleteTag: (state, { payload: id }) => {
      return {
        ...state,
        list: state.list.filter((tag) => {
          return tag.id !== id;
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
