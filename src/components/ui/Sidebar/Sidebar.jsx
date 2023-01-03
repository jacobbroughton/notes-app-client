import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFolders,
  collapseFolders,
  expandFolders,
  deselectFolder,
  setStagedFolderToDelete,
} from "../../../redux/folders";
import { setPages, setStagedPageToDelete } from "../../../redux/pages";
import {
  setSidebarWidth,
  setSidebarView,
  setNewTagFormToggled,
} from "../../../redux/sidebar";
import { formatFolders, formatPages } from "../../../utils/formatData";
import { toggleModal } from "../../../redux/modals";
import { setTheme } from "../../../redux/theme";
import ContextMenu from "../ContextMenu/ContextMenu";
import UserMenu from "../UserMenu/UserMenu";
import FoldersList from "../FoldersList/FoldersList";
import PageSearch from "../PageSearch/PageSearch";
import SearchIcon from "../Icons/SearchIcon";
import TagIcon from "../Icons/TagIcon";
import UserIcon from "../Icons/UserIcon";
import PageIcon from "../Icons/PageIcon";
import Draggable from "react-draggable";
import "./Sidebar.css";
import TagsSidebarView from "../TagsSidebarView/TagsSidebarView";

function Sidebar() {
  const sidebarRef = useRef(null);
  const inputPositionRef = useRef(null);
  const contextMenuRef = useRef(null);
  const draggableRef = useRef(null);
  const renameInputRef = useRef(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [dragToggled, setDragToggled] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });
  const [inputPosition, setInputPosition] = useState({
    referenceId: null,
    toggled: false,
    forFolder: false,
  });
  const [renameInputToggled, setRenameInputToggled] = useState(false);
  const [userMenuToggled, setUserMenuToggled] = useState(false);
  const [newName, setNewName] = useState("");

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

  function handleNewFolderSubmit(e) {
    e.preventDefault();
    fetch("http://localhost:3001/folders/new", {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      credentials: "include",
      body: JSON.stringify({
        parentFolderId:
          inputPosition.referenceId === 0 ? null : inputPosition.referenceId,
        newFolderName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setInputPosition({
          referenceId: null,
          toggled: false,
          forFolder: false,
        });
        resetContextMenu();
        getData(false);
      })
      .catch((err) => console.log(err));
  }

  function handleNewPageSubmit(e) {
    e.preventDefault();

    fetch("http://localhost:3001/pages/new", {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      credentials: "include",
      body: JSON.stringify({
        parentFolderId:
          inputPosition.referenceId === 0 ? null : inputPosition.referenceId,
        newPageName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setInputPosition({
          referenceId: null,
          toggled: false,
          forFolder: false,
        });
        resetContextMenu();
        getData(false);
      })
      .catch((err) => console.log(err));
  }

  function handleDeleteSingle(e, item) {
    e.stopPropagation();

    dispatch(toggleModal("deleteModal"));
    if (item.IS_PAGE) {
      dispatch(setStagedPageToDelete(item));
    } else {
      dispatch(setStagedFolderToDelete(item));
    }
    setInputPosition({
      referenceId: null,
      toggled: false,
      forFolder: false,
    });
    resetContextMenu();
  }

  function handleDeleteMultiple(e) {
    e.stopPropagation();

    dispatch(toggleModal("deleteModal"));
    setInputPosition({
      referenceId: null,
      toggled: false,
      forFolder: false,
    });
    resetContextMenu();
  }

  function handleRename(e, item) {
    e.stopPropagation();

    resetContextMenu();

    new Promise((resolve) => {
      setRenameInputToggled(true);
      setNewName(item.NAME);
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
    console.log("tag", item);
  }

  function handleNewPage(e, item) {
    resetContextMenu();

    let referenceId = 0;

    if (folders.selected) {
      referenceId = folders.selected.ID;
    } else if (pages.selected && pages.selected.FOLDER_ID) {
      referenceId = pages.selected.FOLDER_ID;
    }

    setInputPosition({
      referenceId,
      toggled: true,
      forFolder: false,
    });
  }

  function handleNewFolder(e, item) {
    const selectedFolder = folders.list.find((folder) => folder.SELECTED);

    resetContextMenu();

    let referenceId = 0;

    if (folders.selected) {
      referenceId = folders.selected.ID;
    } else if (pages.selected && pages.selected.FOLDER_ID) {
      referenceId = pages.selected.FOLDER_ID;
    }

    setInputPosition({
      referenceId,
      toggled: true,
      forFolder: true,
    });
    if (inputPosition.referenceId === null) dispatch(deselectFolder());
  }

  async function getData() {
    let foldersResponse = await fetch("http://localhost:3001/folders", {
      method: "GET",
      credentials: "include",
    });
    let pagesResponse = await fetch("http://localhost:3001/pages", {
      method: "GET",
      credentials: "include",
    });

    let foldersData = await foldersResponse.json();
    let pagesData = await pagesResponse.json();

    let formattedFolders = formatFolders(foldersData.folders, folders.list, pages.list);
    let formattedPages = formatPages(pagesData.pages, formattedFolders);

    dispatch(setFolders(formattedFolders));
    dispatch(setPages(formattedPages));
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

  useEffect(() => {
    console.log(inputPosition);
    if (inputPositionRef.current && inputPosition.toggled)
      inputPositionRef?.current.focus();
  }, [inputPosition.toggled]);

  useEffect(() => {
    dispatch(setPages(formatPages(pages?.list, folders?.list)));
  }, [folders]);

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
        setNewFolderName("");
        setNewPageName("");
        resetContextMenu();
        setInputPosition({
          referenceId: null,
          toggled: false,
          forFolder: false,
        });
      }

      if (!contextMenuRef.current?.contains(event.target)) {
        setNewFolderName("");
        setNewPageName("");
        resetContextMenu();
      }

      if (renameInputToggled && !event.target.classList.contains("rename-input")) {
        setRenameInputToggled(false);
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
      disabled: dragToggled,
      visible:
        sidebar.view.name === "Notes" &&
        combined.filter((item) => !item.IS_PAGE).length !== 0,
      onClick: () => dispatch(expandFolders()),
    },
    {
      symbol: "> <",
      title: "Collapse folders",
      disabled: dragToggled,
      visible:
        sidebar.view.name === "Notes" &&
        combined.filter((item) => !item.IS_PAGE).length !== 0,
      onClick: () => dispatch(collapseFolders()),
    },
    {
      symbol: "++",
      title: "Create a new page",
      disabled: "",
      visible: sidebar.view.name === "Notes",
      className: "new-page-button",
      onClick: () => {
        let referenceId = 0;

        if (inputPosition.toggled) {
          setInputPosition({
            ...inputPosition,
            referenceId: null,
            toggled: false,
          });
        } else {
          if (folders.selected) {
            referenceId = folders.selected.ID;
          } else if (pages.selected && pages.selected.FOLDER_ID) {
            referenceId = pages.selected.FOLDER_ID;
          }

          setInputPosition({
            referenceId,
            toggled: true,
            forFolder: false,
          });
        }
      },
    },
    {
      symbol: "+",
      title: "Create a new folder",
      disabled: "",
      visible: sidebar.view.name === "Notes",
      className: "new-folder-button",
      onClick: () => {
        let referenceId = 0;

        if (inputPosition.toggled) {
          setInputPosition({
            ...inputPosition,
            referenceId: null,
            toggled: false,
          });
        } else {
          if (folders.selected) {
            referenceId = folders.selected.ID;
          } else if (pages.selected && pages.selected.FOLDER_ID) {
            referenceId = pages.selected.FOLDER_ID;
          }

          setInputPosition({
            referenceId,
            toggled: true,
            forFolder: true,
          });
        }

        if (inputPosition.referenceId === null) dispatch(deselectFolder());
      },
    },
    {
      symbol: "+",
      title: "Create a new tag",
      disabled: dragToggled,
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
          >
            {viewOption.id === 1 && <PageIcon />}
            {viewOption.id === 2 && <SearchIcon />}
            {viewOption.id === 3 && <TagIcon />}
          </button>
        ))}
        <button
          className="theme-button"
          onClick={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button
          className="user-button"
          onClick={() => setUserMenuToggled(!userMenuToggled)}
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
              {inputPosition.referenceId === 0 && inputPosition.toggled && (
                <form
                  className="new-folder-form"
                  onSubmit={
                    inputPosition.forFolder ? handleNewFolderSubmit : handleNewPageSubmit
                  }
                >
                  <input
                    ref={inputPositionRef}
                    spellCheck="false"
                    onChange={(e) => {
                      inputPosition.forFolder
                        ? setNewFolderName(e.target.value)
                        : setNewPageName(e.target.value);
                    }}
                    value={inputPosition.forFolder ? newFolderName : newPageName}
                  />
                </form>
              )}
            </div>
          )}
        {sidebar.view.name === "Notes" && (
          <>
            <FoldersList
              inputPosition={inputPosition}
              setInputPosition={setInputPosition}
              // combinedFoldersAndPages={combinedFoldersAndPages}
              // setCombinedFoldersAndPages={setCombinedFoldersAndPages}
              dragToggled={dragToggled}
              setRenameInputToggled={setRenameInputToggled}
              renameInputToggled={renameInputToggled}
              setContextMenu={setContextMenu}
              handleNewFolderSubmit={handleNewFolderSubmit}
              handleNewPageSubmit={handleNewPageSubmit}
              newFolderName={newFolderName}
              inputPositionRef={inputPositionRef}
              newPageName={newPageName}
              setNewPageName={setNewPageName}
              setNewFolderName={setNewFolderName}
              resetContextMenu={resetContextMenu}
              handleRename={handleRename}
              setNewName={setNewName}
              newName={newName}
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
        onStart={() => setDragToggled(true)}
        onStop={() => setDragToggled(false)}
      >
        <div
          ref={draggableRef}
          className={`drag-sidebar-button ${dragToggled ? "active" : ""}`}
        ></div>
      </Draggable>
      <ContextMenu
        item={pages.selected || folders.selected}
        toggled={contextMenu.toggled}
        positionX={contextMenu.position.x}
        positionY={contextMenu.position.y}
        ref={contextMenuRef}
        buttons={[
          {
            text: "New page",
            icon: "++",
            active: sidebar.shiftClickItems.end === null,
            onClick: handleNewPage,
          },
          {
            text: "New folder",
            icon: "+",
            active: sidebar.shiftClickItems.end === null,
            onClick: handleNewFolder,
          },
          {
            active:
              sidebar.shiftClickItems.end === null && inputPosition.referenceId !== 0,
            isSpacer: true,
          },
          {
            text: "Rename",
            icon: "",
            active:
              sidebar.shiftClickItems.end === null && inputPosition.referenceId !== 0,
            onClick: handleRename,
          },
          {
            text: "Add Tags",
            icon: "#",
            active:
              sidebar.shiftClickItems.end === null && inputPosition.referenceId !== 0,
            onClick: handleTag,
          },
          {
            active:
              sidebar.shiftClickItems.end === null && inputPosition.referenceId !== 0,
            isSpacer: true,
          },
          {
            text: "Delete",
            icon: "-",
            active: inputPosition.referenceId !== 0,
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
