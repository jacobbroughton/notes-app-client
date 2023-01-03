import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setExpandedStatus, selectFolder, renameFolder } from "../../../redux/folders";
import { toggleModal } from "../../../redux/modals";
import { setShiftClickItems } from "../../../redux/sidebar";
import {
  selectPage,
  setPageStagedForSwitch,
  updateParentFolderId,
  renamePage,
} from "../../../redux/pages";

import RightCaret from "../Icons/RightCaret";
import PageIcon from "../Icons/PageIcon";

// import DownCaret from "../Icons/DownCaret";
import Caret from "../Icons/Caret";
import "./FoldersList.css";
import { setCombined } from "../../../redux/combined";

const FoldersList = ({
  inputPosition,
  setInputPosition,
  dragToggled,
  setRenameInputToggled,
  renameInputToggled,
  setContextMenu,
  handleNewFolderSubmit,
  handleNewPageSubmit,
  newFolderName,
  inputPositionRef,
  newPageName,
  setNewPageName,
  setNewFolderName,
  resetContextMenu,
  handleRename,
  setNewName,
  newName,
  renameInputRef,
}) => {
  const dispatch = useDispatch();
  const folders = useSelector((state) => state.folders);
  const pages = useSelector((state) => state.pages);
  const sidebar = useSelector((state) => state.sidebar);
  const combined = useSelector((state) => state.combined);
  const tags = useSelector((state) => state.tags);

  const [grabbedItem, setGrabbedItem] = useState(null);
  const [draggedOverItem, setDraggedOverItem] = useState({
    ID: null,
    PAGE_ID: null,
  });

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
    dispatch(setShiftClickItems({ start: null, end: null, list: [] }));
    resetContextMenu();
    dispatch(selectFolder(null));
    dispatch(selectPage(null));
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

  function handleOnContextMenu(e, item) {
    e.preventDefault();
    if (!sidebar.shiftClickItems.end) {
      if (item) {
        if (!item.IS_PAGE) handleFolderClick(item, false);
        if (item.IS_PAGE) handlePageClick(item);
      } else {
        handleRootClick();
      }
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

  function determineFolderContainerClass(itemFromList) {
    let className = "folder-container";

    if (!dragToggled || inputPosition.referenceId !== itemFromList.ID)
      className += " hoverable";

    if (
      itemFromList.SELECTED ||
      (sidebar.shiftClickItems.start !== null &&
        sidebar.shiftClickItems.end !== null &&
        ((itemFromList.ORDER >= sidebar.shiftClickItems.start &&
          itemFromList.ORDER <= sidebar.shiftClickItems.end) ||
          (itemFromList.ORDER >= sidebar.shiftClickItems.end &&
            itemFromList.ORDER <= sidebar.shiftClickItems.start)))
    ) {
      className += " selected";
    }

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
    if (inputPosition.toggled) inputPositionRef?.current?.focus();
  }, [inputPosition.toggled]);

  useEffect(() => {
    let pagesAndFolders = [...folders?.list].filter((folder) => folder.EFF_STATUS);
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
        pagesAndFolders.splice(indexAfterAddingPages, 0, ...pagesInFolder);
      }

      indexAfterAddingPages += pagesInFolder.length + 1;
    });

    pagesAndFolders.push(...pagesInRoot);

    pagesAndFolders = pagesAndFolders.map((item, i) => {
      return {
        ...item,
        ORDER: i,
      };
    });

    // setCombinedFoldersAndPages(combined);
    dispatch(setCombined(pagesAndFolders));
  }, [folders.list, pages.list]);

  return (
    <div className={`folders-list ${inputPosition.referenceId === 0 ? "selected" : ""}`}>
      {combined
        ?.filter((folder) => folder?.VISIBLE)

        .map((item, index) => {
          let hasChildren =
            folders.list.filter((innerFolder) => innerFolder.PARENT_FOLDER_ID === item.ID)
              .length !== 0;

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
              onDoubleClick={(e) => (item.IS_PAGE ? handleRename(e, item) : null)}
              className={determineFolderContainerClass(item)}
              style={{
                ...(inputPosition.referenceId === item.ID &&
                  inputPosition.toggled && { overflow: "visible" }),
              }}
              key={index}
              onContextMenu={(e) => handleOnContextMenu(e, item)}
              onClick={(e) => {
                if (e.shiftKey) {
                  if (sidebar.shiftClickItems.start !== null) {
                    dispatch(
                      setShiftClickItems({
                        ...sidebar.shiftClickItems,
                        end: item.ORDER,
                        list: combined,
                      })
                    );
                  }
                } else {
                  dispatch(
                    setShiftClickItems({
                      start: item.ORDER,
                      end: null,
                      list: combined,
                    })
                  );
                  if (!item.IS_PAGE) handleFolderClick(item, true);
                  if (item.IS_PAGE) handlePageClick(item);
                }
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
                    {!item.IS_PAGE && (
                      <Caret direction={item.EXPANDED_STATUS ? "down" : "right"} />
                    )}
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
                    <p>{item.NAME}</p>
                  )}
                </div>
                {item.TAGS && tags.list && (
                  <div className="tags">
                    {item.TAGS.map((tagId) => {
                      const tag = tags.list?.find((tag) => tag.ID === tagId);
                      return (
                        <span style={{ backgroundColor: tag.COLOR }} title={`Color: ${tag.COLOR}`}>
                          &nbsp;
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              {inputPosition.referenceId === item.ID && inputPosition.toggled && (
                <form
                  onSubmit={
                    inputPosition.forFolder ? handleNewFolderSubmit : handleNewPageSubmit
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
            combined?.filter((folder) => folder?.VISIBLE).length * 26 + 40
          }px)`,
        }}
      ></div>
    </div>
  );
};

export default FoldersList;
