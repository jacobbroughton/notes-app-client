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
import { setPages, setPageEffStatus, selectPage } from "../../../redux/pages";
import { setSidebarWidth } from "../../../redux/sidebar";
import { formatFolders, formatPages } from "../../../utils/formatData";
import DownCaret from "../Icons/DownCaret";
import RightCaret from "../Icons/RightCaret";
import PageIcon from "../Icons/PageIcon";
import Draggable from "react-draggable";
import "./Sidebar.css";

const Sidebar = () => {
  const sidebarRef = useRef();
  const inputPositionRef = useRef();
  const [combinedFoldersAndPages, setCombinedFoldersAndPages] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [dragPositionX, setDragPositionX] = useState(null);
  const [dragToggled, setDragToggled] = useState(false);
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

  useEffect(() => {
    const inputPositionHandler = (event) => {
      if (
        inputPositionRef.current &&
        !inputPositionRef.current.contains(event.target) &&
        !event.target.classList.contains("new-folder-button")
      ) {
        setInputPosition({
          folderId: null,
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

  function handleNewFolderSubmit(e) {
    e.preventDefault();
    return fetch("http://localhost:3001/folders/new", {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      credentials: "include",
      body: JSON.stringify({
        parentFolderId: inputPosition.folderId === 0 ? null : inputPosition.folderId,
        newFolderName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setInputPosition({
          folderId: null,
          toggled: false,
          forFolder: false,
        });
        // getFolders(false);
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
        parentFolderId: inputPosition.folderId === 0 ? null : inputPosition.folderId,
        newPageName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setInputPosition({
          folderId: null,
          toggled: false,
          forFolder: false,
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
    } catch (err) {
      console.log(err);
    }
  }

  function handleFolderClick(folder) {
    dispatch(setExpandedStatus(folder));
    dispatch(selectFolder(folder));
    dispatch(selectPage(null));
    setInputPosition({
      folderId: folder.ID,
      toggled: false,
      forFolder: true,
    });
  }

  function handlePageClick(page) {
    dispatch(selectPage(page));
    dispatch(selectFolder(null));
    setInputPosition({
      folderId: page.PAGE_ID,
      toggled: false,
      forFolder: false,
    });
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

      const foldersInFolder = folders.list.filter(
        (innerFolder) => innerFolder.PARENT_FOLDER_ID === folder.ID && folder.EFF_STATUS
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
    dispatch(setPages(formatPages(pages?.list, folders?.list)));
  }, [folders]);

  useEffect(() => {
    getData(true);
  }, []);

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
                folderId: selectedFolder ? selectedFolder.ID : 0,
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
                folderId:
                  inputPosition.folderId && selectedFolder ? inputPosition.folderId : 0,
                toggled: true,
                forFolder: true,
              });
              if (inputPosition.folderId === null) dispatch(deselectFolder());
            }}
            title="Create a new folder"
          >
            +
          </button>
          <button
            className={`${dragToggled ? "" : "hoverable"}`}
            onClick={() => dispatch(expandFolders())}
            title="Expand Folders"
          >
            &lt; &gt;
          </button>
          <button
            className={`${dragToggled ? "" : "hoverable"}`}
            onClick={() => dispatch(collapseFolders())}
            title="Collapse Folders"
          >
            &gt; &lt;
          </button>
        </div>
        {inputPosition.folderId === 0 && inputPosition.toggled && (
          <form
            className="new-folder-form"
            onSubmit={
              inputPosition.forFolder ? handleNewFolderSubmit : handleNewPageSubmit
            }
          >
            <input onChange={(e) => setNewFolderName(e.target.value)} />
          </form>
        )}
      </div>
      <div className={`folders-list ${inputPosition.folderId === 0 ? "selected" : ""}`}>
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
                  dragToggled || inputPosition.folderId === item.ID ? "" : "hoverable"
                } ${item.SELECTED ? "selected" : ""}`}
                style={{
                  ...(inputPosition.folderId === item.ID &&
                    inputPosition.toggled && { overflow: "visible" }),
                }}
                key={index}
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
                  onContextMenu={() => console.log(`Right clicked folder ${item.ID}`)}
                  style={{
                    ...(hasChildren
                      ? { cursor: "pointer" }
                      : {
                          cursor: "default",
                        }),
                  }}
                  onClick={(e) => {
                    if (!item.IS_PAGE) handleFolderClick(item);
                    if (item.IS_PAGE) handlePageClick(item);
                  }}
                >
                  <div className="name-and-caret">
                    <div className="caret-container">
                      {!hasChildren && <>&nbsp;</>}
                      {!item.EXPANDED_STATUS && !item.IS_PAGE && <RightCaret />}{" "}
                      {item.EXPANDED_STATUS && !item.IS_PAGE && <DownCaret />}
                      {item.IS_PAGE && <PageIcon />}
                    </div>
                    <p>
                      {/* {item.IS_PAGE ? <PageIcon /> : <FolderIcon />} */}
                      {item.IS_PAGE
                        ? item.FOLDER_ID
                          ? item.FOLDER_ID
                          : "null"
                        : item.ID}{" "}
                      {item.NAME}
                    </p>
                  </div>
                  <div className="folder-buttons">
                    <button
                      className={`new-folder-button ${dragToggled ? "" : "hoverable"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!item.IS_PAGE) deleteFolder(item.ID);
                        if (item.IS_PAGE) deletePage(item.PAGE_ID);
                      }}
                      title={`Create a folder inside "${item.NAME}"`}
                    >
                      -
                    </button>
                  </div>
                </div>

                {inputPosition.folderId === item.ID && inputPosition.toggled && (
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
                      ref={inputPositionRef}
                      onChange={(e) => setNewFolderName(e.target.value)}
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
                folderId: null,
                toggled: false,
                forFolder: false,
              });
            }}
          ></div>
        )}
        <div
          className="sidebar-root-click-checker"
          onClick={(e) => {
            setInputPosition({
              folderId: 0,
              toggled: false,
              forFolder: true,
            });
            dispatch(selectFolder(null));
            dispatch(selectPage(null));
          }}
        ></div>
      </div>
      <Draggable
        axis="x"
        defaultPosition={{ x: sidebarRef?.current?.offsetWidth, y: 0 }}
        position={{ x: sidebar.width ? sidebar.width : sidebarRef?.current?.offsetWidth }}
        onDrag={onDragSidebar}
        onStart={() => setDragToggled(true)}
        onStop={() => setDragToggled(false)}
      >
        <div className={`drag-sidebar-button ${dragToggled ? "active" : ""}`}></div>
      </Draggable>
    </aside>
  );
};

export default Sidebar;
