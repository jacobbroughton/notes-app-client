import React, { MouseEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCombined } from "../../../redux/combined";
import { selectFolder, setExpandedStatus } from "../../../redux/folders";
import { selectPage, updateParentFolderId } from "../../../redux/pages";
import {
  setDraggedOverItem,
  setGrabbedItem,
  setInputPosition,
  setNewFolderName,
  setNewPageName,
  setShiftClickItems,
} from "../../../redux/sidebar";
import { RootState } from "../../../redux/store";
import { FolderState, ItemState, PageState, SidebarItemState } from "../../../types";
import { getApiUrl } from "../../../utils/getUrl";
import ItemListItem from "../ItemListItem/ItemListItem";
import "./ItemList.css";

const ItemList = ({
  setContextMenu,
  handleNewFolderSubmit,
  handleNewPageSubmit,
  inputPositionRef,
  resetContextMenu,
  handleRename,
  renameInputRef,
}: {
  setContextMenu: Function;
  handleNewFolderSubmit: Function;
  handleNewPageSubmit: Function;
  inputPositionRef: React.MutableRefObject<HTMLInputElement | null>;
  resetContextMenu: Function;
  handleRename: Function;
  renameInputRef: React.MutableRefObject<HTMLInputElement | null>;
}) => {
  const dispatch = useDispatch();
  const folders = useSelector((state: RootState) => state.folders);
  const pages = useSelector((state: RootState) => state.pages);
  const sidebar = useSelector((state: RootState) => state.sidebar);
  const combined = useSelector((state: RootState) => state.combined);

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

  function handleFolderClick(folder: ItemState, changeExpandedStatus = false) {
    changeExpandedStatus && dispatch(setExpandedStatus(folder));
    dispatch(selectFolder(folder));
    dispatch(selectPage(null));
    dispatch(
      setInputPosition({
        referenceId: folder.id,
        toggled: false,
        forFolder: true,
      })
    );
  }

  function handlePageClick(page: PageState) {
    dispatch(selectPage(page));
    dispatch(selectFolder(null));
    dispatch(
      setInputPosition({
        referenceId: page.page_id,
        toggled: false,
        forFolder: false,
      })
    );
  }

  function handleOnContextMenu(e: MouseEvent, item: any) {
    e.preventDefault();
    if (!sidebar.shiftClickItems.end) {
      if (item) {
        if (!item.is_page) handleFolderClick(item, false);
        if (item.is_page) handlePageClick(item);
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

  function handleDragStart(pickedUpItem: SidebarItemState) {
    dispatch(setGrabbedItem(pickedUpItem));
  }

  async function handleDrop(
    grabbedItem: SidebarItemState | null,
    droppedOntoItem: SidebarItemState | null
  ) {
    try {
      if (grabbedItem?.is_page) {
        dispatch(
          updateParentFolderId({
            folders: folders.list,
            affectedPage: grabbedItem,
            droppedOntoItem,
          })
        );

        const response = await fetch(`${getApiUrl()}pages/updateParentFolder/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "http://localhost:3000",
          },
          body: JSON.stringify({
            affectedPage: grabbedItem,
            droppedOntoItem,
          }),
        });

        if (response.status !== 200) throw response.statusText;

        const data = await response.json();

        if (!data) throw "There was an issue parsing /pages/updateParentFolder response";
      }

      dispatch(setGrabbedItem(null));
      dispatch(
        setDraggedOverItem({
          id: null,
          page_id: null,
        })
      );
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  function handleDragEnter(e: MouseEvent, hoveredOverItem: ItemState | null) {
    let id = null;
    if (hoveredOverItem) {
      if (hoveredOverItem.is_page) {
        id = hoveredOverItem.folder_id;
      } else {
        id = hoveredOverItem.id;
      }
    } else {
      id = null;
    }

    dispatch(
      setDraggedOverItem({
        id,
        ...(hoveredOverItem && { page_id: hoveredOverItem.page_id }),
      })
    );
  }

  useEffect(() => {
    if (sidebar.inputPosition.toggled) inputPositionRef?.current?.focus();
  }, [sidebar.inputPosition.toggled]);

  useEffect(() => {
    let pagesAndFolders: Array<FolderState | PageState> = [...folders?.list].filter(
      (folder) => folder.eff_status
    );
    let effFolders = [...folders?.list].filter((folder) => folder.eff_status);

    const pagesInRoot = pages.list.filter(
      (page) => page.folder_id === null && page.eff_status
    );

    let indexAfterAddingPages = 1;

    effFolders?.forEach((folder, index) => {
      const pagesInFolder = pages.list.filter(
        (page) => page.folder_id === folder.id && page.eff_status
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
        order: i,
      };
    });

    dispatch(setCombined(pagesAndFolders));
  }, [folders.list, pages.list]);

  const favoritesList = pages.list.filter((page) => page.is_favorite && page.eff_status);

  const allList = combined?.filter((folder) => folder?.visible && !folder.is_favorite);

  return (
    <div
      className={`items-list ${
        sidebar.inputPosition.referenceId === 0 ? "selected" : ""
      }`}
    >
      {favoritesList?.length !== 0 && (
        <>
          <p className="item-list-heading favorites">Favorites</p>
          {favoritesList.map((item, index) => (
            <ItemListItem
              item={{
                ...item,
                tier: 1,
                expanded_status: false,
                order: favoritesList.length + 1,
                parent_folder_id: item.folder_id,
              }}
              handleFolderClick={handleFolderClick}
              handlePageClick={handlePageClick}
              handleOnContextMenu={handleOnContextMenu}
              handleRename={handleRename}
              handleDragEnter={handleDragEnter}
              handleDragStart={handleDragStart}
              handleDrop={handleDrop}
              handleNewPageSubmit={handleNewPageSubmit}
              handleNewFolderSubmit={handleNewFolderSubmit}
              renameInputRef={renameInputRef}
              inputPositionRef={inputPositionRef}
              index={index}
              key={index}
            />
          ))}
          <div className="item-list-heading-and-spinner">
            <p className="item-list-heading all">All </p>
            {/* {sidebar.loading && <LoadingSpinner />} */}
          </div>
        </>
      )}
      {allList.length === 0 && <p className="no-items-found">No items found</p>}
      {allList.map((item, index) => {
        let hasChildren =
          folders.list.filter((innerFolder) => innerFolder.parent_folder_id === item.id)
            .length !== 0;

        if (!hasChildren && !item.is_page) {
          if (pages.list?.find((page) => page.folder_id === item.id)) {
            hasChildren = true;
          }
        }

        return (
          <ItemListItem
            item={item}
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
            if (sidebar.newPageName) dispatch(setNewPageName(""));
            if (sidebar.newFolderName) dispatch(setNewFolderName(""));
          }}
        ></div>
      )}
      <div
        className="sidebar-root-click-checker"
        onContextMenu={(e) => handleOnContextMenu(e, null)}
        onClick={handleRootClick}
        draggable
        onDragStart={(e) => e.preventDefault()}
        onDragEnter={(e) => handleDragEnter(e, null)}
        onDrop={() => handleDrop(sidebar.grabbedItem, null)}
        onDragOver={(e) => e.preventDefault()}
        style={{
          height: `calc(100% - ${
            combined?.filter((folder) => folder?.visible).length * 26 + 40 + 115
          }px)`,
        }}
      >
        &nbsp;
      </div>
    </div>
  );
};

export default ItemList;
