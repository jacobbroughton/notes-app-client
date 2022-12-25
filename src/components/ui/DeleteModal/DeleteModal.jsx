import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { setStagedFolderToDelete, setFolderEffStatus } from "../../../redux/folders";
import { setStagedPageToDelete, setPageEffStatus } from "../../../redux/pages";
import Overlay from "../Overlay/Overlay";
import "./DeleteModal.css";
import PageIcon from "../Icons/PageIcon";
import { setShiftClickItems } from "../../../redux/sidebar";

export function DeleteModal() {
  const dispatch = useDispatch();
  const pages = useSelector((state) => state.pages);
  const folders = useSelector((state) => state.folders);
  const sidebar = useSelector((state) => state.sidebar);

  let itemToDelete = null;

  if (pages.stagedToDelete) {
    itemToDelete = pages.stagedToDelete;
  } else if (folders.stagedToDelete) {
    itemToDelete = folders.stagedToDelete;
  } else if (sidebar.shiftClickItems.list) {
    console.log(sidebar.shiftClickItems.list);
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

      console.log(data);

      data.deletedFolders.forEach((folderId) => {
        console.log("Deleting folder - ", folderId);
        dispatch(setFolderEffStatus(folderId));
        pages.list.forEach((page) => {
          if (page.FOLDER_ID === folderId) dispatch(setPageEffStatus(page.PAGE_ID));
        });
      });
      dispatch(toggleModal("deleteModal"));
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
      dispatch(toggleModal("deleteModal"));
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteMultiple(items) {
    try {
      const selectionIncludesFolders = items.filter((item) => !item.IS_PAGE).length !== 0;
      const selectionIncludesPages = items.filter((item) => item.IS_PAGE).length !== 0;

      if (selectionIncludesFolders) {
        let deleteFoldersResponse = await fetch(
          "http://localhost:3001/folders/delete-multiple",
          {
            method: "post",
            headers: {
              "content-type": "application/json;charset=UTF-8",
            },
            credentials: "include",
            body: JSON.stringify({ folders: items.filter((item) => !item.IS_PAGE) }),
          }
        );
        let deleteFoldersData = await deleteFoldersResponse.json();
        for (let i = 0; i < deleteFoldersData.deletedFolderIds.length; i++) {
          dispatch(setFolderEffStatus(deleteFoldersData.deletedFolderIds[i]));
        }
      }

      if (selectionIncludesPages) {
        let deletePagesResponse = await fetch(
          "http://localhost:3001/pages/delete-multiple",
          {
            method: "post",
            headers: {
              "content-type": "application/json;charset=UTF-8",
            },
            credentials: "include",
            body: JSON.stringify({ pages: items.filter((item) => item.IS_PAGE) }),
          }
        );

        let deletePagesData = await deletePagesResponse.json();

        for (let i = 0; i < deletePagesData.deletedPageIds.length; i++) {
          dispatch(setPageEffStatus(deletePagesData.deletedPageIds[i]));
        }
      }
      dispatch(setShiftClickItems({ start: null, end: null, list: [] }))
      dispatch(toggleModal("deleteModal"));
    } catch (err) {
      console.log(err);
    }
  }

  function handleDelete() {
    if (sidebar.shiftClickItems.list.length > 1) {
      deleteMultiple(sidebar.shiftClickItems.list);
    } else if (pages.stagedToDelete) {
      deletePage(pages.stagedToDelete.PAGE_ID);
    } else if (folders.stagedToDelete) {
      deleteFolder(folders.stagedToDelete.ID);
    }
  }

  function handleCancel() {
    if (pages.stagedToDelete) dispatch(setStagedPageToDelete(null));
    if (folders.stagedToDelete) dispatch(setStagedFolderToDelete(null));
    dispatch(toggleModal("deleteModal"));
  }

  function determinePromptText(itemToDelete) {
    if (sidebar.shiftClickItems.list.length > 1) {
      return `Are you sure you'd like to delete the following ${sidebar.shiftClickItems.list.length} items?`;
    }
    if (itemToDelete.IS_PAGE) {
      return `Are you sure you want to delete '${itemToDelete?.NAME}'`;
    } else {
      return `Are you sure you want to delete '${itemToDelete?.NAME}' and it's contents?`;
    }
  }

  return (
    <>
      <div className="delete-modal">
        <p className="sure-question">{determinePromptText(itemToDelete)}</p>
        {sidebar.shiftClickItems.list && (
          <ul className="items-to-delete-list">
            {sidebar.shiftClickItems.list.map((item, index) => (
              <li key={index}>
                {item.IS_PAGE ? <PageIcon /> : ""} {item.NAME}
              </li>
            ))}
          </ul>
        )}
        <div className="buttons">
          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
      <Overlay />
    </>
  );
}
