import { createSlice, current } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

// type FoldersState = Array<object | null>;

const initialState = {
  list: [],
  selected: null,
};

const foldersSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    setFolders: (state, { payload: folders }) => {
      return {
        ...state,
        list: folders,
      };

      // return {
      //   ...state,
      //   list: data?.map((folder) => {
      //     let existingFolderThatMatches = state.list?.find(
      //       (innerFolder) => innerFolder.ID === folder.ID
      //     );

      //     let existingIdArray = [];
      //     let newFolder = null;
      //     let parentOfNewFolder = null;

      //     if (!isInitial) {
      //       existingIdArray = state.list?.map((innerFolder) => innerFolder.ID);
      //       newFolder = data?.find(
      //         (innerFolder) => !existingIdArray.includes(innerFolder.ID)
      //       );
      //       parentOfNewFolder = state.list?.find(
      //         (innerFolder) => innerFolder.ID === newFolder?.PARENT_FOLDER_ID
      //       );
      //     }

      //     let EXPANDED_STATUS = existingFolderThatMatches?.EXPANDED_STATUS

      //     let VISIBLE = existingFolderThatMatches?.VISIBLE;
      //     console.log(current(state.list).find((innerFolder) => innerFolder.ID === newFolder?.PARENT_FOLDER_ID))

      //     if (folder.EFF_STATUS) {
      //       if (isInitial) {
      //         if (existingFolderThatMatches?.VISIBLE || !folder.PARENT_FOLDER_ID) {
      //           VISIBLE = true;
      //         }
      //       } else if (
      //           newFolder?.PARENT_FOLDER_ID === null && folder.ID === newFolder.ID ||
      //           parentOfNewFolder?.EXPANDED_STATUS && folder.PARENT_FOLDER_ID === parentOfNewFolder.ID
      //         ) {
      //           VISIBLE = true;
      //         }
      //     }
      //     return {
      //       ...folder,
      //       EXPANDED_STATUS,
      //       VISIBLE,
      //       // :
      //       //   folder.EFF_STATUS &&
      //       //   (!isInitial && newFolder?.ID === folder.ID && (folder.PARENT_FOLDER_ID === null ? true : parentOfNewFolder?.EXPANDED_STATUS))
      //       //   || existingFolderThatMatches?.VISIBLE
      //       //   || !folder.PARENT_FOLDER_ID,
      //     };
      //   }),
      // };
    },
    setExpandedStatus: (state, { payload }) => {
      const expandedFolder = payload;
      const folders = [...state?.list];

      let idsToUpdateVisibility = [];

      function checkForChildren(folderToCheck) {
        for (let i = 0; i < folders.length; i++) {
          if (folders[i].PARENT_FOLDER_ID === folderToCheck.ID) {
            idsToUpdateVisibility.push(folders[i].ID);

            let hasChildren = folders.filter(
              (folder) => folder.PARENT_FOLDER_ID === folders[i].ID
            );

            if (hasChildren && folders[i].EXPANDED_STATUS) checkForChildren(folders[i]);
          }
        }
      }

      checkForChildren(expandedFolder);

      return {
        ...state,
        list: folders.map((folder) => {
          let parentFolder = folders.find(
            (innerFolder) => innerFolder.ID === folder.PARENT_FOLDER_ID
          );

          return {
            ...folder,
            SELECTED: folder.ID === expandedFolder.ID,
            ...(folder.ID === expandedFolder.ID && {
              EXPANDED_STATUS: !folder.EXPANDED_STATUS,
              // SELECTED: true
            }),
            ...(idsToUpdateVisibility.includes(folder.ID) && {
              VISIBLE: !expandedFolder.EXPANDED_STATUS,
            }),
            // parentFolder,
          };
        }),
      };
    },
    collapseFolders: (state, { payload }) => {
      return {
        ...state,
        list: state.list?.map((folder) => ({
          ...folder,
          EXPANDED_STATUS: false,
          VISIBLE: folder.PARENT_FOLDER_ID ? false : true,
        })),
      };
    },
    expandFolders: (state, { payload }) => {
      return {
        ...state,
        list: state.list?.map((folder) => ({
          ...folder,
          EXPANDED_STATUS: true,
          VISIBLE: true,
        })),
      };
    },
    selectFolder: (state, { payload }) => {
      const selectedFolder =
        payload === null ? null : state.list.find((folder) => folder.ID === payload.ID);

      return {
        ...state,
        list: state.list.map((folder) => {
          return {
            ...folder,
            ...(payload === null && folder.SELECTED && { SELECTED: false }),
            ...(folder.ID === payload?.ID && { SELECTED: true }),
          };
        }),
        selected: selectedFolder,
      };
    },
    deselectFolder: (state, { payload }) => {
      return {
        ...state,
        list: state.list.map((folder) => {
          return {
            ...folder,
            ...(folder.SELECTED && { SELECTED: false }),
          };
        }),
      };
    },
    setFolderEffStatus: (state, { payload: folderId }) => {
      return {
        ...state,
        list: state.list.map((folder) => {
          return {
            ...folder,
            ...(folder.ID === folderId && { EFF_STATUS: 0 }),
          };
        }),
      };
    },
  },
});

export const {
  setFolders,
  setExpandedStatus,
  collapseFolders,
  expandFolders,
  selectFolder,
  deselectFolder,
  setFolderEffStatus,
} = foldersSlice.actions;
export default foldersSlice.reducer;
