export type FolderState = {
  id: number;
  parent_folder_id: number | null;
  name: string;
  eff_status: number;
  TAGS: Array<number>;
  TIER: number;
  ORDER: number;
  VISIBLE: boolean;
  SELECTED: boolean;
  is_page: boolean;
  EXPANDED_STATUS: boolean;
  created_dttm: string;
  modified_dttm: string | null;
  created_by_id: number;
  modified_by_id: number | null;
};

export type TagState = {
  id: number;
  name: string;
  color_id: number;
  HAS_DEFAULT_COLOR: boolean;
  eff_status: number;
  created_dttm: string;
  modified_dttm: string | null;
  created_by_id: number;
  modified_by_id: number | null;
  COLOR_CODE: string;
  SELECTED: boolean;
};

export type UntitledPageState = {
  name: string;
  body: string;
  IS_UNTITLED: boolean;
  IS_INITIAL: boolean;
};

export type PageState = {
  id: number | null;
  page_id: number;
  folder_id: number | null;
  name: string;
  TITLE: string;
  body: string;
  IS_FAVORITE: boolean;
  eff_status: number;
  created_dttm: string;
  modified_dttm: string | null;
  created_by_id: number;
  modified_by_id: number | null;
  TAGS: Array<number>;
  is_page: boolean;
  TIER: number;
  VISIBLE: boolean;
  SELECTED: boolean;
  DRAFT_TITLE: string;
  draft_name: string;
  draft_body: string;
  OPEN: boolean;
  ACTIVE: boolean;
  is_modified: boolean;
  IS_UNTITLED: boolean;
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
    IS_UNTITLED: boolean;
    IS_INITIAL: boolean;
  };
};

export type TagsState = {
  list: Array<TagState>;
  selected: TagState | null;
  colorOptions: {
    default: Array<ColorState>;
    userCreated: Array<ColorState>;
  };
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
  TAGS: Array<number>;
  TIER: number;
  ORDER: number;
  VISIBLE: boolean;
  SELECTED: boolean;
  is_page: boolean;
};

export type ModalsState = {
  unsavedWarning: boolean;
  deleteModal: boolean;
  tagsModal: boolean;
};

export type UserState = {
  id: number;
  USERNAME: string;
  ADMIN: boolean;
  HASH: string;
  SALT: string;
  created_dttm: string;
  modified_dttm: string | null;
};

export type ColorState = {
  id: number;
  COLOR_CODE: string;
  eff_status: number;
  created_dttm: string;
  modified_dttm: string;
  IS_DEFAULT_COLOR: number;
};

export type ColorPickerState = {
  toggled: boolean;
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
  TITLE: string | null;
  body: string | null;
  IS_FAVORITE: boolean;
  eff_status: number;
  created_dttm: string;
  modified_dttm: string | null;
  created_by_id: number;
  modified_by_id: number | null;
  is_modified: boolean | null;
  EXPANDED_STATUS: boolean;
  TAGS: Array<number>;
  is_page: boolean;
  TIER: number;
  VISIBLE: boolean;
  SELECTED: boolean;
  DRAFT_TITLE: string | null;
  draft_name: string | null;
  draft_body: string;
  OPEN: boolean;
  ACTIVE: boolean;
  ORDER: number;
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
  toggled: boolean,
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
  loading: boolean,
  floating: boolean
};
