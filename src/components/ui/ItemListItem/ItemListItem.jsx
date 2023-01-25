import { useDispatch, useSelector } from "react-redux";
import "./ItemListItem.css";
import {
  setGrabbedItem,
  setNewFolderName,
  setNewNameForRename,
  setNewPageName,
  setRenameInputToggled,
  setShiftClickItems,
} from "../../../redux/sidebar";
import Caret from "../Icons/Caret";
import PageIcon from "../Icons/PageIcon";
import { renameFolder } from "../../../redux/folders";
import { renamePage } from "../../../redux/pages";

const ItemListItem = ({
  item,
  combined,
  handleFolderClick,
  handlePageClick,
  handleOnContextMenu,
  handleRename,
  renameInputRef,
  inputPositionRef,
  handleDragStart,
  handleDragEnter,
  handleNewPageSubmit,
  handleNewFolderSubmit,
  handleDrop,
  index,
}) => {
  const sidebar = useSelector((state) => state.sidebar);
  const tags = useSelector((state) => state.tags);

  const dispatch = useDispatch();

  async function handleRenameSubmit(e, item) {
    e.preventDefault();
    try {
      if (item.IS_PAGE) {
        const pageInfo = {
          newName: e.target.newName.value,
          pageId: item.PAGE_ID,
        };

        const response = await fetch("http://localhost:3001/pages/rename", {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify(pageInfo),
        });

        if (response.status !== 200) throwResponseStatusError(response, "POST");

        const data = await response.json();

        if (!data) throw "There was an issue parsing /pages/rename response";

        dispatch(renamePage(pageInfo));
        renameInputRef.current.blur();
        dispatch(setRenameInputToggled(false));
      } else {
        const folderInfo = {
          newName: e.target.newName.value,
          folderId: item.ID,
        };

        const response = await fetch("http://localhost:3001/folders/rename", {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify(folderInfo),
        });

        if (response.status !== 200) throwResponseStatusError(response, "POST");

        const data = await response.json();

        if (!data) throw "There was an issue parsing /tags/new response";

        dispatch(renameFolder(folderInfo));
        renameInputRef.current.blur();
        dispatch(setRenameInputToggled(false));
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleNewFolderOnChange(e) {
    e.preventDefault();
    dispatch(setNewFolderName(e.target.value));
  }

  function handleNewPageOnChange(e) {
    e.preventDefault();
    dispatch(setNewPageName(e.target.value));
  }

  function handleDragStart(e, pickedUpItem) {
    e.stopPropagation();
    dispatch(setGrabbedItem(pickedUpItem));
  }

  function determineFolderContainerClass(itemFromList) {
    let className = "folder-container";

    if (!sidebar.dragToggled || sidebar.inputPosition.referenceId !== itemFromList.ID) {
      className += " hoverable";
    }

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
      sidebar.draggedOverItem?.ID === itemFromList?.ID ||
      (sidebar.draggedOverItem?.ID === itemFromList?.FOLDER_ID &&
        itemFromList.FOLDER_ID !== null)
    ) {
      if (
        itemFromList.IS_PAGE &&
        itemFromList.FOLDER_ID !== sidebar.grabbedItem?.FOLDER_ID
      ) {
        className += " under-drag";
      }

      if (!itemFromList.IS_PAGE && itemFromList.ID !== sidebar.grabbedItem?.FOLDER_ID) {
        className += " under-drag";
      }
    }

    return className;
  }

  function handleItemClick(e, item) {
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
  }

  return (
    <div
      draggable={item.IS_PAGE}
      title={`${item.IS_PAGE ? "Page: " : "Folder: "} ${item.NAME}`}
      onDragStart={(e) => handleDragStart(e, item)}
      onDragEnter={(e) => handleDragEnter(e, item)}
      onDrop={(e) => handleDrop(e, sidebar.grabbedItem, item)}
      onDragOver={(e) => e.preventDefault()}
      onDoubleClick={(e) => (item.IS_PAGE ? handleRename(e, item) : null)}
      className={determineFolderContainerClass(item)}
      style={{
        ...(sidebar.inputPosition.referenceId === item.ID &&
          sidebar.inputPosition.toggled && { overflow: "visible" }),
      }}
      key={index}
      onContextMenu={(e) => handleOnContextMenu(e, item)}
      onClick={(e) => handleItemClick(e, item)}
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
          {sidebar.renameInputToggled &&
          sidebar.inputPosition.referenceId === (item.PAGE_ID || item.ID) ? (
            <form onSubmit={(e) => handleRenameSubmit(e, item)}>
              <input
                value={sidebar.newNameForRename}
                name="newName"
                spellCheck="false"
                onChange={(e) => dispatch(setNewNameForRename(e.target.value))}
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
            {item.TAGS.map((tagId, index) => {
              const tag = tags.list?.find((tag) => tag.ID === tagId);
              return (
                <span
                  className="tag-color"
                  style={{ backgroundColor: tag.COLOR_CODE }}
                  key={index}
                  title={tag.NAME}
                >
                  &nbsp;
                </span>
              );
            })}
          </div>
        )}
      </div>
      {sidebar.inputPosition.referenceId === item.ID && sidebar.inputPosition.toggled && (
        <form
          onSubmit={
            sidebar.inputPosition.forFolder ? handleNewFolderSubmit : handleNewPageSubmit
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
              sidebar.inputPosition.forFolder
                ? handleNewFolderOnChange
                : handleNewPageOnChange
            }
            value={
              sidebar.inputPosition.forFolder
                ? sidebar.newFolderName
                : sidebar.newPageName
            }
          />
        </form>
      )}
    </div>
  );
};
export default ItemListItem;
