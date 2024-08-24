import { createSlice, current } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { FolderState, FoldersState, TagState } from "../types";

const initialState: FoldersState = {
  list: [],
  selected: null,
  stagedToDelete: null,
  active: null,
};

const foldersSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    resetFoldersState: () => {
      return initialState;
    },
    setFolders: (state, { payload }: PayloadAction<Array<FolderState>>) => {
      const folders = payload.map((folder: FolderState) => {
        return {
          ...folder,
          is_page: false,
        };
      });

      return {
        ...state,
        list: folders,
        selected: folders.find((folder: FolderState) => folder.SELECTED) || null,
      };
    },
    setExpandedStatus: (state, { payload }) => {
      const expandedFolder = payload;
      const folders = [...state?.list];

      let idsToUpdateVisibility: Array<number> = [];

      function checkForChildren(folderToCheck: FolderState) {
        for (let i = 0; i < folders.length; i++) {
          if (folders[i].parent_folder_id === folderToCheck.id) {
            idsToUpdateVisibility.push(folders[i].id);

            let hasChildren = folders.filter(
              (folder: FolderState) => folder.parent_folder_id === folders[i].id
            );

            if (hasChildren && folders[i].EXPANDED_STATUS) checkForChildren(folders[i]);
          }
        }
      }

      checkForChildren(expandedFolder);

      return {
        ...state,
        list: folders.map((folder: FolderState) => {
          return {
            ...folder,
            SELECTED: folder.id === expandedFolder.id,
            ...(folder.id === expandedFolder.id && {
              EXPANDED_STATUS: !folder.EXPANDED_STATUS,
            }),
            ...(idsToUpdateVisibility.includes(folder.id) && {
              VISIBLE: !expandedFolder.EXPANDED_STATUS,
            }),
          };
        }),
      };
    },
    collapseFolders: (state, { payload }) => {
      return {
        ...state,
        list: state.list?.map((folder: FolderState) => ({
          ...folder,
          EXPANDED_STATUS: false,
          VISIBLE: folder.parent_folder_id ? false : true,
        })),
      };
    },
    expandFolders: (state, { payload }) => {
      return {
        ...state,
        list: state.list?.map((folder: FolderState) => ({
          ...folder,
          EXPANDED_STATUS: true,
          VISIBLE: true,
        })),
      };
    },
    selectFolder: (state, { payload }) => {
      const selectedFolder =
        payload === null
          ? null
          : state.list.find((folder: FolderState) => folder.id === payload.id);

      return {
        ...state,
        list: state.list.map((folder: FolderState) => {
          let SELECTED = false;

          if (
            (payload === null && folder?.SELECTED) ||
            payload?.id == selectedFolder?.id
          ) {
            SELECTED = false;
          }

          if (folder?.id === selectedFolder?.id) {
            SELECTED = true;
          }

          return {
            ...folder,
            SELECTED,
          };
        }),
        selected: selectedFolder || null,
      };
    },
    deselectFolder: (state, { payload }: PayloadAction<null>) => {
      return {
        ...state,
        list: state.list.map((folder: FolderState) => {
          return {
            ...folder,
            ...(folder.SELECTED && { SELECTED: false }),
          };
        }),
      };
    },
    setFolderEffStatus: (state, { payload: folderId }: PayloadAction<number>) => {
      return {
        ...state,
        list: state.list.map((folder: FolderState) => {
          return {
            ...folder,
            ...(folder.id === folderId && { eff_status: 0, SELECTED: false }),
          };
        }),
        selected: null,
      };
    },
    setStagedFolderToDelete: (state, { payload }: PayloadAction<FolderState | null>) => {
      return {
        ...state,
        stagedToDelete: payload,
      };
    },
    renameFolder: (state, { payload }) => {
      return {
        ...state,
        list: state.list.map((folder: FolderState) => {
          return {
            ...folder,
            ...(folder.id === payload.folderId && {
              name: payload.newName,
            }),
          };
        }),
      };
    },
    addTagToFolder: (state, { payload }): FoldersState => {
      const { item, tag } = payload;

      let childFolderIds: Array<number> = [];

      function getChildren(folderIdToCheck: number) {
        childFolderIds.push(folderIdToCheck);

        const children = current(state)
          .list.filter(
            (folder: FolderState) => folder.parent_folder_id === folderIdToCheck
          )
          .map((folder: FolderState) => folder.id);

        if (children.length === 0) return;

        children.forEach((folderId) => getChildren(folderId));
      }

      getChildren(item.id);

      let selectedFolderTags: Array<number> = [];

      if (state.selected) {
        selectedFolderTags = [...state.selected.TAGS];
        if (state.selected.id === item.id && !state.selected.TAGS.includes(tag.id)) {
          selectedFolderTags = [...selectedFolderTags, tag.id];
          selectedFolderTags.sort((a, b) => (a > b ? 1 : -1));
        }
      }

      return {
        ...state,
        list: state.list.map((folder: FolderState) => {
          const isSameFolder = folder.id === item.id;

          let TAGS = [...folder.TAGS, tag.id];
          TAGS.sort((a, b) => (a > b ? 1 : -1));

          return {
            ...folder,
            ...((isSameFolder || childFolderIds.includes(folder.id)) &&
              !folder.TAGS.includes(tag.id) && {
                TAGS,
              }),
          };
        }),
        selected: {
          ...state.selected,
          TAGS: selectedFolderTags,
        } as FolderState | null | null,
      };
    },
    removeTagFromFolder: (state, { payload }): FoldersState => {
      const { item, tag } = payload;

      const removeTag = (folder: FolderState | null, tagId: number) => {
        if (!folder) return [];
        return folder.TAGS.filter((innerTag) => innerTag !== tagId);
      };

      let childFolderIds: Array<number> = [];

      function getChildren(folderIdToCheck: number) {
        childFolderIds.push(folderIdToCheck);

        const children = current(state)
          .list.filter(
            (folder: FolderState) => folder.parent_folder_id === folderIdToCheck
          )
          .map((folder: FolderState) => folder.id);

        if (children.length === 0) return;

        children.forEach((folderId) => getChildren(folderId));
      }

      getChildren(item.id);

      return {
        ...state,
        list: state.list.map((folder: FolderState) => {
          return {
            ...folder,
            ...(folder.id === item.id && {
              TAGS: removeTag(folder, tag.id),
            }),
            ...(childFolderIds.includes(folder.id) && {
              TAGS: removeTag(folder, tag.id),
            }),
          };
        }),
        active: {
          ...state.active,
          ...(state.active?.id === item.id && {
            TAGS: removeTag(state.active, tag.id),
          }),
        } as FolderState | null,
        selected: {
          ...state.selected,
          ...(state.selected?.id === item.id && {
            TAGS: removeTag(state.selected, tag.id),
          }),
        } as FolderState | null,
      };
    },
  },
});

export const {
  resetFoldersState,
  setFolders,
  setExpandedStatus,
  collapseFolders,
  expandFolders,
  selectFolder,
  deselectFolder,
  setFolderEffStatus,
  setStagedFolderToDelete,
  renameFolder,
  addTagToFolder,
  removeTagFromFolder,
} = foldersSlice.actions;
export const foldersReducer = foldersSlice.reducer;
