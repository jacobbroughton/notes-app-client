import { createSlice, current } from "@reduxjs/toolkit";

const pagesSlice = createSlice({
  name: "pages",
  initialState: {
    list: [],
    selected: null,
    active: null,
    stagedToSwitch: null,
    stagedToDelete: null,
    untitledPage: {
      TITLE: '',
      BODY: ''
    }
  },
  reducers: {
    setPages: (state, { payload }) => {

      const pages = payload.map(page => {

        const existingPage = state.list.find(innerPage => innerPage.PAGE_ID === page.PAGE_ID)

        return {
          ...page,
          IS_PAGE: true,
          SELECTED: page.SELECTED,
          DRAFT_TITLE: existingPage?.DRAFT_TITLE || page.TITLE,
          DRAFT_BODY: existingPage?.DRAFT_BODY || page.BODY,
          OPEN: page.OPEN || false,
          ACTIVE: page.ACTIVE || false
        }
      })

      return {
        ...state,
        list: pages,
        selected: state.list.find(page => page.SELECTED)
      };
    },
    setPageEffStatus: (state, { payload: pageId }) => {

      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.PAGE_ID === pageId && { EFF_STATUS: 0, SELECTED: false, OPEN: false }),
          };
        }),
        selected: null,
        active: null
      };
    },
    selectPage: (state, { payload }) => {
      const selectedPage =
        payload === null
          ? null
          : state.list.find((page) => page.PAGE_ID === payload.PAGE_ID);

      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...((payload === null || page.PAGE_ID !== payload?.PAGE_ID) &&
              page.SELECTED && { SELECTED: false }),
            ...(page.PAGE_ID === selectedPage?.PAGE_ID && { SELECTED: true }),
            ...(page.PAGE_ID === selectedPage?.PAGE_ID ? { ACTIVE: true, OPEN: true } : { ACTIVE: false }),
          };
        }),
        selected: selectedPage,
        active: selectedPage || state.active,
      };
    },
    deselectPage: (state, { payload }) => {
      return {
        ...state,
        list: state.list.map(page => {
          return {
            ...page,
            ...(page.PAGE_ID === payload.PAGE_ID && { ACTIVE: false, SELECTED: false })
          }
        }),
        selected: null,
        active: null
      }
    },
    updatePage: (state, { payload }) => {
      if (!payload) return state
      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(payload.PAGE_ID === page.PAGE_ID && {
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
    setPageModified: (state, { payload }) => {



      return {
        ...state,
        active: {
          ...state.active,
          IS_MODIFIED: payload,
        },
      };
    },
    setPageStagedForSwitch: (state, { payload }) => {
      return {
        ...state,
        stagedToSwitch: payload,
      };
    },
    updateParentFolderId: (state, { payload }) => {
      const { folders, affectedPage, droppedOntoItem } = payload;

      let folderOfDroppedOnItem = null;

      if (droppedOntoItem.IS_PAGE) {
        folderOfDroppedOnItem = folders.find(
          (folder) => folder.ID === droppedOntoItem.FOLDER_ID
        );
      }

      return {
        ...state,
        list: state.list.map((page) => {
          let FOLDER_ID;
          let TIER
          let VISIBLE;

          if (droppedOntoItem.IS_PAGE) {
            FOLDER_ID = droppedOntoItem.FOLDER_ID
            TIER = droppedOntoItem.TIER;
            VISIBLE = droppedOntoItem.VISIBLE;
          }

          if (!droppedOntoItem.IS_PAGE) {
            FOLDER_ID = droppedOntoItem.ID;
            TIER = droppedOntoItem.TIER + 1;
            VISIBLE = droppedOntoItem.EXPANDED_STATUS;
          }

          return {
            ...page,
            ...(page.PAGE_ID === affectedPage.PAGE_ID && {
              FOLDER_ID,
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
    setStagedPageToDelete: (state, { payload }) => {
      return {
        ...state,
        stagedToDelete: payload
      }
    },
    renamePage: (state, { payload }) => {
      return {
        ...state,
        list: state.list.map(page => {
          return {
            ...page,
            ...(page.PAGE_ID === payload.pageId && {
              NAME: payload.newName
            })
          }
        })
      };
    },
    addTagToPage: (state, { payload }) => {
      const { item, tag } = payload

      let updatedTags = [...item.TAGS, tag.ID]
      updatedTags.sort((a, b) => a > b ? 1 : -1)

      return {
        ...state,
        list: state.list.map(page => {
          return {
            ...page,
            ...(page.PAGE_ID === item.PAGE_ID && !page.TAGS.includes(tag.ID) && {
              // TAGS: [...page.TAGS, tag.ID],
              TAGS: updatedTags
            }),
          }
        }),
        ...(state.selected && {
          selected: {
            ...state.selected,
            ...(!state.selected.TAGS.includes(tag.ID) && {
              // TAGS: [...state.selected.TAGS, tag.ID]
              TAGS: updatedTags
            }),
          }
        }),
        ...(state.selected && {
          active: {
            ...state.selected,
            ...(!state.selected.TAGS.includes(tag.ID) && {
              // TAGS: [...state.selected.TAGS, tag.ID]
              TAGS: updatedTags
            }),
          }
        })
      }
    },
    removeTagFromPage: (state, { payload }) => {
      const { item, tag } = payload

      const removeTag = (page, tag) => page.TAGS.filter(innerTag => innerTag !== tag.ID)


      return {
        ...state,
        list: state.list.map(page => {
          return {
            ...page,
            ...(page.PAGE_ID === item.PAGE_ID && {
              TAGS: removeTag(page, tag)
            })
          }
        }),
        ...(state.active && {
          active: {
            ...state.active,
            ...(state.active.PAGE_ID === item.PAGE_ID && {
              TAGS: removeTag(state.active, tag)
            })
          }
        }),
        ...(state.selected && {
          selected: {
            ...state.selected,
            ...(state.selected.PAGE_ID === item.PAGE_ID && {
              TAGS: removeTag(state.selected, tag)
            })
          }
        })
      }
    },
    setPageClosed: (state, { payload }) => {
      const updatedPages = state.list.map(page => {
        return {
          ...page,
          ...(page.PAGE_ID === payload.PAGE_ID && { OPEN: false, SELECTED: false })
        }
      })

      const openPages = updatedPages.filter(page => page.OPEN === true)

      return {
        ...state,
        list: updatedPages.map(page => {
          return {
            ...page,
            ...(page.PAGE_ID === openPages[0]?.PAGE_ID && { SELECTED: true, ACTIVE: true })
          }
        }),
        active: openPages[0],
        selected: openPages[0]
      }
    },
    setPageDraftTitle: (state, { payload }) => {

      const { page: affectedPage, draftTitle } = payload

      return {
        ...state,
        list: state.list.map(page => {
          return {
            ...page,
            ...(page.PAGE_ID === affectedPage.PAGE_ID && { DRAFT_TITLE: draftTitle }),
          }
        }),
        active: {
          ...state.active,
          DRAFT_TITLE: draftTitle
        }
      }
    },
    setPageDraftBody: (state, { payload }) => {

      const { page: affectedPage, draftBody } = payload

      return {
        ...state,
        list: state.list.map(page => {
          return {
            ...page,
            ...(page.PAGE_ID === affectedPage.PAGE_ID && { DRAFT_BODY: draftBody }),

          }
        }),
        active: {
          ...state.active,
          DRAFT_BODY: draftBody
        }
      }
    },
    setUntitledPageBody: (state, { payload }) => {
      return {
        ...state,
        untitledPage: {
          ...state.untitledPage,
          BODY: payload
        }
      }
    },
    setUntitledPageTitle: (state, { payload }) => {
      return {
        ...state,
        untitledPage: {
          ...state.untitledPage,
          TITLE: payload
        }
      }
    },
    // setUnsavedPageTitle: (state, {payload}) => {
    //   return {
    //     ...state,

    //   }
    // }
  },
});

export default pagesSlice.reducer;
export const {
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
  setUntitledPageTitle
} = pagesSlice.actions;
