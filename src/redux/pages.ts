import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PagesState, PageState, FolderState, TagState } from "../types";

const initialState: PagesState = {
  list: [],
  selected: null,
  active: null,
  stagedToSwitch: null,
  stagedToDelete: null,
  untitledPage: {
    name: "",
    body: '',
    IS_UNTITLED: true,
    IS_INITIAL: true,
  },
};

const pagesSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    resetPagesState: () => {
      return initialState;
    },
    setPages: (state, { payload }) => {
      const pages: Array<PageState> = payload.map((page: PageState) => {
        const existingPage = state.list?.find(
          (innerPage) => innerPage.page_id === page.page_id
        );

        return {
          ...page,
          is_page: true,
          SELECTED: page.SELECTED,
          DRAFT_TITLE: existingPage?.DRAFT_TITLE || page.TITLE,
          draft_name: existingPage?.draft_name || page.name,
          draft_body: existingPage?.draft_body || page.body,
          OPEN: page.OPEN || false,
          ACTIVE: page.ACTIVE || false,
          IS_FAVORITE: page.IS_FAVORITE || false,
        };
      });

      return {
        ...state,
        list: pages,
        selected: state.list.find((page) => page.SELECTED) || null,
      };
    },
    setPageEffStatus: (state, { payload: pageId }: PayloadAction<number>) => {
      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.page_id === pageId && {
              eff_status: 0,
              SELECTED: false,
              OPEN: false,
            }),
          };
        }),
        selected: null,
        active: null,
      };
    },
    selectPage: (state, { payload }: PayloadAction<PageState | null>) => {
      let selectedPage: PageState | null = null;

      const matchingPage = state.list.find((page) => page.page_id === payload?.page_id);

      if (matchingPage) selectedPage = matchingPage;

      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...((payload === null || page.page_id !== payload?.page_id) &&
              page.SELECTED && { SELECTED: false }),
            ...(page.page_id === selectedPage?.page_id && { SELECTED: true }),
            ...(page.page_id === selectedPage?.page_id
              ? { ACTIVE: true, OPEN: true }
              : { ACTIVE: false }),
          };
        }),
        selected: selectedPage || null,
        active: selectedPage || state.active,
      };
    },
    deselectPage: (state, { payload }) => {
      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.page_id === payload.page_id && { ACTIVE: false, SELECTED: false }),
          };
        }),
        selected: null,
        active: null,
      };
    },
    updatePage: (state, { payload }) => {
      if (!payload) return state;
      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(payload.page_id === page.page_id && {
              ...payload,
            }),
          };
        }),
        active: {
          ...state.active,
          ...payload,
        },
      };
    },
    setPageModified: (state, { payload }: PayloadAction<boolean>) => {
      return {
        ...state,
        active: {
          ...state.active,
          is_modified: payload,
        } as PageState | null,
      };
    },
    setPageStagedForSwitch: (state, { payload }: PayloadAction<PageState | null>) => {
      return {
        ...state,
        stagedToSwitch: payload,
      };
    },
    updateParentFolderId: (state, { payload }): PagesState => {
      const { folders, affectedPage, droppedOntoItem } = payload;

      let folderOfDroppedOnItem = null;

      if (droppedOntoItem.is_page) {
        folderOfDroppedOnItem = folders.find(
          (folder: FolderState) => folder.id === droppedOntoItem.folder_id
        );
      }

      return {
        ...state,
        list: state.list.map((page) => {
          let folder_id;
          let TIER;
          let VISIBLE;

          if (droppedOntoItem.is_page) {
            folder_id = droppedOntoItem.folder_id;
            TIER = droppedOntoItem.TIER;
            VISIBLE = droppedOntoItem.VISIBLE;
          }

          if (!droppedOntoItem.is_page) {
            folder_id = droppedOntoItem.id;
            TIER = droppedOntoItem.TIER + 1;
            VISIBLE = droppedOntoItem.EXPANDED_STATUS;
          }

          return {
            ...page,
            ...(page.page_id === affectedPage.page_id && {
              folder_id,
              TIER,
              VISIBLE,
            }),
          };
        }),
        selected: state.selected,
        active: state.active,
        stagedToSwitch: state.stagedToSwitch,
      };
    },
    setStagedPageToDelete: (state, { payload }): PagesState => {
      return {
        ...state,
        stagedToDelete: payload,
      };
    },
    renamePage: (state, { payload }): PagesState => {
      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.page_id === payload.pageId && {
              name: payload.newName,
              draft_name: payload.newName,
            }),
          };
        }),
        active: {
          ...state.active,
          name: payload.newName,
          draft_name: payload.newName,
        },
        selected: {
          ...state.active,
          name: payload.newName,
          draft_name: payload.newName,
        },
      } as PagesState;
    },
    addTagToPage: (state, { payload }): PagesState => {
      const { item, tag } = payload;

      let updatedTags = [...item.TAGS, tag.id];
      updatedTags.sort((a, b) => (a > b ? 1 : -1));

      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.page_id === item.page_id &&
              !page.TAGS.includes(tag.id) && {
                TAGS: updatedTags,
              }),
          };
        }),
        ...(state.selected && {
          selected: {
            ...state.selected,
            ...(!state.selected.TAGS.includes(tag.id) && {
              TAGS: updatedTags,
            }),
          },
        }),
        ...(state.selected && {
          active: {
            ...state.selected,
            ...(!state.selected.TAGS.includes(tag.id) && {
              TAGS: updatedTags,
            }),
          },
        }),
      };
    },
    removeTagFromPage: (state, { payload }): PagesState => {
      const { item, tag } = payload;

      const removeTag = (page: PageState, tag: TagState) =>
        page.TAGS.filter((innerTag) => innerTag !== tag.id);

      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.page_id === item.page_id && {
              TAGS: removeTag(page, tag),
            }),
          };
        }),
        ...(state.active && {
          active: {
            ...state.active,
            ...(state.active.page_id === item.page_id && {
              TAGS: removeTag(state.active, tag),
            }),
          },
        }),
        ...(state.selected && {
          selected: {
            ...state.selected,
            ...(state.selected.page_id === item.page_id && {
              TAGS: removeTag(state.selected, tag),
            }),
          },
        }),
      };
    },
    setPageClosed: (state, { payload }: { payload: PageState | null }): PagesState => {
      const updatedPages = state.list.map((page) => {
        return {
          ...page,
          ...(page.page_id === payload?.page_id && { OPEN: false, SELECTED: false }),
        };
      });

      const openPages = updatedPages.filter((page) => page.OPEN === true);

      return {
        ...state,
        list: updatedPages.map((page) => {
          return {
            ...page,
            ...(page.page_id === openPages[0]?.page_id && {
              SELECTED: true,
              ACTIVE: true,
            }),
          };
        }),
        active: openPages[0] || null,
        selected: openPages[0] || null,
      };
    },
    setCursorPosition: (state, { payload }) => {
      return state;
    },
    setPageDraftTitle: (state, { payload }): PagesState => {
      const { page: affectedPage, draftTitle } = payload;

      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.page_id === affectedPage.page_id && { draft_name: draftTitle }),
          };
        }),
        active: {
          ...state.active,
          draft_name: draftTitle,
        },
      } as PagesState;
    },
    setPageDraftBody: (state, { payload }): PagesState => {
      const { page: affectedPage, draftBody } = payload;

      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.page_id === affectedPage.page_id && { draft_body: draftBody }),
          };
        }),
        active: {
          ...state.active,
          draft_body: draftBody,
        },
      } as PagesState;
    },
    setUntitledPageBody: (state, { payload }): PagesState => {
      return {
        ...state,
        untitledPage: {
          ...state.untitledPage,
          body: payload,
          IS_INITIAL: false,
        },
      };
    },
    setUntitledPageTitle: (state, { payload }): PagesState => {
      return {
        ...state,
        untitledPage: {
          ...state.untitledPage,
          name: payload,
          // IS_INITIAL: false,
        },
      };
    },
    resetUntitledPage: (state, { payload }) => {
      return {
        ...state,
        untitledPage: {
          ...state.untitledPage,
          name: "",
          body: '',
          IS_INITIAL: true,
        },
      };
    },
    setFavoriteStatus: (state, { payload }): PagesState => {
      const { favoriteStatus, page } = payload;

      return {
        ...state,
        list: state.list.map((innerPage) => {
          return {
            ...innerPage,
            ...(innerPage.page_id === page.page_id && { IS_FAVORITE: favoriteStatus }),
          };
        }),
      };
    },
  },
});

export const {
  resetPagesState,
  setPages,
  setPageEffStatus,
  selectPage,
  deselectPage,
  updatePage,
  setPageModified,
  setPageStagedForSwitch,
  updateParentFolderId,
  setStagedPageToDelete,
  renamePage,
  addTagToPage,
  removeTagFromPage,
  setPageClosed,
  setPageDraftTitle,
  setPageDraftBody,
  setUntitledPageBody,
  setUntitledPageTitle,
  resetUntitledPage,
  setFavoriteStatus,
  setCursorPosition,
} = pagesSlice.actions;
export const pagesReducer = pagesSlice.reducer;
