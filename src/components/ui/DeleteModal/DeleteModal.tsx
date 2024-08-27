import { useDispatch, useSelector } from "react-redux";
import { setFolderEffStatus, setStagedFolderToDelete } from "../../../redux/folders";
import { toggleModal } from "../../../redux/modals";
import { setPageEffStatus, setStagedPageToDelete } from "../../../redux/pages";
import { setShiftClickItems } from "../../../redux/sidebar";
import { RootState } from "../../../redux/store";
import { FolderState, PageState, SidebarItemState } from "../../../types";
import { getApiUrl } from "../../../utils/getUrl";
import PageIcon from "../Icons/PageIcon";
import Overlay from "../Overlay/Overlay";
import "./DeleteModal.css";

export function DeleteModal() {
  const dispatch = useDispatch();
  const pages = useSelector((state: RootState) => state.pages);
  const folders = useSelector((state: RootState) => state.folders);
  const sidebar = useSelector((state: RootState) => state.sidebar);

  let itemToDelete = null;

  if (pages.stagedToDelete) {
    itemToDelete = pages.stagedToDelete;
  } else if (folders.stagedToDelete) {
    itemToDelete = folders.stagedToDelete;
  }

  async function deleteFolder(folderId: number) {
    try {
      let response = await fetch(`${getApiUrl()}/folders/delete/`, {
        method: "post",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        credentials: "include",
        body: JSON.stringify({
          folderId,
        }),
      });

      if (response.status !== 200) throw response.statusText;

      let data = await response.json();

      if (!data) throw "There was a problem parsing folders/delete response";

      data.deletedFolders.forEach((folderId: number) => {
        dispatch(setFolderEffStatus(folderId));
        pages.list.forEach((page: PageState) => {
          if (page.folder_id === folderId) dispatch(setPageEffStatus(page.page_id));
        });
      });
      dispatch(toggleModal("deleteModal"));
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  async function deletePage(pageId: number) {
    try {
      let response = await fetch(`${getApiUrl()}/pages/delete/`, {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        credentials: "include",
        body: JSON.stringify({
          pageId,
        }),
      });

      if (response.status !== 200) throw response.statusText;

      await response.json();
      dispatch(setPageEffStatus(pageId));
      dispatch(toggleModal("deleteModal"));
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  async function deleteMultiple(items: Array<SidebarItemState>) {
    try {
      const selectionIncludesFolders =
        items.filter((item: SidebarItemState) => !item.is_page).length !== 0;
      const selectionIncludesPages =
        items.filter((item: SidebarItemState) => item.is_page).length !== 0;

      if (selectionIncludesFolders) {
        let response = await fetch(`${getApiUrl()}/folders/delete-multiple/`, {
          method: "POST",
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "http://localhost:3000",
          },
          credentials: "include",
          body: JSON.stringify({
            folders: items.filter((item: SidebarItemState) => !item.is_page),
          }),
        });

        if (response.status !== 200) throw response.statusText;

        let deleteFoldersData = await response.json();
        for (let i = 0; i < deleteFoldersData.deletedFolderIds.length; i++) {
          dispatch(setFolderEffStatus(deleteFoldersData.deletedFolderIds[i]));
        }
      }

      if (selectionIncludesPages) {
        let response = await fetch(`${getApiUrl()}/pages/delete-multiple/`, {
          method: "POST",
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "http://localhost:3000",
          },
          credentials: "include",
          body: JSON.stringify({ pages: items.filter((item) => item.is_page) }),
        });

        if (response.status !== 200) throw response.statusText;

        let deletePagesData = await response.json();

        for (let i = 0; i < deletePagesData.deletedPageIds.length; i++) {
          dispatch(setPageEffStatus(deletePagesData.deletedPageIds[i]));
        }
      }
      dispatch(setShiftClickItems({ start: null, end: null, list: [] }));
      dispatch(toggleModal("deleteModal"));
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  function handleDelete() {
    if (sidebar.shiftClickItems.list.length > 1) {
      deleteMultiple(sidebar.shiftClickItems.list);
    } else if (pages.stagedToDelete) {
      deletePage(pages.stagedToDelete.page_id);
    } else if (folders.stagedToDelete) {
      deleteFolder(folders.stagedToDelete.id);
    }
    dispatch(setShiftClickItems({ start: null, end: null, list: [] }));
  }

  function handleCancel() {
    if (pages.stagedToDelete) dispatch(setStagedPageToDelete(null));
    if (folders.stagedToDelete) dispatch(setStagedFolderToDelete(null));
    dispatch(toggleModal("deleteModal"));
  }

  function determinePromptText(itemsToDelete: FolderState | PageState | null) {
    if (sidebar.shiftClickItems.list.length > 1) {
      return `Are you sure you'd like to delete the following ${sidebar.shiftClickItems.list.length} items?`;
    }

    if (!itemsToDelete)
      return "There was an error but are you sure you'd like to delete this? If its a folder, you'll also be deleting it's contents.";

    if (itemsToDelete.is_page) {
      return `Are you sure you want to delete '${itemsToDelete?.name}'`;
    } else {
      return `Are you sure you want to delete '${itemsToDelete?.name}' and it's contents?`;
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
                {item.is_page ? <PageIcon /> : ""} {item.name}
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
