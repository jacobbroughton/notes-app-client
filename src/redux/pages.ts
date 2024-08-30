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
    body: "",
    is_untitled: true,
    is_initial: true,
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
          selected: page.selected,
          draft_title: existingPage?.draft_title || page.title,
          draft_name: existingPage?.draft_name || page.name,
          draft_body: existingPage?.draft_body || page.body,
          open: page.open || false,
          active: page.active || false,
          is_favorite: page.is_favorite || false,
        };
      });

      return {
        ...state,
        list: pages,
        selected: state.list.find((page) => page.selected) || null,
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
              selected: false,
              open: false,
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
              page.selected && { selected: false }),
            ...(page.page_id === selectedPage?.page_id && { selected: true }),
            ...(page.page_id === selectedPage?.page_id
              ? { active: true, open: true }
              : { active: false }),
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
            ...(page.page_id === payload.page_id && { active: false, selected: false }),
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
          let tier;
          let visible;

          if (droppedOntoItem.is_page) {
            folder_id = droppedOntoItem.folder_id;
            tier = droppedOntoItem.tier;
            visible = droppedOntoItem.visible;
          }

          if (!droppedOntoItem.is_page) {
            folder_id = droppedOntoItem.id;
            tier = droppedOntoItem.tier + 1;
            visible = droppedOntoItem.expanded_status;
          }

          return {
            ...page,
            ...(page.page_id === affectedPage.page_id && {
              folder_id,
              tier,
              visible,
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

      console.log({ item, tag });

      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.page_id === item.page_id &&
              page.tag_id !== tag.id && {
                tag_id: tag.id,
                tag_color_code: tag.color_code,
                tag_name: tag.name,
              }),
          };
        }),
        ...(state.selected && {
          selected: {
            ...state.selected,
            ...(state.selected.tag_id !== tag.id && {
              tag_id: tag.id,
              tag_color_code: tag.color_code,
              tag_name: tag.name,
            }),
          },
        }),
        ...(state.selected && {
          active: {
            ...state.selected,
            ...(state.selected.tag_id !== tag.id && {
              tag_id: tag.id,
              tag_color_code: tag.color_code,
              tag_name: tag.name,
            }),
          },
        }),
      };
    },
    removeTagFromPage: (state, { payload: item }): PagesState => {
      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.page_id === item.page_id && {
              tag_id: null,
              tag_color_code: null,
              tag_name: null,
            }),
          };
        }),
        ...(state.active && {
          active: {
            ...state.active,
            ...(state.active.page_id === item.page_id && {
              tag_id: null,
              tag_color_code: null,
              tag_name: null,
            }),
          },
        }),
        ...(state.selected && {
          selected: {
            ...state.selected,
            ...(state.selected.page_id === item.page_id && {
              tag_id: null,
              tag_color_code: null,
              tag_name: null,
            }),
          },
        }),
      };
    },
    setPageClosed: (state, { payload }: { payload: PageState | null }): PagesState => {
      const updatedPages = state.list.map((page) => {
        return {
          ...page,
          ...(page.page_id === payload?.page_id && { open: false, selected: false }),
        };
      });

      const openPages = updatedPages.filter((page) => page.open === true);

      return {
        ...state,
        list: updatedPages.map((page) => {
          return {
            ...page,
            ...(page.page_id === openPages[0]?.page_id && {
              selected: true,
              active: true,
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
          is_initial: false,
        },
      };
    },
    setUntitledPageTitle: (state, { payload }): PagesState => {
      return {
        ...state,
        untitledPage: {
          ...state.untitledPage,
          name: payload,
          // is_initial: false,
        },
      };
    },
    resetUntitledPage: (state, { payload }) => {
      return {
        ...state,
        untitledPage: {
          ...state.untitledPage,
          name: "",
          body: "",
          is_initial: true,
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
            ...(innerPage.page_id === page.page_id && { is_favorite: favoriteStatus }),
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
