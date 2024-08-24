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

    let EXPANDED_STATUS = existingFolderThatMatches?.EXPANDED_STATUS || false;

    let VISIBLE = existingFolderThatMatches ? existingFolderThatMatches.VISIBLE : false;

    const TAGS = folder.TAGS.sort((a: number, b: number) => (a > b ? 1 : -1));

    if (folder.eff_status) {
      if (existingFolders.length === 0) {
        if (existingFolderThatMatches?.VISIBLE || !folder.parent_folder_id) {
          VISIBLE = true;
        }
      } else if (
        (newFolder?.parent_folder_id === null && folder.id === newFolder.id) ||
        (parentOfNewFolder?.EXPANDED_STATUS &&
          folder.parent_folder_id === parentOfNewFolder.id)
      ) {
        VISIBLE = true;
      }
    }
    return {
      ...folder,
      EXPANDED_STATUS,
      VISIBLE,
      SELECTED: folder.SELECTED ? folder.SELECTED : false,
      TAGS,
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

    let VISIBLE = false;

    if (pageFolder) {
      if (pageFolder.VISIBLE && pageFolder.EXPANDED_STATUS) {
        VISIBLE = true;
      }
    }

    if (page.folder_id === null) VISIBLE = true;

    const existingPage = existingPages.find(
      (existingPage) => existingPage.page_id === page.page_id
    );

    return {
      ...page,
      is_page: true,
      TIER: pageFolder ? pageFolder.TIER + 1 : 1,
      VISIBLE,
      SELECTED: page.SELECTED ? page.SELECTED : false,
      DRAFT_TITLE:
        existingPage?.DRAFT_TITLE !== page.TITLE ? page.DRAFT_TITLE : page.TITLE,
      draft_name: existingPage?.draft_name !== page.name ? page.draft_name : page.name,
      draft_body: existingPage?.draft_body !== page.body ? page.draft_body : page.body,
      OPEN: existingPage?.OPEN ? true : false,
    };
  });
};
