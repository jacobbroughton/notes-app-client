import { createSlice, current } from "@reduxjs/toolkit";

const pagesSlice = createSlice({
  name: "pages",
  initialState: {
    list: [],
    selected: null,
    active: null,
    staged: null,
  },
  reducers: {
    setPages: (state, { payload }) => {
      // let folders = [...payload.folders]
      let pages = [...payload];

      return {
        ...state,
        list: pages.map((page) => {
          return {
            ...page,
            IS_MODIFIED: false,
          };
        }),
      };

      // return {
      //   ...state,
      //   list: pages.map(page => {
      //     let pageFolder = folders.find(folder => folder.ID === page.FOLDER_ID)

      //     console.log(pageFolder)

      //     return {
      //       ...page,
      //       IS_PAGE: true,
      //       TIER: pageFolder ? pageFolder.TIER + 1 : 1,
      //       VISIBLE: pageFolder ? pageFolder.EXPANDED_STATUS : true
      //     }
      //   })
      // }
    },
    setPageEffStatus: (state, { payload: pageId }) => {
      return {
        ...state,
        list: state.list.map((page) => {
          return {
            ...page,
            ...(page.PAGE_ID === pageId && { EFF_STATUS: 0 }),
          };
        }),
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
            ...(page.PAGE_ID === payload?.PAGE_ID && { SELECTED: true }),
          };
        }),
        selected: selectedPage,
        active: selectedPage || state.active,
      };
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
        staged: payload,
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

          console.log(droppedOntoItem)

          if (droppedOntoItem === 'root') {
            console.log(droppedOntoItem)
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
        staged: state.staged,
      };
    },
  },
});

export default pagesSlice.reducer;
export const {
  setPages,
  setPageEffStatus,
  selectPage,
  updatePage,
  setPageModified,
  setPageStagedForSwitch,
  updateParentFolderId,
} = pagesSlice.actions;
