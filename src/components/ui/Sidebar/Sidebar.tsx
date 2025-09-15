import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  collapseFolders,
  deselectFolder,
  expandFolders,
  setFolders,
  setStagedFolderToDelete,
} from "../../../redux/folders";
import { toggleModal } from "../../../redux/modals";
import { setFavoriteStatus, setPages, setStagedPageToDelete } from "../../../redux/pages";
import {
  setInputPosition,
  setNewFolderName,
  setNewNameForRename,
  setNewPageName,
  setNewTagFormToggled,
  setRenameInputToggled,
  setSidebarFloating,
  setSidebarLoading,
  setSidebarToggled,
  setSidebarView,
  setSidebarWidth,
} from "../../../redux/sidebar";
import { RootState } from "../../../redux/store";
import { setTheme } from "../../../redux/theme";
import { ItemState } from "../../../types";
import { formatFolders, formatPages } from "../../../utils/formatData";
import { getApiUrl } from "../../../utils/getUrl";
import ContextMenu from "../ContextMenu/ContextMenu";
import PageIcon from "../Icons/PageIcon";
import SearchIcon from "../Icons/SearchIcon";
import TagIcon from "../Icons/TagIcon";
import UserIcon from "../Icons/UserIcon";
import ItemList from "../ItemList/ItemList";
import PageSearch from "../PageSearch/PageSearch";
import TagsSidebarView from "../TagsSidebarView/TagsSidebarView";
import UserMenu from "../UserMenu/UserMenu";
import "./Sidebar.css";
import { deselectTag } from "../../../redux/tags";
import FloatingWindowsIcon from "../Icons/FloatingWindowsIcon";

function Sidebar() {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const inputPositionRef = useRef<HTMLInputElement | null>(null);
  const contextMenuRef = useRef<HTMLMenuElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: {
      x: number;
      y: number;
    };
    toggled: boolean;
  }>({
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });
  const [userMenuToggled, setUserMenuToggled] = useState(false);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const folders = useSelector((state: RootState) => state.folders);
  const pages = useSelector((state: RootState) => state.pages);
  const tags = useSelector((state: RootState) => state.tags);
  const sidebar = useSelector((state: RootState) => state.sidebar);
  const theme = useSelector((state: RootState) => state.theme);
  const combined = useSelector((state: RootState) => state.combined);
  const dispatch = useDispatch();

  const startResizing = useCallback(() => {
    setIsResizingSidebar(true);
  }, []);

  const stopResizing = useCallback(() => {
    localStorage.setItem("lastSidebarWidth", sidebar.width.toString());
    setIsResizingSidebar(false);
  }, [sidebar.width]);

  const resizeSidebar = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizingSidebar && sidebarRef.current) {
        const unitsFromLeft =
          mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
        if (unitsFromLeft >= 40) dispatch(setSidebarWidth(unitsFromLeft));
      }
    },
    [isResizingSidebar]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resizeSidebar, { passive: true });
    window.addEventListener("mouseup", stopResizing, { passive: true });
    return () => {
      window.removeEventListener("mousemove", resizeSidebar);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resizeSidebar, stopResizing]);

  async function handleNewFolderSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch(`${getApiUrl()}/folders/new/`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        credentials: "include",
        body: JSON.stringify({
          parentFolderId:
            sidebar.inputPosition.referenceId === 0
              ? null
              : sidebar.inputPosition.referenceId,
          newFolderName: sidebar.newFolderName,
        }),
      });

      if (response.status !== 200) throw response.statusText;

      const data = await response.json();

      if (!data) throw "There was an issue parsing /tags/new response";

      dispatch(
        setInputPosition({
          referenceId: null,
          toggled: false,
          forFolder: false,
        })
      );
      dispatch(setNewFolderName(""));
      resetContextMenu();
      getData();
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  async function handleNewPageSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch(`${getApiUrl()}/pages/new/`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        credentials: "include",
        body: JSON.stringify({
          parentFolderId:
            sidebar.inputPosition.referenceId === 0
              ? null
              : sidebar.inputPosition.referenceId,
          newPageName: sidebar.newPageName,
        }),
      });

      if (response.status !== 200) throw response.statusText;

      const data = await response.json();

      if (!data) throw "There was an issue parsing /pages/new response";

      dispatch(
        setInputPosition({
          referenceId: null,
          toggled: false,
          forFolder: false,
        })
      );
      dispatch(setNewPageName(""));
      resetContextMenu();
      getData();
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  function handleDeleteSingle(e: MouseEvent, item: any) {
    e.stopPropagation();
    dispatch(toggleModal("deleteModal"));
    if (item.is_page) {
      dispatch(setStagedPageToDelete(item));
    } else {
      dispatch(setStagedFolderToDelete(item));
    }
    dispatch(
      setInputPosition({
        referenceId: null,
        toggled: false,
        forFolder: false,
      })
    );
    resetContextMenu();
  }

  function handleDeleteMultiple() {
    dispatch(toggleModal("deleteModal"));
    dispatch(
      setInputPosition({
        referenceId: null,
        toggled: false,
        forFolder: false,
      })
    );
    resetContextMenu();
  }

  function handleRename(e: MouseEvent, item: ItemState) {
    e.stopPropagation();

    resetContextMenu();

    new Promise((resolve) => {
      dispatch(setRenameInputToggled(true));
      dispatch(setNewNameForRename(item.name));
      resetContextMenu();
      resolve("success");
    }).then(() => {
      if (renameInputRef.current) {
        renameInputRef?.current.focus();
        renameInputRef?.current.select();
      }
    });
  }

  function handleTag(e: MouseEvent) {
    e.stopPropagation();

    resetContextMenu();

    dispatch(toggleModal("tagsModal"));
  }

  function handleNewPage(e: MouseEvent, item: ItemState) {
    e.stopPropagation();
    resetContextMenu();

    let referenceId = 0;

    if (folders.selected) {
      referenceId = folders.selected.id;
    } else if (pages.active && pages.active.folder_id) {
      referenceId = pages.active.folder_id;
    }

    dispatch(
      setInputPosition({
        referenceId,
        toggled: true,
        forFolder: false,
      })
    );
  }

  function handleNewFolder(e: MouseEvent) {
    e.stopPropagation();
    resetContextMenu();

    let referenceId = 0;

    if (folders.selected) {
      referenceId = folders.selected.id;
    } else if (pages.active && pages.active.folder_id) {
      referenceId = pages.active.folder_id;
    }

    dispatch(
      setInputPosition({
        referenceId,
        toggled: true,
        forFolder: true,
      })
    );
    if (sidebar.inputPosition.referenceId === null) dispatch(deselectFolder(null));
  }

  async function getData() {
    try {
      dispatch(setSidebarLoading(true));
      const [foldersResponse, pagesResponse] = await Promise.all([
        fetch(`${getApiUrl()}/folders/`, {
          method: "GET",
          credentials: "include",
          headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
        }),
        fetch(`${getApiUrl()}/pages/`, {
          method: "GET",
          credentials: "include",
          headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
        }),
      ]);

      if (foldersResponse.status !== 200) {
        dispatch(setSidebarLoading(false));
        throw foldersResponse.statusText;
      }

      if (pagesResponse.status !== 200) {
        dispatch(setSidebarLoading(false));
        throw pagesResponse.statusText;
      }

      const [foldersData, pagesData] = await Promise.all([
        foldersResponse.json(),
        pagesResponse.json(),
      ]);

      console.log(foldersData, pagesData);

      let formattedFolders = formatFolders(foldersData, folders.list);
      let formattedPages = formatPages(pagesData, formattedFolders);

      dispatch(setFolders(formattedFolders));
      dispatch(setPages(formattedPages));
      dispatch(setSidebarLoading(false));
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  function resetContextMenu() {
    setContextMenu({
      position: {
        x: 0,
        y: 0,
      },
      toggled: false,
    });
  }

  async function handleAddToFavorites(e: MouseEvent, item: ItemState) {
    try {
      e.stopPropagation();

      const response = await fetch(`${getApiUrl()}/pages/favorite/`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        credentials: "include",
        body: JSON.stringify({
          favoriteStatus: item.is_favorite ? 0 : 1,
          pageId: item.page_id,
        }),
      });

      if (response.status !== 200) throw response.statusText;

      const data = await response.json();

      if (!data) throw "There was an issue parsing /pages/new response";

      if (item.is_page)
        dispatch(
          setFavoriteStatus({ favoriteStatus: item.is_favorite ? 0 : 1, page: item })
        );
      resetContextMenu();
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  useEffect(() => {
    if (inputPositionRef.current && sidebar.inputPosition.toggled)
      inputPositionRef?.current.focus();
  }, [sidebar.inputPosition.toggled]);

  useEffect(() => {
    dispatch(setPages(formatPages(pages?.list, folders?.list, pages.list)));
  }, [folders.list]);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const inputPositionHandler = (event: MouseEvent) => {
      if (
        inputPositionRef.current &&
        !inputPositionRef.current?.contains(event.target as HTMLElement) &&
        !(event.target as HTMLElement).classList.contains("new-folder-button") &&
        !(event.target as HTMLElement).classList.contains("new-page-button")
      ) {
        dispatch(setNewFolderName(""));
        dispatch(setNewPageName(""));
        resetContextMenu();
        dispatch(
          setInputPosition({
            referenceId: null,
            toggled: false,
            forFolder: false,
          })
        );
      }

      if (
        contextMenu.toggled &&
        !contextMenuRef.current?.contains(event.target as HTMLElement)
      ) {
        dispatch(setNewFolderName(""));
        dispatch(setNewPageName(""));
        resetContextMenu();
      }

      if (
        sidebar.renameInputToggled &&
        !(event.target as HTMLElement).classList.contains("rename-input") &&
        !(event.target as HTMLElement).classList.contains("rename")
      ) {
        dispatch(setRenameInputToggled(false));
        dispatch(setNewNameForRename(""));
      }
    };

    window.addEventListener("click", inputPositionHandler);

    return () => {
      window.removeEventListener("click", inputPositionHandler);
    };
  });

  const sidebarHeaderButtons = [
    {
      symbol: "< >",
      label: "Expand All",
      title: "Expand folders",
      disabled: sidebar.dragToggled,
      visible:
        sidebar.view.name === "Notes" &&
        combined.filter((item) => !item.is_page).length !== 0,
      onClick: () => dispatch(expandFolders(null)),
    },
    {
      symbol: "> <",
      label: "Collapse All",
      title: "Collapse folders",
      disabled: sidebar.dragToggled,
      visible:
        sidebar.view.name === "Notes" &&
        combined.filter((item) => !item.is_page).length !== 0,
      onClick: () => dispatch(collapseFolders(null)),
    },
    {
      symbol: "+P",
      label: "+ Page",
      title: "Create a new page",
      disabled: false,
      visible: sidebar.view.name === "Notes",
      className: "new-page-button",
      onClick: () => {
        let referenceId = 0;

        if (sidebar.inputPosition.toggled) {
          dispatch(
            setInputPosition({
              ...sidebar.inputPosition,
              referenceId: null,
              toggled: false,
            })
          );
        } else {
          if (folders.selected) {
            referenceId = folders.selected.id;
          } else if (pages.active && pages.active.folder_id) {
            referenceId = pages.active.folder_id;
          }

          dispatch(
            setInputPosition({
              referenceId,
              toggled: true,
              forFolder: false,
            })
          );
        }
      },
    },
    {
      symbol: "+F",
      label: "+ Folder",
      title: "Create a new folder",
      disabled: false,
      visible: sidebar.view.name === "Notes",
      className: "new-folder-button",
      onClick: () => {
        let referenceId = 0;

        if (sidebar.inputPosition.toggled) {
          dispatch(
            setInputPosition({
              ...sidebar.inputPosition,
              referenceId: null,
              toggled: false,
            })
          );
        } else {
          if (folders.selected) {
            referenceId = folders.selected.id;
          } else if (pages.active && pages.active.folder_id) {
            referenceId = pages.active.folder_id;
          }

          dispatch(
            setInputPosition({
              referenceId,
              toggled: true,
              forFolder: true,
            })
          );
        }

        if (sidebar.inputPosition.referenceId === null) dispatch(deselectFolder(null));
      },
    },
    {
      symbol: "+",
      label: "+ Tag",
      title: "Create a new tag",
      disabled: sidebar.dragToggled,
      visible: sidebar.view.name === "Tags",
      onClick: () => dispatch(setNewTagFormToggled(!sidebar.newTagFormToggled)),
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        {/* <button
          onClick={() => {
            dispatch(setSidebarToggled(!sidebar.toggled));
          }}
          className="sidebar-toggle-button"
          title={`Toggle Sidebar ${sidebar.toggled ? "Off" : "On"}`}
        >
          {sidebar.toggled ? <DoubleArrowLeft /> : <DoubleArrowRight />}
        </button> */}

        {sidebar.viewOptions.map((viewOption, index) => (
          <button
            onClick={() => {
              dispatch(setSidebarView(viewOption));
              if (!sidebar.toggled) dispatch(setSidebarToggled(true));
              if (sidebar.width <= 60) dispatch(setSidebarWidth(275));
              if (viewOption.id === 1 && sidebar.view.id === 1) {
                dispatch(setSidebarToggled(!sidebar.toggled));
              }
              if (viewOption.id === 3 && tags.selected) {
                dispatch(setNewTagFormToggled(false));
                dispatch(deselectTag());
              }
            }}
            className={viewOption.id === sidebar.view.id ? "current" : ""}
            key={index}
            title={viewOption.name}
          >
            {viewOption.id === 1 && <PageIcon />}
            {viewOption.id === 2 && <SearchIcon />}
            {viewOption.id === 3 && <TagIcon />}
          </button>
        ))}

        <button
          className="sidebar-button theme-button"
          onClick={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button
          className="sidebar-button user-button"
          onClick={() => {
            setUserMenuToggled(!userMenuToggled);
          }}
          title="User options"
        >
          <UserIcon />
        </button>
        <button
          className={`floating-sidebar-button ${sidebar.floating ? "toggled" : ""}`}
          onClick={() => {
            dispatch(setSidebarFloating(!sidebar.floating));
          }}
          title="Set Sidebar to 'Floating' Mode"
        >
          <FloatingWindowsIcon/>
        </button>
      </div>
      {userMenuToggled && <UserMenu setUserMenuToggled={setUserMenuToggled} />}
      {sidebar.toggled && (
        <div
          className="sidebar-body"
          style={{ width: `${sidebar.width ? `${sidebar.width}px` : "225px"}` }}
          ref={sidebarRef}
        >
          <div className="current-view">
            <p>{sidebar.view.name}</p>
          </div>
          {(sidebar.view.name === "Notes" || sidebar.view.name === "Tags") &&
            tags.selected === null &&
            !sidebar.newTagFormToggled && (
              <div className="header">
                <div className="sidebar-header-buttons">
                  {sidebarHeaderButtons.map((button, i) => {
                    if (button.visible) {
                      return (
                        <button
                          className={button.className}
                          disabled={button.disabled}
                          onClick={button.onClick}
                          title={button.title}
                          key={i}
                        >
                          {button.symbol}
                          {/* {button.label} */}
                        </button>
                      );
                    }
                  })}
                </div>
                {sidebar.inputPosition.referenceId === 0 &&
                  sidebar.inputPosition.toggled && (
                    <form
                      className="new-folder-form"
                      onSubmit={
                        sidebar.inputPosition.forFolder
                          ? handleNewFolderSubmit
                          : handleNewPageSubmit
                      }
                    >
                      <input
                        ref={inputPositionRef}
                        spellCheck="false"
                        onChange={(e) => {
                          if (sidebar.inputPosition.forFolder) {
                            dispatch(setNewFolderName(e.target.value));
                          } else {
                            dispatch(setNewPageName(e.target.value));
                          }
                        }}
                        value={
                          sidebar.inputPosition.forFolder
                            ? sidebar.newFolderName
                            : sidebar.newPageName
                        }
                        autoComplete="off"
                        placeholder={`Enter ${sidebar.inputPosition.forFolder ? 'folder' : 'page'} name`}
                      />
                    </form>
                  )}
              </div>
            )}
          {sidebar.view.name === "Notes" && (
            <ItemList
              setContextMenu={setContextMenu}
              handleNewFolderSubmit={handleNewFolderSubmit}
              handleNewPageSubmit={handleNewPageSubmit}
              inputPositionRef={inputPositionRef}
              resetContextMenu={resetContextMenu}
              handleRename={handleRename}
              renameInputRef={renameInputRef}
            />
          )}
          {sidebar.view.name === "Search" && <PageSearch />}
          {sidebar.view.name === "Tags" && <TagsSidebarView />}
        </div>
      )}

      <ContextMenu
        item={pages.active || folders.selected} // TODO - figure out how to determine which
        toggled={contextMenu.toggled}
        positionX={contextMenu.position.x}
        positionY={contextMenu.position.y - 15}
        contextMenuRef={contextMenuRef}
        buttons={[
          {
            text: "New Page",
            icon: "📄",
            active: !pages.selected?.is_favorite && sidebar.shiftClickItems.end === null,
            onClick: handleNewPage,
            isSpacer: false,
          },
          {
            text: "New Folder",
            icon: "📁",
            active: !pages.selected?.is_favorite && sidebar.shiftClickItems.end === null,
            onClick: handleNewFolder,
            isSpacer: false,
          },
          {
            text: "",
            icon: "",
            onClick: () => null,
            active:
              !pages.selected?.is_favorite &&
              sidebar.shiftClickItems.end === null &&
              sidebar.inputPosition.referenceId !== 0,
            isSpacer: true,
          },
          {
            text: "Add Tag",
            icon: "#️⃣",
            active:
              sidebar.shiftClickItems.end === null &&
              sidebar.inputPosition.referenceId !== 0,
            onClick: handleTag,
            isSpacer: false,
          },
          {
            text: "Add To Favorites",
            icon: "⭐️",
            active:
              !pages.active?.is_favorite &&
              sidebar.shiftClickItems.end === null &&
              sidebar.inputPosition.referenceId !== 0,
            onClick: handleAddToFavorites,
            isSpacer: false,
          },
          {
            text: "Remove From Favorites",
            icon: "⭐️",
            active:
              (pages.active?.is_favorite &&
                sidebar.shiftClickItems.end === null &&
                sidebar.inputPosition.referenceId !== 0) ||
              false,
            onClick: handleAddToFavorites,
            isSpacer: false,
          },
          {
            text: "",
            icon: "",
            onClick: () => null,
            active:
              sidebar.shiftClickItems.end === null &&
              sidebar.inputPosition.referenceId !== 0,
            isSpacer: true,
          },
          {
            text: "Rename",
            icon: "ABC",
            active:
              sidebar.shiftClickItems.end === null &&
              sidebar.inputPosition.referenceId !== 0,
            onClick: handleRename,
            isSpacer: false,
          },
          {
            text: "Delete",
            icon: "🗑️",
            active: sidebar.inputPosition.referenceId !== 0,
            onClick: sidebar.shiftClickItems.end
              ? handleDeleteMultiple
              : handleDeleteSingle,
            isSpacer: false,
          },
        ]}
      />
      <div
        className={`drag-sidebar-button ${sidebar.dragToggled ? "active" : ""} ${
          sidebar.toggled ? "" : "disabled"
        }`}
        onMouseDown={startResizing}
      ></div>
    </aside>
  );
}

export default Sidebar;
