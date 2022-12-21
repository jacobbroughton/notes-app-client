import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { setStagedFolderToDelete, setFolderEffStatus } from "../../../redux/folders";
import { setStagedPageToDelete, setPageEffStatus } from "../../../redux/pages";
import Overlay from "../Overlay/Overlay";
import "./DeleteModal.css";

export function DeleteModal() {
  const dispatch = useDispatch();
  const pages = useSelector((state) => state.pages);
  const folders = useSelector((state) => state.folders);

  let itemToDelete = null;

  if (pages.stagedToDelete) {
    itemToDelete = pages.stagedToDelete;
  } else if (folders.stagedToDelete) {
    itemToDelete = folders.stagedToDelete;
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

      console.log(data)

      data.deletedFolders.forEach((folderId) => {
        console.log('Deleting folder - ', folderId)
        dispatch(setFolderEffStatus(folderId));
        pages.list.forEach((page) => {
          if (page.FOLDER_ID === folderId) dispatch(setPageEffStatus(page.PAGE_ID))
        })
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

  function handleDelete() {
    if (pages.stagedToDelete) {
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

  return (
    <>
      <div className="delete-modal">
        <p className="sure-question">
          Are you sure you want to delete '{itemToDelete?.NAME}'
          {!itemToDelete.IS_PAGE && " and it's contents"}?
        </p>
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
