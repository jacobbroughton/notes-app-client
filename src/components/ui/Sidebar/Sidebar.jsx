import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFolders,
  setExpandedStatus,
  collapseFolders,
  expandFolders,
  selectFolder,
  deselectFolder,
  setFolderEffStatus,
} from "../../../redux/folders";
import { setPages, setPageEffStatus, selectPage, setPageStagedForSwitch } from "../../../redux/pages";
import { setSidebarWidth } from "../../../redux/sidebar";
import { formatFolders, formatPages } from "../../../utils/formatData";
import { toggleModal } from "../../../redux/modals";

import ContextMenu from "../ContextMenu/ContextMenu";
import DownCaret from "../Icons/DownCaret";
import RightCaret from "../Icons/RightCaret";
import PageIcon from "../Icons/PageIcon";
import Draggable from "react-draggable";
import "./Sidebar.css";

const Sidebar = () => {
  const sidebarRef = useRef();
  const inputPositionRef = useRef();
  const contextMenuRef = useRef(null);
  const draggableRef = useRef(null);
  const [combinedFoldersAndPages, setCombinedFoldersAndPages] = useState([]);
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

    console.log({ x: e.clientX, y: e.clientY, height: window.innerHeight });
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
        setContextMenu({
          position: {
            x: 0,
            y: 0,
          },
          toggled: false,
        });
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
        setContextMenu({
          position: {
            x: 0,
            y: 0,
          },
          toggled: false,
        });
        getData(false);
      })
      .catch((err) => console.log(err));
  }

  async function deleteFolder(folderId) {
    try {
      let response = await fetch("http://localhost:3001/folders/delete", {
        method: "post",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        credentials: "include",
        body: JSON.stringify({
          folderId,
        }),
      });
      let data = await response.json();

      data.deletedFolders.forEach((folderId) => {
        console.log("FOLDER", folderId);
        dispatch(setFolderEffStatus(folderId));
      });

      setContextMenu({
        position: {
          x: 0,
          y: 0,
        },
        toggled: false,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function deletePage(pageId) {
    try {
      let response = await fetch("http://localhost:3001/pages/delete", {
        method: "post",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        credentials: "include",
        body: JSON.stringify({
          pageId,
        }),
      });
      let data = await response.json();
      dispatch(setPageEffStatus(pageId));
      setContextMenu({
        position: {
          x: 0,
          y: 0,
        },
        toggled: false,
      });
    } catch (err) {
      console.log(err);
    }
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

  // function switchPagesPromise(canContinue) {
  //   return new Promise((resolve, reject) => {
  //     if (canContinue) {
  //       resolve();
  //     } else {
  //       reject();
  //     }
  //   });
  // }

  function handlePageClick(page) {
    if (pages.active?.IS_MODIFIED) {
      dispatch(setPageStagedForSwitch(page))
      dispatch(toggleModal("unsavedWarning"));
      return
    }
    dispatch(selectPage(page));
    dispatch(selectFolder(null));
    setInputPosition({
      referenceId: page.PAGE_ID,
      toggled: false,
      forFolder: false,
    });
  }

  function handleRootClick(e) {
    setInputPosition({
      referenceId: 0,
      toggled: false,
      forFolder: true,
    });
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
    console.log(e);
    setNewFolderName(e.target.value);
  }

  function handleNewPageOnChange(e) {
    e.preventDefault();
    setNewPageName(e.target.value);
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
    if (inputPosition.toggled) inputPositionRef?.current.focus();
  }, [inputPosition.toggled]);

  useEffect(() => {
    dispatch(setPages(formatPages(pages?.list, folders?.list)));
  }, [folders]);

  useEffect(() => {
    window.addEventListener("click", function (e) {
      setNewFolderName("");
      setNewPageName("");
      setContextMenu({
        ...contextMenu,
        toggled: false,
      });
    });

    getData(true);
  }, []);

  useEffect(() => {
    const inputPositionHandler = (event) => {
      if (
        inputPositionRef.current &&
        !inputPositionRef.current.contains(event.target) &&
        !event.target.classList.contains("new-folder-button")
      ) {
        setInputPosition({
          referenceId: null,
          toggled: false,
          forFolder: false,
        });
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
              const selectedFolder = folders.list.find((folder) => folder.SELECTED);

              setInputPosition({
                referenceId: selectedFolder ? selectedFolder.ID : 0,
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
              setInputPosition({
                referenceId:
                  inputPosition.referenceId && selectedFolder
                    ? inputPosition.referenceId
                    : 0,
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
                className={`folder-container  ${
                  dragToggled || inputPosition.referenceId === item.ID ? "" : "hoverable"
                } ${item.SELECTED ? "selected" : ""}`}
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
                    <p>{item.NAME}</p>
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
                      name="new-page-folder-input"
                      ref={inputPositionRef}
                      onClick={(e) => e.stopPropagation()}
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
            onClick: (e, item) => {
              const selectedFolder = folders.list.find((folder) => folder.SELECTED);

              setInputPosition({
                referenceId: selectedFolder ? selectedFolder.ID : 0,
                toggled: true,
                forFolder: false,
              });
            },
          },
          {
            text: "New folder",
            icon: "+",
            active: true,
            onClick: (e, item) => {
              const selectedFolder = folders.list.find((folder) => folder.SELECTED);

              setInputPosition({
                referenceId:
                  inputPosition.referenceId && selectedFolder
                    ? inputPosition.referenceId
                    : 0,
                toggled: true,
                forFolder: true,
              });
              if (inputPosition.referenceId === null) dispatch(deselectFolder());
            },
          },
          {
            text: "Delete this",
            icon: "-",
            active: inputPosition.referenceId !== 0,
            onClick: (e, item) => {
              e.stopPropagation();
              if (!item.IS_PAGE) deleteFolder(item.ID);
              if (item.IS_PAGE) deletePage(item.PAGE_ID);
            },
          },
        ]}
      />
    </aside>
  );
};

export default Sidebar;
