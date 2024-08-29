import { ChangeEvent, MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { renameFolder } from "../../../redux/folders";
import { renamePage } from "../../../redux/pages";
import {
  setGrabbedItem,
  setNewFolderName,
  setNewNameForRename,
  setNewPageName,
  setRenameInputToggled,
  setShiftClickItems,
} from "../../../redux/sidebar";
import { RootState } from "../../../redux/store";
import { ItemState } from "../../../types";
import { getApiUrl } from "../../../utils/getUrl";
import Caret from "../Icons/Caret";
import PageIcon from "../Icons/PageIcon";
import "./ItemListItem.css";

const ItemListItem = ({
  item,
  handleFolderClick,
  handlePageClick,
  handleOnContextMenu,
  handleRename,
  renameInputRef,
  inputPositionRef,
  handleDragEnter,
  handleNewPageSubmit,
  handleNewFolderSubmit,
  handleDrop,
  index,
}: {
  item: ItemState;
  handleFolderClick: Function;
  handlePageClick: Function;
  handleOnContextMenu: Function;
  handleRename: Function;
  renameInputRef: React.MutableRefObject<HTMLInputElement | null>;
  inputPositionRef: React.MutableRefObject<HTMLInputElement | null>;
  handleDragStart: Function;
  handleDragEnter: Function;
  handleNewPageSubmit: Function;
  handleNewFolderSubmit: Function;
  handleDrop: Function;
  index: number;
}) => {
  const sidebar = useSelector((state: RootState) => state.sidebar);
  const tags = useSelector((state: RootState) => state.tags);
  const combined = useSelector((state: RootState) => state.combined);

  const dispatch = useDispatch();

  async function handleRenameSubmit(e: React.FormEvent, item: ItemState) {
    e.preventDefault();
    try {
      if (item.is_page) {
        const pageInfo = {
          newName: (e.target as HTMLFormElement).newName.value,
          pageId: item.page_id,
        };

        const response = await fetch(`${getApiUrl()}/pages/rename/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "http://localhost:3000",
          },
          body: JSON.stringify(pageInfo),
        });

        if (response.status !== 200) throw response.statusText;

        const data = await response.json();

        if (!data) throw "There was an issue parsing /pages/rename response";

        dispatch(renamePage(pageInfo));
      } else {
        const folderInfo = {
          newName: (e.target as HTMLFormElement).newName.value,
          folderId: item.id,
        };

        const response = await fetch(`${getApiUrl()}/folders/rename/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "http://localhost:3000",
          },
          body: JSON.stringify(folderInfo),
        });

        if (response.status !== 200) throw response.statusText;

        const data = await response.json();

        if (!data) throw "There was an issue parsing /tags/new response";

        dispatch(renameFolder(folderInfo));
      }
      dispatch(setRenameInputToggled(false));
      dispatch(setNewNameForRename(""));
      renameInputRef.current?.blur();
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  function handleNewFolderOnChange(e: ChangeEvent) {
    e.preventDefault();
    dispatch(setNewFolderName((e.target as HTMLInputElement).value));
  }

  function handleNewPageOnChange(e: ChangeEvent) {
    e.preventDefault();
    dispatch(setNewPageName((e.target as HTMLInputElement).value));
  }

  function handleDragStart(pickedUpItem: ItemState) {
    dispatch(setGrabbedItem(pickedUpItem));
  }

  function determineFolderContainerClass(itemFromList: ItemState) {
    let className = "folder-container";

    if (!sidebar.dragToggled || sidebar.inputPosition.referenceId !== itemFromList.id) {
      className += " hoverable";
    }

    if (
      itemFromList.selected ||
      (sidebar.shiftClickItems.start !== null &&
        sidebar.shiftClickItems.end !== null &&
        ((itemFromList.order >= sidebar.shiftClickItems.start &&
          itemFromList.order <= sidebar.shiftClickItems.end) ||
          (itemFromList.order >= sidebar.shiftClickItems.end &&
            itemFromList.order <= sidebar.shiftClickItems.start)))
    ) {
      className += " selected";
    }

    if (
      sidebar.draggedOverItem &&
      (sidebar.draggedOverItem?.id === itemFromList?.id ||
        (sidebar.draggedOverItem?.id === itemFromList?.folder_id &&
          itemFromList.folder_id !== null))
    ) {
      if (
        itemFromList.is_page &&
        itemFromList.folder_id !== sidebar.grabbedItem?.folder_id
      ) {
        className += " under-drag";
      }

      if (!itemFromList.is_page && itemFromList.id !== sidebar.grabbedItem?.folder_id) {
        className += " under-drag";
      }
    }

    return className;
  }

  function handleItemClick(e: MouseEvent, item: ItemState) {
    if (e.shiftKey) {
      if (sidebar.shiftClickItems.start !== null) {
        dispatch(
          setShiftClickItems({
            ...sidebar.shiftClickItems,
            end: item.order,
            list: combined,
          })
        );
      }
    } else {
      dispatch(
        setShiftClickItems({
          start: item.order,
          end: null,
          list: combined,
        })
      );
      if (!item.is_page) handleFolderClick(item, true);
      if (item.is_page) handlePageClick(item);
    }
  }

  return (
    <div
      draggable={item.is_page}
      title={`${item.is_page ? "Page: " : "Folder: "} ${item.name}`}
      onDragStart={() => handleDragStart(item)}
      onDragEnter={(e) => handleDragEnter(e, item)}
      onDrop={(e) => handleDrop(e, sidebar.grabbedItem, item)}
      onDragOver={(e) => e.preventDefault()}
      onDoubleClick={(e) => (item.is_page ? handleRename(e, item) : null)}
      className={determineFolderContainerClass(item)}
      style={{
        ...(sidebar.inputPosition.referenceId === item.id &&
          sidebar.inputPosition.toggled && { overflow: "visible" }),
      }}
      key={index}
      onContextMenu={(e) => handleOnContextMenu(e, item)}
      onClick={(e) => handleItemClick(e, item)}
    >
      <div className="tier-blocks">
        {[...Array(item.tier)].map((tierNum, index) => (
          <div key={index} className="tier-block">
            &nbsp;
          </div>
        ))}
      </div>
      <div
        className={`name-and-buttons`}
        data-tier={`${item.tier ? `tier-${item.tier}` : "null"}`}
      >
        <div className="name-and-caret">
          <div className="caret-container">
            {!item.is_page && (
              <Caret direction={item.expanded_status ? "down" : "right"} />
            )}
            {item.is_page && <PageIcon />}
          </div>
          {sidebar.renameInputToggled &&
          sidebar.inputPosition.referenceId === (item.page_id || item.id) ? (
            <form onSubmit={(e) => handleRenameSubmit(e, item)}>
              <input
                value={sidebar.newNameForRename}
                name="newName"
                spellCheck="false"
                onChange={(e) => dispatch(setNewNameForRename(e.target.value))}
                className="rename-input"
                ref={renameInputRef}
                autoComplete="off"
              />
            </form>
          ) : (
            <p>{item.name}</p>
          )}
        </div>
        {item.tag_id && (
          <div className="tags">
            <span
              className="tag-color"
              style={{ backgroundColor: item.tag_color_code }}
              key={index}
              title={item.tag_name}
            >
              &nbsp;
            </span>
          </div>
        )}
      </div>
      {sidebar.inputPosition.referenceId === item.id && sidebar.inputPosition.toggled && (
        <form
          onSubmit={(e) => {
            if (sidebar.inputPosition.forFolder) {
              handleNewFolderSubmit(e);
            } else {
              handleNewPageSubmit(e);
            }
          }}
          style={{ paddingLeft: `calc(${item.tier} * 10px)` }}
          className="new-folder-form"
        >
          <input
            ref={inputPositionRef}
            onClick={(e) => e.stopPropagation()}
            spellCheck="false"
            onChange={(e) => {
              if (sidebar.inputPosition.forFolder) {
                handleNewFolderOnChange(e);
              } else {
                handleNewPageOnChange(e);
              }
            }}
            value={
              sidebar.inputPosition.forFolder
                ? sidebar.newFolderName
                : sidebar.newPageName
            }
            autoComplete="off"
          />
        </form>
      )}
    </div>
  );
};
export default ItemListItem;
