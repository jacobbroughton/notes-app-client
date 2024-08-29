import { FolderState, PageState } from "../types";

/**
 * @param {array} updatedFolders Folders that were most recently updated,
 * @param {array} existingFolders Folders from state,
 * @param {array} existingPages Pages from state,
 */
export const formatFolders = (
  updatedFolders: Array<FolderState> = [],
  existingFolders: Array<FolderState> = []
) => {
  return updatedFolders?.map((folder: FolderState) => {
    let existingFolderThatMatches = existingFolders?.find(
      (innerFolder) => innerFolder.id === folder.id
    );

    let existingIdArray: Array<number> = [];
    let newFolder: FolderState | undefined;
    let parentOfNewFolder = null;

    if (existingFolders.length !== 0) {
      existingIdArray = existingFolders.map((innerFolder) => innerFolder.id);
      newFolder = updatedFolders.find(
        (innerFolder) => !existingIdArray.includes(innerFolder.id)
      );
      parentOfNewFolder = existingFolders.find(
        (innerFolder) => innerFolder.id === newFolder?.parent_folder_id
      );
    }

    let expanded_status = existingFolderThatMatches?.expanded_status || false;

    let visible = existingFolderThatMatches ? existingFolderThatMatches.visible : false;

    if (folder.eff_status) {
      if (existingFolders.length === 0) {
        if (existingFolderThatMatches?.visible || !folder.parent_folder_id) {
          visible = true;
        }
      } else if (
        (newFolder?.parent_folder_id === null && folder.id === newFolder.id) ||
        (parentOfNewFolder?.expanded_status &&
          folder.parent_folder_id === parentOfNewFolder.id)
      ) {
        visible = true;
      }
    }
    return {
      ...folder,
      expanded_status,
      visible,
      selected: folder.selected ? folder.selected : false,
    };
  });
};

export const formatPages = (
  pages: Array<PageState> = [],
  formattedFolders: Array<FolderState> = [],
  existingPages: Array<PageState> = []
) => {
  return pages?.map((page: PageState) => {
    let pageFolder = formattedFolders.find((folder) => folder.id === page.folder_id);

    let visible = false;

    if (pageFolder) {
      if (pageFolder.visible && pageFolder.expanded_status) {
        visible = true;
      }
    }

    if (page.folder_id === null) visible = true;

    const existingPage = existingPages.find(
      (existingPage) => existingPage.page_id === page.page_id
    );

    return {
      ...page,
      is_page: true,
      tier: pageFolder ? pageFolder.tier + 1 : 1,
      visible,
      selected: page.selected ? page.selected : false,
      draft_title:
        existingPage?.draft_title !== page.title ? page.draft_title : page.title,
      draft_name: existingPage?.draft_name !== page.name ? page.draft_name : page.name,
      draft_body: existingPage?.draft_body !== page.body ? page.draft_body : page.body,
      open: existingPage?.open ? true : false,
    };
  });
};
