import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFolders,
  setExpandedStatus,
  collapseFolders,
  expandFolders,
  selectFolder,
  deselectFolder,
  renameFolder,
  setStagedFolderToDelete,
} from "../../../redux/folders";
import {
  setPages,
  setPageEffStatus,
  selectPage,
  setPageStagedForSwitch,
  updateParentFolderId,
  setStagedPageToDelete,
  renamePage,
} from "../../../redux/pages";
import { setSidebarWidth } from "../../../redux/sidebar";
import { formatFolders, formatPages } from "../../../utils/formatData";
import { toggleModal } from "../../../redux/modals";

import ContextMenu from "../ContextMenu/ContextMenu";
import DownCaret from "../Icons/DownCaret";
import RightCaret from "../Icons/RightCaret";
import PageIcon from "../Icons/PageIcon";
import Draggable from "react-draggable";
import "./Sidebar.css";

function Sidebar() {
  const sidebarRef = useRef();
  const inputPositionRef = useRef();
  const contextMenuRef = useRef(null);
  const draggableRef = useRef(null);
  const renameInputRef = useRef(null);
  const [combinedFoldersAndPages, setCombinedFoldersAndPages] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [dragToggled, setDragToggled] = useState(false);
  const [grabbedItem, setGrabbedItem] = useState(null);
  const [draggedOverItem, setDraggedOverItem] = useState({
    ID: null,
    PAGE_ID: null,
  });
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
  const [newName, setNewName] = useState("");

  const folders = useSelector((state) => state.folders);
  const pages = useSelector((state) => state.pages);
  const sidebar = useSelector((state) => state.sidebar);
  const dispatch = useDispatch();

  function onDragSidebar(e, data) {
    dispatch(setSidebarWidth(data.x));
  }

  function handleOnContextMenu(e, item) {
    e.preventDefault();
    if (item) {
      if (!item.IS_PAGE) handleFolderClick(item, false);
      if (item.IS_PAGE) handlePageClick(item);
    } else {
      handleRootClick();
    }

    let x = e.clientX;
    let y = e.clientY;

    if (y > window?.innerHeight - 100) {
      y = window.innerHeight - 100;
    }

    setContextMenu({
      position: {
        y,
        x,
      },
      toggled: true,
    });
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
        // getFolders(false);
        resetContextMenu();
        getData(false);
      })
      .catch((err) => console.log(err));
  }

  function handleNewPageSubmit(e) {
    e.preventDefault();

    console.log(inputPosition);

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

  function handleFolderClick(folder, changeExpandedStatus = false) {
    changeExpandedStatus && dispatch(setExpandedStatus(folder));
    dispatch(selectFolder(folder));
    dispatch(selectPage(null));
    setInputPosition({
      referenceId: folder.ID,
      toggled: false,
      forFolder: true,
    });
  }

  function handlePageClick(page) {
    if (pages.active?.IS_MODIFIED) {
      if (!pages.staged) dispatch(setPageStagedForSwitch(page));
      dispatch(toggleModal("unsavedWarning"));
      return;
    }
    dispatch(selectPage(page));
    dispatch(selectFolder(null));
    setInputPosition({
      referenceId: page.PAGE_ID,
      toggled: false,
      forFolder: false,
    });
  }

  function handleDelete(e, item) {
    e.stopPropagation();

    resetContextMenu();

    dispatch(toggleModal("deleteModal"));
    if (item.IS_PAGE) {
      dispatch(setStagedPageToDelete(item));
    } else {
      dispatch(setStagedFolderToDelete(item));
    }
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

  function handleNewPage(e, item) {
    resetContextMenu();

    let referenceId = 0;

    if (folders.selected) {
      referenceId = folders.selected.ID;
    } else if (pages.selected && pages.selected.FOLDER_ID) {
      referenceId = pages.selected.FOLDER_ID;
    }

    console.log(referenceId);

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

  function handleRenameSubmit(e, item) {
    e.preventDefault();
    if (item.IS_PAGE) {
      const pageInfo = {
        newName: e.target.newName.value,
        pageId: item.PAGE_ID,
      };

      fetch("http://localhost:3001/pages/rename", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(pageInfo),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          dispatch(renamePage(pageInfo));
          renameInputRef.current.blur();
          setRenameInputToggled(false);
        })
        .catch((err) => console.log(err));
    } else {
      const folderInfo = {
        newName: e.target.newName.value,
        folderId: item.ID,
      };

      fetch("http://localhost:3001/folders/rename", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(folderInfo),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          dispatch(renameFolder(folderInfo));
          renameInputRef.current.blur();
          setRenameInputToggled(false);
        })
        .catch((err) => console.log(err));
    }
  }

  function handleRootClick() {
    setInputPosition({
      referenceId: 0,
      toggled: false,
      forFolder: true,
    });
    resetContextMenu();
    dispatch(selectFolder(null));
    dispatch(selectPage(null));
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

  function handleNewFolderOnChange(e) {
    e.preventDefault();
    setNewFolderName(e.target.value);
  }

  function handleNewPageOnChange(e) {
    e.preventDefault();
    setNewPageName(e.target.value);
  }

  function handleDragStart(e, pickedUpItem) {
    e.stopPropagation();
    setGrabbedItem(pickedUpItem);
  }

  function handleDrop(e, grabbedItem, droppedOntoItem) {
    if (droppedOntoItem === "root") {
      droppedOntoItem = {
        ID: null,
        TIER: 0,
        EXPANDED_STATUS: true,
      };
    }

    if (grabbedItem.IS_PAGE) {
      dispatch(
        updateParentFolderId({
          folders: folders.list,
          affectedPage: grabbedItem,
          droppedOntoItem,
        })
      );

      fetch("http://localhost:3001/pages/updateParentFolder", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          affectedPage: grabbedItem,
          droppedOntoItem,
        }),
      });
    }

    setGrabbedItem(null);
    setDraggedOverItem({
      ID: null,
      PAGE_ID: null,
    });
  }

  function handleDragEnter(e, hoveredOverItem) {
    e.stopPropagation();
    let ID = null;
    if (hoveredOverItem.IS_PAGE) {
      ID = hoveredOverItem.FOLDER_ID;
    } else if (hoveredOverItem === "root") {
      ID = null;
    } else {
      ID = hoveredOverItem.ID;
    }

    setDraggedOverItem({
      ID,
      PAGE_ID: hoveredOverItem.PAGE_ID,
    });
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

  function determineFolderContainerClass(itemFromList) {
    let className = "folder-container";

    if (!dragToggled || inputPosition.referenceId !== itemFromList.ID)
      className += " hoverable";

    if (itemFromList.SELECTED) className += " selected";

    if (
      draggedOverItem.ID === itemFromList?.ID ||
      (draggedOverItem.ID === itemFromList?.FOLDER_ID && itemFromList.FOLDER_ID !== null)
    ) {
      if (itemFromList.IS_PAGE && itemFromList.FOLDER_ID !== grabbedItem?.FOLDER_ID) {
        className += " under-drag";
      }

      if (!itemFromList.IS_PAGE && itemFromList.ID !== grabbedItem?.FOLDER_ID) {
        className += " under-drag";
      }
    }

    return className;
  }

  useEffect(() => {
    let combined = [...folders?.list].filter((folder) => folder.EFF_STATUS);
    let effFolders = [...folders?.list].filter((folder) => folder.EFF_STATUS);

    const pagesInRoot = pages.list.filter(
      (page) => page.FOLDER_ID === null && page.EFF_STATUS
    );

    let indexAfterAddingPages = 1;

    effFolders?.forEach((folder, index) => {
      const pagesInFolder = pages.list.filter(
        (page) => page.FOLDER_ID === folder.ID && page.EFF_STATUS
      );

      if (pagesInFolder.length > 0) {
        combined.splice(indexAfterAddingPages, 0, ...pagesInFolder);
      }

      indexAfterAddingPages += pagesInFolder.length + 1;
    });

    combined.push(...pagesInRoot);

    setCombinedFoldersAndPages(combined);
  }, [folders.list, pages.list]);

  useEffect(() => {
    console.log(inputPosition);
    if (inputPosition.toggled) inputPositionRef?.current.focus();
  }, [inputPosition.toggled]);

  useEffect(() => {
    dispatch(setPages(formatPages(pages?.list, folders?.list)));
  }, [folders]);

  useEffect(() => {
    // window.addEventListener("mousedown", function (e) {
    //   console.log('asdfasdf')
    //   setNewFolderName("");
    //   setNewPageName("");
    //   resetContextMenu()
    // });

    getData(true);
  }, []);

  useEffect(() => {
    const inputPositionHandler = (event) => {
      if (
        inputPositionRef.current &&
        !inputPositionRef.current?.contains(event.target) &&
        !event.target.classList.contains("new-folder-button")
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

      // if (!event.target.classList.contains("context-menu-button")) {
      //   setNewFolderName("");
      //   setNewPageName("");
      //   setContextMenu({
      //     position: {
      //       x: 0,
      //       y: 0,
      //     },
      //   });
      // }

      if (renameInputToggled && !event.target.classList.contains("rename-input")) {
        setRenameInputToggled(false);
      }
    };

    document.addEventListener("mousedown", inputPositionHandler);

    return () => {
      document.removeEventListener("mousedown", inputPositionHandler);
    };
  });

  return (
    <aside
      ref={sidebarRef}
      className="sidebar"
      style={{ width: `${sidebar.width ? `${sidebar.width}px` : "225px"}` }}
    >
      <div className="header">
        <div className="sidebar-header-buttons">
          <button
            className={`${dragToggled ? "" : "hoverable"}`}
            onClick={() => {
              // const selectedFolder = folders.list.find((folder) => folder.SELECTED);
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
            }}
            title="Create a new page"
          >
            ++
          </button>
          <button
            className={`${dragToggled ? "" : "hoverable"}`}
            onClick={() => {
              const selectedFolder = folders.list.find((folder) => folder.SELECTED);

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
            }}
            title="Create a new folder"
          >
            +
          </button>
          <button
            className={`${dragToggled ? "" : "hoverable"}`}
            onClick={() => dispatch(expandFolders())}
            title="Expand Folders"
            disabled={
              !dragToggled &&
              combinedFoldersAndPages.filter((item) => !item.IS_PAGE).length === 0
            }
          >
            &lt; &gt;
          </button>
          <button
            className={`${dragToggled ? "" : "hoverable"}`}
            onClick={() => dispatch(collapseFolders())}
            title="Collapse Folders"
            disabled={
              !dragToggled &&
              combinedFoldersAndPages.filter((item) => !item.IS_PAGE).length === 0
            }
          >
            &gt; &lt;
          </button>
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
      <div
        className={`folders-list ${inputPosition.referenceId === 0 ? "selected" : ""}`}
      >
        {combinedFoldersAndPages
          ?.filter((folder) => folder?.VISIBLE)

          .map((item, index) => {
            let hasChildren =
              folders.list.filter(
                (innerFolder) => innerFolder.PARENT_FOLDER_ID === item.ID
              ).length !== 0;

            if (!hasChildren && !item.IS_PAGE) {
              if (pages.list?.find((page) => page.FOLDER_ID === item.ID)) {
                hasChildren = true;
              }
            }

            return (
              <div
                draggable={item.IS_PAGE}
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnter={(e) => handleDragEnter(e, item)}
                onDrop={(e) => handleDrop(e, grabbedItem, item)}
                onDragOver={(e) => e.preventDefault()}
                onDoubleClick={(e) => handleRename(e, item)}
                className={determineFolderContainerClass(item)}
                style={{
                  ...(inputPosition.referenceId === item.ID &&
                    inputPosition.toggled && { overflow: "visible" }),
                }}
                key={index}
                onContextMenu={(e) => handleOnContextMenu(e, item)}
                onClick={(e) => {
                  if (!item.IS_PAGE) handleFolderClick(item, true);
                  if (item.IS_PAGE) handlePageClick(item);
                }}
              >
                <div className="tier-blocks">
                  {[...Array(item.TIER)].map((tierNum, index) => (
                    <div key={index} className="tier-block">
                      &nbsp;
                    </div>
                  ))}
                </div>
                <div
                  className={`name-and-buttons`}
                  data-tier={`${item.TIER ? `TIER-${item.TIER}` : "null"}`}
                >
                  <div className="name-and-caret">
                    <div className="caret-container">
                      {!hasChildren && <>&nbsp;</>}
                      {!item.EXPANDED_STATUS && !item.IS_PAGE && <RightCaret />}{" "}
                      {item.EXPANDED_STATUS && !item.IS_PAGE && <DownCaret />}
                      {item.IS_PAGE && <PageIcon />}
                    </div>
                    {renameInputToggled &&
                    inputPosition.referenceId === (item.PAGE_ID || item.ID) ? (
                      <form onSubmit={(e) => handleRenameSubmit(e, item)}>
                        <input
                          value={newName}
                          name="newName"
                          spellCheck="false"
                          onChange={(e) => setNewName(e.target.value)}
                          className="rename-input"
                          ref={renameInputRef}
                        />
                      </form>
                    ) : (
                      <p>
                        {/* {item.IS_PAGE ? item.FOLDER_ID : item.ID}  */}
                        {item.NAME}
                      </p>
                    )}
                  </div>
                </div>
                {inputPosition.referenceId === item.ID && inputPosition.toggled && (
                  <form
                    onSubmit={
                      inputPosition.forFolder
                        ? handleNewFolderSubmit
                        : handleNewPageSubmit
                    }
                    style={{ paddingLeft: `calc(${item.TIER} * 10px)` }}
                    className="new-folder-form"
                  >
                    <input
                      // name="new-page-folder-input"
                      ref={inputPositionRef}
                      onClick={(e) => e.stopPropagation()}
                      spellCheck="false"
                      onChange={
                        inputPosition.forFolder
                          ? handleNewFolderOnChange
                          : handleNewPageOnChange
                      }
                      value={inputPosition.forFolder ? newFolderName : newPageName}
                    />
                  </form>
                )}
              </div>
            );
          })}
        {inputPosition.toggled && (
          <div
            className="sidebar-overlay"
            onClick={() => {
              setInputPosition({
                referenceId: null,
                toggled: false,
                forFolder: false,
              });
            }}
          ></div>
        )}
        <div
          className="sidebar-root-click-checker"
          onContextMenu={(e) => handleOnContextMenu(e, null)}
          onClick={handleRootClick}
          draggable
          onDragStart={(e) => e.preventDefault()}
          onDragEnter={(e) => handleDragEnter(e, "root")}
          onDrop={(e) => handleDrop(e, grabbedItem, "root")}
          onDragOver={(e) => e.preventDefault()}
          style={{
            height: `calc(100% - ${
              combinedFoldersAndPages?.filter((folder) => folder?.VISIBLE).length * 26 +
              40
            }px)`,
          }}
        ></div>
      </div>
      <Draggable
        axis="x"
        nodeRef={draggableRef}
        defaultPosition={{ x: sidebarRef?.current?.offsetWidth, y: 0 }}
        position={{ x: sidebar.width ? sidebar.width : sidebarRef?.current?.offsetWidth }}
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
            active: true,
            onClick: handleNewPage,
          },
          {
            text: "New folder",
            icon: "+",
            active: true,
            onClick: handleNewFolder,
          },
          {
            active: inputPosition.referenceId !== 0,
            isSpacer: true,
          },
          {
            text: "Rename",
            icon: "",
            active: inputPosition.referenceId !== 0,
            onClick: handleRename,
          },
          {
            active: inputPosition.referenceId !== 0,
            isSpacer: true,
          },
          {
            text: "Delete",
            icon: "-",
            active: inputPosition.referenceId !== 0,
            onClick: handleDelete,
          },
        ]}
      />
    </aside>
  );
}

export default Sidebar;
