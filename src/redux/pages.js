import { createSlice, current } from "@reduxjs/toolkit";

const pagesSlice = createSlice({
  name: "pages",
  initialState: {
    list: [],
    selected: null,
  },
  reducers: {
    setPages: (state, { payload }) => {
      // let folders = [...payload.folders]
      let pages = [...payload];

      return {
        ...state,
        list: pages,
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
      };
    },
  },
});

export default pagesSlice.reducer;
export const { setPages, setPageEffStatus, selectPage } = pagesSlice.actions;
