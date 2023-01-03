import { createSlice, current } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

// type FoldersState = Array<object | null>;

const initialState = {
  list: [],
  selected: null,
  stagedToDelete: null,
};

const foldersSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    setFolders: (state, { payload }) => {

      const folders = payload.map(folder => {
        return {
          ...folder,
          IS_PAGE: false,
          ...(typeof folder.TAGS === "string" && { TAGS: folder.TAGS?.split(',').map(tag => parseInt(tag)) })
        }
      })

      return {
        ...state,
        list: folders,
        selected: folders.find(folder => folder.SELECTED)
      };
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
            }),
            ...(idsToUpdateVisibility.includes(folder.ID) && {
              VISIBLE: !expandedFolder.EXPANDED_STATUS,
            }),
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
          let SELECTED;

          if (
            (payload === null && folder?.SELECTED) ||
            payload?.ID == selectedFolder?.ID
          ) {
            SELECTED = false;
          }

          if (folder?.ID === selectedFolder?.ID) {
            SELECTED = true;
          }
          return {
            ...folder,
            SELECTED,
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
            ...(folder.ID === folderId && { EFF_STATUS: 0, SELECTED: false }),
          };
        }),
        selected: null
      };
    },
    setStagedFolderToDelete: (state, { payload }) => {
      return {
        ...state,
        stagedToDelete: payload,
      };
    },
    renameFolder: (state, { payload }) => {
      return {
        ...state,
        list: state.list.map((folder) => {
          return {
            ...folder,
            ...(folder.ID === payload.folderId && {
              NAME: payload.newName,
            }),
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
  setStagedFolderToDelete,
  renameFolder,
} = foldersSlice.actions;
export default foldersSlice.reducer;
