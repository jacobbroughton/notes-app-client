import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setExpandedStatus, selectFolder, renameFolder } from "../../../redux/folders";
import { toggleModal } from "../../../redux/modals";
import {
  setDraggedOverItem,
  setGrabbedItem,
  setInputPosition,
  setShiftClickItems,
} from "../../../redux/sidebar";
import {
  selectPage,
  setPageStagedForSwitch,
  updateParentFolderId,
  renamePage,
} from "../../../redux/pages";

import PageIcon from "../Icons/PageIcon";
import Caret from "../Icons/Caret";
import "./ItemList.css";
import { setCombined } from "../../../redux/combined";
import ItemListItem from "../ItemListItem/ItemListItem";

const ItemList = ({
  // setInputPosition,
  // setRenameInputToggled,
  // renameInputToggled,
  setContextMenu,
  handleNewFolderSubmit,
  handleNewPageSubmit,
  // newFolderName,
  inputPositionRef,
  // newPageName,
  // setNewPageName,
  // setNewFolderName,
  resetContextMenu,
  handleRename,
  // setNewName,
  // newName,
  renameInputRef,
}) => {
  const dispatch = useDispatch();
  const folders = useSelector((state) => state.folders);
  const pages = useSelector((state) => state.pages);
  const sidebar = useSelector((state) => state.sidebar);
  const combined = useSelector((state) => state.combined);

  // const [grabbedItem, setGrabbedItem] = useState(null);
  // const [draggedOverItem, setDraggedOverItem] = useState({
  // ID: null,
  // PAGE_ID: null,
  // });

  // async function handleRenameSubmit(e, item) {
  //   e.preventDefault();
  //   try {
  //     if (item.IS_PAGE) {
  //       const pageInfo = {
  //         newName: e.target.newName.value,
  //         pageId: item.PAGE_ID,
  //       };

  //       const response = await fetch("http://localhost:3001/pages/rename", {
  //         method: "POST",
  //         credentials: "include",
  //         headers: {
  //           "content-type": "application/json;charset=UTF-8",
  //         },
  //         body: JSON.stringify(pageInfo),
  //       });

  //       if (response.status !== 200) throwResponseStatusError(response, "POST");

  //       const data = await response.json();

  //       if (!data) throw "There was an issue parsing /pages/rename response";

  //       dispatch(renamePage(pageInfo));
  //       renameInputRef.current.blur();
  //       setRenameInputToggled(false);
  //     } else {
  //       const folderInfo = {
  //         newName: e.target.newName.value,
  //         folderId: item.ID,
  //       };

  //       const response = await fetch("http://localhost:3001/folders/rename", {
  //         method: "POST",
  //         credentials: "include",
  //         headers: {
  //           "content-type": "application/json;charset=UTF-8",
  //         },
  //         body: JSON.stringify(folderInfo),
  //       });

  //       if (response.status !== 200) throwResponseStatusError(response, "POST");

  //       const data = await response.json();

  //       if (!data) throw "There was an issue parsing /tags/new response";

  //       dispatch(renameFolder(folderInfo));
  //       renameInputRef.current.blur();
  //       setRenameInputToggled(false);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  function handleRootClick() {
    dispatch(
      setInputPosition({
        referenceId: 0,
        toggled: false,
        forFolder: true,
      })
    );
    dispatch(setShiftClickItems({ start: null, end: null, list: [] }));
    resetContextMenu();
    dispatch(selectFolder(null));
    dispatch(selectPage(null));
  }

  function handleFolderClick(folder, changeExpandedStatus = false) {
    changeExpandedStatus && dispatch(setExpandedStatus(folder));
    dispatch(selectFolder(folder));
    dispatch(selectPage(null));
    dispatch(
      setInputPosition({
        referenceId: folder.ID,
        toggled: false,
        forFolder: true,
      })
    );
  }

  function handlePageClick(page) {
    // if (pages.active?.IS_MODIFIED) {
    //   if (!pages.stagedToSwitch) dispatch(setPageStagedForSwitch(page));
    //   dispatch(toggleModal("unsavedWarning"));
    //   return;
    // }
    dispatch(selectPage(page));
    dispatch(selectFolder(null));
    dispatch(
      setInputPosition({
        referenceId: page.PAGE_ID,
        toggled: false,
        forFolder: false,
      })
    );
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

  // function handleNewFolderOnChange(e) {
  //   e.preventDefault();
  //   setNewFolderName(e.target.value);
  // }

  // function handleNewPageOnChange(e) {
  //   e.preventDefault();
  //   setNewPageName(e.target.value);
  // }

  function handleDragStart(e, pickedUpItem) {
    e.stopPropagation();
    dispatch(setGrabbedItem(pickedUpItem));
  }

  async function handleDrop(e, grabbedItem, droppedOntoItem) {
    try {
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

        const response = await fetch("http://localhost:3001/pages/updateParentFolder", {
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

        if (response.status !== 200) throwResponseStatusError(response, "POST");

        const data = await response.json();

        if (!data) throw "There was an issue parsing /pages/updateParentFolder response";
      }

      dispatch(setGrabbedItem(null));
      dispatch(
        setDraggedOverItem({
          ID: null,
          PAGE_ID: null,
        })
      );
    } catch (error) {
      console.log(error);
    }
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

    dispatch(
      setDraggedOverItem({
        ID,
        PAGE_ID: hoveredOverItem.PAGE_ID,
      })
    );
  }

  // function determineFolderContainerClass(itemFromList) {
  //   let className = "folder-container";

  //   if (!dragToggled || sidebar.inputPosition.referenceId !== itemFromList.ID) {
  //     className += " hoverable";
  //   }

  //   if (
  //     itemFromList.SELECTED ||
  //     (sidebar.shiftClickItems.start !== null &&
  //       sidebar.shiftClickItems.end !== null &&
  //       ((itemFromList.ORDER >= sidebar.shiftClickItems.start &&
  //         itemFromList.ORDER <= sidebar.shiftClickItems.end) ||
  //         (itemFromList.ORDER >= sidebar.shiftClickItems.end &&
  //           itemFromList.ORDER <= sidebar.shiftClickItems.start)))
  //   ) {
  //     className += " selected";
  //   }

  //   if (
  //     draggedOverItem.ID === itemFromList?.ID ||
  //     (draggedOverItem.ID === itemFromList?.FOLDER_ID && itemFromList.FOLDER_ID !== null)
  //   ) {
  //     if (itemFromList.IS_PAGE && itemFromList.FOLDER_ID !== grabbedItem?.FOLDER_ID) {
  //       className += " under-drag";
  //     }

  //     if (!itemFromList.IS_PAGE && itemFromList.ID !== grabbedItem?.FOLDER_ID) {
  //       className += " under-drag";
  //     }
  //   }

  //   return className;
  // }

  // function handleItemClick(e, item) {
  //   if (e.shiftKey) {
  //     if (sidebar.shiftClickItems.start !== null) {
  //       dispatch(
  //         setShiftClickItems({
  //           ...sidebar.shiftClickItems,
  //           end: item.ORDER,
  //           list: combined,
  //         })
  //       );
  //     }
  //   } else {
  //     dispatch(
  //       setShiftClickItems({
  //         start: item.ORDER,
  //         end: null,
  //         list: combined,
  //       })
  //     );
  //     if (!item.IS_PAGE) handleFolderClick(item, true);
  //     if (item.IS_PAGE) handlePageClick(item);
  //   }
  // }

  useEffect(() => {
    if (sidebar.inputPosition.toggled) inputPositionRef?.current?.focus();
  }, [sidebar.inputPosition.toggled]);

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

    dispatch(setCombined(pagesAndFolders));
  }, [folders.list, pages.list]);

  const favoritesList = pages.list.filter((page) => page.IS_FAVORITE);

  const allList = combined?.filter((folder) => folder?.VISIBLE && !folder.IS_FAVORITE);

  return (
    <div
      className={`items-list ${
        sidebar.inputPosition.referenceId === 0 ? "selected" : ""
      }`}
    >
      <p className="item-list-heading favorites">Favorites</p>
      {favoritesList.map((item, index) => (
        <ItemListItem
          item={{
            ...item,
            TIER: 1,
          }}
          combined={combined}
          handleFolderClick={handleFolderClick}
          handlePageClick={handlePageClick}
          handleOnContextMenu={handleOnContextMenu}
          handleRename={handleRename}
          handleDragEnter={handleDragEnter}
          handleDragStart={handleDragStart}
          handleDrop={handleDrop}
          handleNewPageSubmit={handleNewPageSubmit}
          handleNewFolderSubmit={handleNewFolderSubmit}
          key={index}
          renameInputRef={renameInputRef}
          inputPositionRef={inputPositionRef}
          index={index}
        />
      ))}
      <div className="spacer"></div>
      <p className="item-list-heading all">All</p>

      {allList.map((item, index) => {
        let hasChildren =
          folders.list.filter((innerFolder) => innerFolder.PARENT_FOLDER_ID === item.ID)
            .length !== 0;

        if (!hasChildren && !item.IS_PAGE) {
          if (pages.list?.find((page) => page.FOLDER_ID === item.ID)) {
            hasChildren = true;
          }
        }

        return (
          <ItemListItem
            item={item}
            combined={combined}
            handleFolderClick={handleFolderClick}
            handlePageClick={handlePageClick}
            handleOnContextMenu={handleOnContextMenu}
            handleRename={handleRename}
            handleDragEnter={handleDragEnter}
            handleDragStart={handleDragStart}
            handleDrop={handleDrop}
            handleNewPageSubmit={handleNewPageSubmit}
            handleNewFolderSubmit={handleNewFolderSubmit}
            key={index}
            renameInputRef={renameInputRef}
            inputPositionRef={inputPositionRef}
            index={index}
          />
        );
      })}
      {sidebar.inputPosition.toggled && (
        <div
          className="sidebar-overlay"
          onClick={() => {
            dispatch(
              setInputPosition({
                referenceId: null,
                toggled: false,
                forFolder: false,
              })
            );
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

export default ItemList;
