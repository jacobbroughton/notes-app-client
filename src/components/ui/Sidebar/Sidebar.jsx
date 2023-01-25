import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFolders,
  collapseFolders,
  expandFolders,
  deselectFolder,
  setStagedFolderToDelete,
} from "../../../redux/folders";
import { setFavoriteStatus, setPages, setStagedPageToDelete } from "../../../redux/pages";
import {
  setSidebarWidth,
  setSidebarView,
  setNewTagFormToggled,
  setDragToggled,
  setRenameInputToggled,
  setNewNameForRename,
  setNewPageName,
  setNewFolderName,
} from "../../../redux/sidebar";
import { formatFolders, formatPages } from "../../../utils/formatData";
import { toggleModal } from "../../../redux/modals";
import { setTheme } from "../../../redux/theme";
import ContextMenu from "../ContextMenu/ContextMenu";
import UserMenu from "../UserMenu/UserMenu";
import ItemList from "../ItemList/ItemList";
import PageSearch from "../PageSearch/PageSearch";
import SearchIcon from "../Icons/SearchIcon";
import TagIcon from "../Icons/TagIcon";
import UserIcon from "../Icons/UserIcon";
import PageIcon from "../Icons/PageIcon";
import Draggable from "react-draggable";
import "./Sidebar.css";
import TagsSidebarView from "../TagsSidebarView/TagsSidebarView";
import { throwResponseStatusError } from "../../../utils/throwResponseStatusError";
import { setInputPosition } from "../../../redux/sidebar";

function Sidebar() {
  const sidebarRef = useRef(null);
  const inputPositionRef = useRef(null);
  const contextMenuRef = useRef(null);
  const draggableRef = useRef(null);
  const renameInputRef = useRef(null);
  // const [newFolderName, setNewFolderName] = useState("");
  // const [newPageName, setNewPageName] = useState("");
  // const [dragToggled, setDragToggled] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });

  // const [sidebar.inputPosition, dispatch(setInputPosition] = useState({
  //   referenceId: null,
  //   toggled: false,
  //   forFolder: false,
  // }));
  const [userMenuToggled, setUserMenuToggled] = useState(false);
  // const [newName, dispatch(setNewNameForRename)] = useState("");

  const folders = useSelector((state) => state.folders);
  const pages = useSelector((state) => state.pages);
  const tags = useSelector((state) => state.tags);
  const sidebar = useSelector((state) => state.sidebar);
  const theme = useSelector((state) => state.theme);
  const combined = useSelector((state) => state.combined);
  const dispatch = useDispatch();

  function onDragSidebar(e, data) {
    dispatch(setSidebarWidth(data.x));
  }

  async function handleNewFolderSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/folders/new", {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
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

      if (response.status !== 200) throwResponseStatusError(response, "POST");

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
      getData(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleNewPageSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/pages/new", {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
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

      if (response.status !== 200) throwResponseStatusError(response, "POST");

      const data = await response.json();

      if (!data) throw "There was an issue parsing /pages/new response";

      dispatch(
        setInputPosition({
          referenceId: null,
          toggled: false,
          forFolder: false,
        })
      );
      setNewPageName("");
      resetContextMenu();
      getData(false);
    } catch (error) {
      console.log(error);
    }
  }

  function handleDeleteSingle(e, item) {
    e.stopPropagation();

    dispatch(toggleModal("deleteModal"));
    if (item.IS_PAGE) {
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

  function handleDeleteMultiple(e) {
    e.stopPropagation();

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

  function handleRename(e, item) {
    e.stopPropagation();

    resetContextMenu();

    new Promise((resolve) => {
      dispatch(setRenameInputToggled(true));
      dispatch(setNewNameForRename(item.NAME));
      resetContextMenu();
      resolve();
    }).then(() => {
      if (renameInputRef.current) {
        renameInputRef?.current.focus();
        renameInputRef?.current.select();
      }
    });
  }

  function handleTag(e, item) {
    e.stopPropagation();

    resetContextMenu();

    dispatch(toggleModal("tagsModal"));
  }

  function handleNewPage() {
    resetContextMenu();

    let referenceId = 0;

    if (folders.selected) {
      referenceId = folders.selected.ID;
    } else if (pages.active && pages.active.FOLDER_ID) {
      referenceId = pages.active.FOLDER_ID;
    }

    dispatch(
      setInputPosition({
        referenceId,
        toggled: true,
        forFolder: false,
      })
    );
  }

  function handleNewFolder() {
    resetContextMenu();

    let referenceId = 0;

    if (folders.selected) {
      referenceId = folders.selected.ID;
    } else if (pages.active && pages.active.FOLDER_ID) {
      referenceId = pages.active.FOLDER_ID;
    }

    dispatch(
      setInputPosition({
        referenceId,
        toggled: true,
        forFolder: true,
      })
    );
    if (sidebar.inputPosition.referenceId === null) dispatch(deselectFolder());
  }

  async function getData() {
    try {
      let foldersResponse = await fetch("http://localhost:3001/folders", {
        method: "GET",
        credentials: "include",
      });

      if (foldersResponse.status !== 200)
        throwResponseStatusError(foldersResponse, "GET");

      let pagesResponse = await fetch("http://localhost:3001/pages", {
        method: "GET",
        credentials: "include",
      });

      if (pagesResponse.status !== 200) throwResponseStatusError(pagesResponse, "GET");

      let foldersData = await foldersResponse.json();

      if (!foldersData) throw "There was an issue parsing /folders response";

      let pagesData = await pagesResponse.json();

      if (!pagesData) throw "There was an issue parsing /pages response";

      let formattedFolders = formatFolders(foldersData.folders, folders.list, pages.list);
      let formattedPages = formatPages(pagesData.pages, formattedFolders, pages.list);

      dispatch(setFolders(formattedFolders));
      dispatch(setPages(formattedPages));
    } catch (error) {
      console.log(error);
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

  async function handleAddToFavorites(e, item) {
    try {
      const response = await fetch("http://localhost:3001/pages/favorite", {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        credentials: "include",
        body: JSON.stringify({
          favoriteStatus: 1,
          pageId: item.PAGE_ID,
        }),
      });

      if (response.status !== 200) throwResponseStatusError(response, "POST");

      const data = await response.json();

      if (!data) throw "There was an issue parsing /pages/new response";

      if (item.IS_PAGE) dispatch(setFavoriteStatus({ favoriteStatus: 1, page: item }));
    } catch (error) {
      console.log(error);
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
    getData(true);
  }, []);

  useEffect(() => {
    const inputPositionHandler = (event) => {
      if (
        inputPositionRef.current &&
        !inputPositionRef.current?.contains(event.target) &&
        !event.target.classList.contains("new-folder-button") &&
        !event.target.classList.contains("new-page-button")
      ) {
        dispatch(setNewFolderName(""));
        setNewPageName("");
        resetContextMenu();
        dispatch(
          setInputPosition({
            referenceId: null,
            toggled: false,
            forFolder: false,
          })
        );
      }

      if (!contextMenuRef.current?.contains(event.target)) {
        dispatch(setNewFolderName(""));
        setNewPageName("");
        resetContextMenu();
      }

      if (
        sidebar.renameInputToggled &&
        !event.target.classList.contains("rename-input")
      ) {
        dispatch(setRenameInputToggled(false));
      }
    };

    document.addEventListener("click", inputPositionHandler);

    return () => {
      document.removeEventListener("click", inputPositionHandler);
    };
  });

  const sidebarHeaderButtons = [
    {
      symbol: "< >",
      title: "Expand folders",
      disabled: sidebar.dragToggled,
      visible:
        sidebar.view.name === "Notes" &&
        combined.filter((item) => !item.IS_PAGE).length !== 0,
      onClick: () => dispatch(expandFolders()),
    },
    {
      symbol: "> <",
      title: "Collapse folders",
      disabled: sidebar.dragToggled,
      visible:
        sidebar.view.name === "Notes" &&
        combined.filter((item) => !item.IS_PAGE).length !== 0,
      onClick: () => dispatch(collapseFolders()),
    },
    {
      symbol: "+P",
      title: "Create a new page",
      disabled: "",
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
            referenceId = folders.selected.ID;
          } else if (pages.active && pages.active.FOLDER_ID) {
            referenceId = pages.active.FOLDER_ID;
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
      title: "Create a new folder",
      disabled: "",
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
            referenceId = folders.selected.ID;
          } else if (pages.active && pages.active.FOLDER_ID) {
            referenceId = pages.active.FOLDER_ID;
          }

          dispatch(
            setInputPosition({
              referenceId,
              toggled: true,
              forFolder: true,
            })
          );
        }

        if (sidebar.inputPosition.referenceId === null) dispatch(deselectFolder());
      },
    },
    {
      symbol: "+",
      title: "Create a new tag",
      disabled: sidebar.dragToggled,
      visible: sidebar.view.name === "Tags",
      onClick: () => dispatch(setNewTagFormToggled(!sidebar.newTagFormToggled)),
    },
  ];

  return (
    <aside
      ref={sidebarRef}
      className="sidebar"
      style={{ width: `${sidebar.width ? `${sidebar.width}px` : "275px"}` }}
    >
      <div className="sidebar-nav">
        {sidebar.viewOptions.map((viewOption, index) => (
          <button
            onClick={() => dispatch(setSidebarView(viewOption))}
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
          className="theme-button"
          onClick={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button
          className="user-button"
          onClick={() => setUserMenuToggled(!userMenuToggled)}
          title="User options"
        >
          <UserIcon />
        </button>
        {userMenuToggled && <UserMenu setUserMenuToggled={setUserMenuToggled} />}
      </div>
      <div className="sidebar-body">
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
                        sidebar.inputPosition.forFolder ? sidebar.newFolderName : sidebar.newPageName
                      }
                    />
                  </form>
                )}
            </div>
          )}
        {sidebar.view.name === "Notes" && (
          <>
            <ItemList
              setContextMenu={setContextMenu}
              handleNewFolderSubmit={handleNewFolderSubmit}
              handleNewPageSubmit={handleNewPageSubmit}
              // newFolderName={newFolderName}
              inputPositionRef={inputPositionRef}
              // newPageName={newPageName}
              // setNewPageName={setNewPageName}
              // setNewFolderName={setNewFolderName}
              resetContextMenu={resetContextMenu}
              handleRename={handleRename}
              renameInputRef={renameInputRef}
            />
          </>
        )}
        {sidebar.view.name === "Search" && <PageSearch />}
        {sidebar.view.name === "Tags" && <TagsSidebarView />}
      </div>
      <Draggable
        axis="x"
        nodeRef={draggableRef}
        defaultPosition={{ x: sidebarRef?.current?.offsetWidth, y: 0 }}
        position={{
          x: sidebar.width ? sidebar.width : sidebarRef?.current?.offsetWidth,
        }}
        onDrag={onDragSidebar}
        onStart={() => dispatch(setDragToggled(true))}
        onStop={() => dispatch(setDragToggled(false))}
      >
        <div
          ref={draggableRef}
          className={`drag-sidebar-button ${sidebar.dragToggled ? "active" : ""}`}
        ></div>
      </Draggable>
      <ContextMenu
        item={pages.active || folders.selected}
        toggled={contextMenu.toggled}
        positionX={contextMenu.position.x}
        positionY={contextMenu.position.y - 15}
        ref={contextMenuRef}
        buttons={[
          {
            text: "New Page",
            icon: "📄",
            active: sidebar.shiftClickItems.end === null,
            onClick: handleNewPage,
          },
          {
            text: "New Folder",
            icon: "📁",
            active: sidebar.shiftClickItems.end === null,
            onClick: handleNewFolder,
          },
          {
            active:
              sidebar.shiftClickItems.end === null &&
              sidebar.inputPosition.referenceId !== 0,
            isSpacer: true,
          },
          {
            text: "Add Tags",
            icon: "#️⃣",
            active:
              sidebar.shiftClickItems.end === null &&
              sidebar.inputPosition.referenceId !== 0,
            onClick: handleTag,
          },
          {
            text: "Add To Favorites",
            icon: "⭐️",
            active:
              sidebar.shiftClickItems.end === null &&
              sidebar.inputPosition.referenceId !== 0,
            onClick: handleAddToFavorites,
          },
          {
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
          },
          {
            text: "Delete",
            icon: "🗑️",
            active: sidebar.inputPosition.referenceId !== 0,
            onClick: sidebar.shiftClickItems.end
              ? handleDeleteMultiple
              : handleDeleteSingle,
          },
        ]}
      />
    </aside>
  );
}

export default Sidebar;
