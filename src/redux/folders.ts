import { createSlice, current } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { FolderState, FoldersState } from "../types";

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
      console.log(payload);
      const folders = payload.map((folder: FolderState) => {
        return {
          ...folder,
          is_page: false,
        };
      });

      return {
        ...state,
        list: folders,
        selected: folders.find((folder: FolderState) => folder.selected) || null,
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

            if (hasChildren && folders[i].expanded_status) checkForChildren(folders[i]);
          }
        }
      }

      checkForChildren(expandedFolder);

      return {
        ...state,
        list: folders.map((folder: FolderState) => {
          return {
            ...folder,
            selected: folder.id === expandedFolder.id,
            ...(folder.id === expandedFolder.id && {
              expanded_status: !folder.expanded_status,
            }),
            ...(idsToUpdateVisibility.includes(folder.id) && {
              visible: !expandedFolder.expanded_status,
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
          expanded_status: false,
          visible: folder.parent_folder_id ? false : true,
        })),
      };
    },
    expandFolders: (state, { payload }) => {
      return {
        ...state,
        list: state.list?.map((folder: FolderState) => ({
          ...folder,
          expanded_status: true,
          visible: true,
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
          let selected = false;

          if (
            (payload === null && folder?.selected) ||
            payload?.id == selectedFolder?.id
          ) {
            selected = false;
          }

          if (folder?.id === selectedFolder?.id) {
            selected = true;
          }

          return {
            ...folder,
            selected,
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
            ...(folder.selected && { selected: false }),
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
            ...(folder.id === folderId && { eff_status: 0, selected: false }),
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
      const { item, tag: clickedTag } = payload;

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
          const isSameFolder = folder.id === item.id;

          return {
            ...folder,
            ...((isSameFolder 
              // || childFolderIds.includes(folder.id)
          ) &&
              folder.tag_id !== clickedTag.id && {
                tag_id: clickedTag.id,
                tag_color_code: clickedTag.color_code,
                tag_name: clickedTag.name,
              }),
          };
        }),
        selected: {
          ...state.selected,
          tag_id: clickedTag.id,
          tag_color_code: clickedTag.color_code,
          tag_name: clickedTag.name,
        } as FolderState | null | null,
      };
    },
    removeTagFromFolder: (state, { payload }): FoldersState => {
      const { item, tag } = payload;

      const removeTag = (folder: FolderState | null, tagId: number) => {
        if (!folder) return [];
        return folder.tags.filter((innerTag) => innerTag !== tagId);
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
              tags: removeTag(folder, tag.id),
            }),
            ...(childFolderIds.includes(folder.id) && {
              tags: removeTag(folder, tag.id),
            }),
          };
        }),
        active: {
          ...state.active,
          ...(state.active?.id === item.id && {
            tags: removeTag(state.active, tag.id),
          }),
        } as FolderState | null,
        selected: {
          ...state.selected,
          ...(state.selected?.id === item.id && {
            tags: removeTag(state.selected, tag.id),
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
