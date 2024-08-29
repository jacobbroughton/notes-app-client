export type FolderState = {
  id: number;
  parent_folder_id: number | null;
  name: string;
  eff_status: number;
  tag_id: number | null;
  tag_color_code: string | null;
  tag_name: string | null;
  tier: number;
  order: number;
  visible: boolean;
  selected: boolean;
  is_page: boolean;
  expanded_status: boolean;
  created_dttm: string;
  modified_dttm: string | null;
  created_by_id: number;
  modified_by_id: number | null;
};

export type TagState = {
  id: number;
  name: string;
  color_id: number;
  eff_status: number;
  created_dttm: string;
  modified_dttm: string | null;
  created_by_id: number;
  modified_by_id: number | null;
  color_code: string;
  selected: boolean;
};

export type UntitledPageState = {
  name: string;
  body: string;
  is_untitled: boolean;
  is_initial: boolean;
};

export type PageState = {
  id: number | null;
  page_id: number;
  folder_id: number | null;
  name: string;
  title: string;
  body: string;
  is_favorite: boolean;
  eff_status: number;
  created_dttm: string;
  modified_dttm: string | null;
  created_by_id: number;
  modified_by_id: number | null;
  tag_id: number | null;
  tag_color_code: string | null;
  tag_name: string | null;
  is_page: boolean;
  tier: number;
  visible: boolean;
  selected: boolean;
  draft_title: string;
  draft_name: string;
  draft_body: string;
  open: boolean;
  active: boolean;
  is_modified: boolean;
  is_untitled: boolean;
};

export type FoldersState = {
  list: Array<FolderState>;
  selected: FolderState | null;
  stagedToDelete: FolderState | null;
  active: FolderState | null;
};

export type PagesState = {
  list: Array<PageState> | [];
  selected: PageState | null;
  active: PageState | null;
  stagedToSwitch: PageState | null;
  stagedToDelete: PageState | null;
  untitledPage: {
    name: string;
    body: string;
    is_untitled: boolean;
    is_initial: boolean;
  };
};

export type TagsState = {
  list: Array<TagState>;
  selected: TagState | null;
  colorOptions: Array<ColorState>;
};

export type SidebarItemState = {
  id: number | null;
  page_id: number | null;
  parent_folder_id: number | null;
  name: string;
  eff_status: number;
  created_dttm: string;
  modified_dttm: string | null;
  created_by_id: number;
  modified_by_id: number | null;
  tag_id: number | null;
  tag_color_code: string | null;
  tag_name: string | null;
  tier: number;
  order: number;
  visible: boolean;
  selected: boolean;
  is_page: boolean;
};

export type ModalsState = {
  unsavedWarning: boolean;
  deleteModal: boolean;
  tagsModal: boolean;
};

export type UserState = {
  id: number;
  username: string;
  admin: boolean;
  hash: string;
  salt: string;
  created_dttm: string;
  modified_dttm: string | null;
};

export type ColorState = {
  id: number;
  color_code: string;
  eff_status: number;
  created_dttm: string;
  modified_dttm: string;
};

export type ContextMenuButton = {
  text: string;
  icon: string;
  onClick: Function;
  active: boolean;
  isSpacer: boolean;
};

export type ItemState = {
  id: number | null;
  page_id: number | null;
  folder_id: number | null;
  name: string;
  title: string | null;
  body: string | null;
  is_favorite: boolean;
  eff_status: number;
  created_dttm: string;
  modified_dttm: string | null;
  created_by_id: number;
  modified_by_id: number | null;
  is_modified: boolean | null;
  expanded_status: boolean;
  tag_id: number | null;
  tag_color_code: string | null;
  tag_name: string | null;
  is_page: boolean;
  tier: number;
  visible: boolean;
  selected: boolean;
  draft_title: string | null;
  draft_name: string | null;
  draft_body: string;
  open: boolean;
  active: boolean;
  order: number;
  parent_folder_id: number | null;
};

export type SidebarState = {
  width: number;
  view: {
    id: number;
    name: string;
  };
  viewOptions: Array<{
    id: number;
    name: string;
  }>;
  toggled: boolean;
  searchValue: string;
  shiftClickItems: {
    start: number | null;
    end: number | null;
    list: Array<SidebarItemState>;
  };
  newTagFormToggled: boolean;
  dragToggled: boolean;
  draggedOverItem: {
    id: number;
    page_id: number | undefined;
  } | null;
  grabbedItem: ItemState | null;
  inputPosition: {
    referenceId: number | null;
    toggled: boolean;
    forFolder: boolean;
  };
  renameInputToggled: boolean;
  newNameForRename: string;
  newPageName: string;
  newFolderName: string;
  loading: boolean;
  floating: boolean;
};
