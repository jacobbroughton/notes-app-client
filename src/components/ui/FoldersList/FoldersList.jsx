import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setExpandedStatus, selectFolder } from "../../../redux/folders";
import {
  selectPage,
  setPageStagedForSwitch,
  updateParentFolderId,
} from "../../../redux/pages";
import RightCaret from "../Icons/RightCaret";
import PageIcon from "../Icons/PageIcon";
import DownCaret from "../Icons/DownCaret";

import "./FoldersList.css";

const FoldersList = ({
  inputPosition,
  setInputPosition,
  combinedFoldersAndPages,
  setCombinedFoldersAndPages,
  dragToggled,
  renameInputToggled,
  setContextMenu,
  handleNewFolderSubmit,
  handleNewPageSubmit,
  newFolderName,
  inputPositionRef,
  newPageName,
  setNewPageName,
  setNewFolderName,
}) => {
  // const inputPositionRef = useRef();
  const dispatch = useDispatch();
  const folders = useSelector((state) => state.folders);
  const pages = useSelector((state) => state.pages);

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
    console.log(inputPositionRef)
    if (inputPosition.toggled) inputPositionRef?.current.focus();
  }, [inputPosition.toggled]);

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

  return (
    <div className={`folders-list ${inputPosition.referenceId === 0 ? "selected" : ""}`}>
      {combinedFoldersAndPages
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
            combinedFoldersAndPages?.filter((folder) => folder?.VISIBLE).length * 26 + 40
          }px)`,
        }}
      ></div>
    </div>
  );
};

export default FoldersList;
