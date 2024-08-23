import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../redux/user";
import {
  updatePage,
  setPageModified,
  setPages,
  setPageStagedForSwitch,
  setPageDraftBody,
  setPageDraftTitle,
  setUntitledPageBody,
  setUntitledPageTitle,
  setPageClosed,
  resetUntitledPage,
} from "../../../redux/pages";
import { selectFolder, setFolders } from "../../../redux/folders";
import { setSidebarLoading } from "../../../redux/sidebar";
import { toggleModal } from "../../../redux/modals";
import { getElapsedTime } from "../../../utils/getElapsedTime";
import { formatFolders, formatPages } from "../../../utils/formatData";
import Overlay from "../../ui/Overlay/Overlay";
import PageIcon from "../../ui/Icons/PageIcon";
import { DeleteModal } from "../../ui/DeleteModal/DeleteModal";
import "./Home.css";
import TagsModal from "../../ui/TagsModal/TagsModal";
import { setTags, setColorOptions } from "../../../redux/tags";
import OpenPageNavigation from "../../ui/OpenPageNavigation/OpenPageNavigation";
import { FolderState, PageState } from "../../../types";
import { RootState } from "../../../redux/store";
import { getApiUrl } from "../../../utils/getUrl";
import LoadingSpinner from "../../ui/LoadingSpinner/LoadingSpinner";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const titleFieldRef = useRef<HTMLInputElement>(null);
  const bodyFieldRef = useRef<HTMLTextAreaElement>(null);
  const [noTitleWarningToggled, setNoTitleWarningToggled] = useState<boolean>(false);
  const [noTitleWarningTimeout, setNoTitleWarningTimeout] = useState<number>();
  const [titleTooLong, setTitleTooLong] = useState(false);
  const [bodyTooLong, setBodyTooLong] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const user = useSelector((state: RootState) => state.user);
  const pages = useSelector((state: RootState) => state.pages);
  const folders = useSelector((state: RootState) => state.folders);
  const modals = useSelector((state: RootState) => state.modals);

  // async function getUser() {
  //   setLoading(true)
  //   const response = await fetch(`${getApiUrl()}/`, {
  //     method: "GET",
  //     credentials: "include",
  //     headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
  //   });

  //   const data = await response.json();

  //   if (!data.user) navigate("/login");
  //   if (data.user && !user) {
  //     dispatch(setUser(data.user));
  //     setLoading(false);
  //   }
  // }

  async function getData() {
    try {
      dispatch(setSidebarLoading(true));
      const [foldersResponse, pagesResponse] = await Promise.all([
        fetch(`${getApiUrl()}/folders/`, {
          method: "GET",
          credentials: "include",
          headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
        }),
        fetch(`${getApiUrl()}/pages/`, {
          method: "GET",
          credentials: "include",
          headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
        }),
      ]);

      if (foldersResponse.status !== 200) {
        dispatch(setSidebarLoading(false));
        throw foldersResponse.statusText;
      }

      if (pagesResponse.status !== 200) {
        dispatch(setSidebarLoading(false));
        throw pagesResponse.statusText;
      }

      const [foldersData, pagesData] = await Promise.all([
        foldersResponse.json(),
        pagesResponse.json(),
      ]);

      let formattedFolders = formatFolders(foldersData.folders, folders.list);
      let formattedPages = formatPages(pagesData.pages, formattedFolders);

      dispatch(setFolders(formattedFolders));
      dispatch(setPages(formattedPages));
      dispatch(setSidebarLoading(false));
    } catch (e) {
      if (typeof e === "string") {
        setError(e);
      } else if (e instanceof Error) {
        setError(e.message);
      }
    }
  }

  async function getTags() {
    try {
      let response = await fetch(`${getApiUrl()}/tags/`, {
        method: "GET",
        credentials: "include",
        headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
      });

      if (response.status !== 200) throw response.statusText;

      let tagsData = await response.json();
      dispatch(setTags(tagsData.tags));
    } catch (e) {
      if (typeof e === "string") {
        setError(e);
      } else if (e instanceof Error) {
        setError(e.message);
      }
    }
  }

  async function getColorOptions() {
    try {
      let response = await fetch(`${getApiUrl()}/tags/color-options/`, {
        method: "GET",
        credentials: "include",
        headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
      });

      if (response.status !== 200) {
        throw response.statusText;
      }

      let colorOptionsData = await response.json();
      dispatch(
        setColorOptions({
          defaultOptions: colorOptionsData.defaultOptions,
          userCreatedOptions: colorOptionsData.userCreatedOptions,
        })
      );
    } catch (e) {
      if (typeof e === "string") {
        setError(e);
      } else if (e instanceof Error) {
        setError(e.message);
      }
    }
  }

  function handleSubmit(e: React.FormEvent | null) {
    e?.preventDefault();

    if (!pages.active) {
      bodyFieldRef.current?.blur();
      titleFieldRef.current?.focus();
      clearTimeout(noTitleWarningTimeout);
      setNoTitleWarningToggled(true);
      return;
    }

    editPage();
  }

  async function editPage() {
    try {
      if (titleTooLong && bodyTooLong) {
        console.error(
          "Your title and body are too long (Title Max: 1000 characters, Body Max: 10000 characters)"
        );
        return;
      } else if (titleTooLong) {
        console.error("Your title is too long (Max 1000 characters)");
        return;
      } else if (bodyTooLong) {
        console.error("Your text body is too long (Max 10000 characters)");
        return;
      }

      const response = await fetch(`${getApiUrl()}/pages/edit/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        body: JSON.stringify({
          pageId: pages.active?.page_id,
          name: pages.active?.draft_name,
          body: pages.active?.draft_body,
        }),
      });

      if (response.status !== 200) throw response.statusText;

      const data = await response.json();

      clearTimeout(noTitleWarningTimeout);
      setNoTitleWarningToggled(false);
      dispatch(updatePage(data.modifiedPage));
      dispatch(setPageModified(false));

      if (modals.unsavedWarning) {
        dispatch(setPageClosed(pages.active));
        dispatch(setPageStagedForSwitch(null));
        dispatch(selectFolder(null));
        dispatch(toggleModal("unsavedWarning"));
      }
    } catch (e) {
      if (typeof e === "string") {
        setError(e);
      } else if (e instanceof Error) {
        setError(e.message);
      }
    }
  }

  function handleNewPageSubmit(e: React.FormEvent | null) {
    e?.preventDefault();
    if (bodyTooLong || titleTooLong) {
      if (titleTooLong) {
        console.error("Your title is too long (Max 1000 characters)");
      } else if (bodyTooLong) {
        console.error("Your text body is too long (Max 10000 characters)");
      } else {
        console.error(
          "Your title and body are too long (Title Max: 1000 characters, Body Max: 10000 characters)"
        );
      }
      return;
    }

    if (!pages.untitledPage.name) {
      bodyFieldRef.current?.blur();
      titleFieldRef.current?.focus();
      clearTimeout(noTitleWarningTimeout);
      setNoTitleWarningToggled(true);
      return;
    }

    addPage();
  }

  async function addPage() {
    try {
      const response = await fetch(`${getApiUrl()}/pages/new/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        body: JSON.stringify({
          parentFolderId: null,
          newPageName: pages.untitledPage.name.trim(),
          newPageBody: pages.untitledPage.body.trim() || "",
        }),
      });

      if (response.status !== 200) throw response.statusText;

      const result = await response.json();

      if (!result) throw "There was an error adding the page";

      clearTimeout(noTitleWarningTimeout);
      setNoTitleWarningToggled(false);
      getData();
      dispatch(resetUntitledPage(null));
    } catch (e) {
      if (typeof e === "string") {
        setError(e);
      } else if (e instanceof Error) {
        setError(e.message);
      }
    }
  }

  function handleKeyDown(e: any) {
    if (
      bodyFieldRef.current?.contains(document.activeElement) ||
      document.activeElement === titleFieldRef.current
    ) {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        if (pages.active) handleSubmit(null);
        if (!pages.active) handleNewPageSubmit(null);
      }
    }
  }

  function handleBodyChange(e: ChangeEvent, isForUnsaved: Boolean) {
    e.preventDefault();

    if ((e.target as HTMLTextAreaElement).value.length > 10000 && !bodyTooLong) {
      setBodyTooLong(true);
    } else if ((e.target as HTMLTextAreaElement).value.length <= 10000 && bodyTooLong) {
      setBodyTooLong(false);
    }

    if (isForUnsaved) {
      dispatch(setUntitledPageBody((e.target as HTMLTextAreaElement).value));
    } else {
      dispatch(
        setPageDraftBody({
          page: pages.active,
          draftBody: (e.target as HTMLTextAreaElement).value,
        })
      );
    }
  }

  function handleTitleChange(e: ChangeEvent, isForUnsaved: Boolean) {
    e.preventDefault();

    if ((e.target as HTMLTextAreaElement).value.length > 10000 && !titleTooLong) {
      setTitleTooLong(true);
    } else if ((e.target as HTMLTextAreaElement).value.length <= 10000 && titleTooLong) {
      setTitleTooLong(false);
    }

    if (isForUnsaved) {
      dispatch(setUntitledPageTitle((e.target as HTMLTextAreaElement).value));
    } else {
      dispatch(
        setPageDraftTitle({
          page: pages.active,
          draftTitle: (e.target as HTMLTextAreaElement).value,
        })
      );
    }
  }

  function handleTabPress(e: React.KeyboardEvent<HTMLInputElement>) {
    // if (e.key === "Tab") {
    //   e.preventDefault();
    //   e.key);
    //   bodyFieldRef.current?.focus();
    // }
  }

  function determinePath(page: PageState | null) {
    if (!page) return [];

    let parentFolders: Array<FolderState> = [];

    function getParentFolder(folderId: number | null) {
      if (!folderId) return;
      let parent = folders.list?.find((folder: FolderState) => folder.id === folderId);
      if (!parent) return;
      parentFolders.unshift(parent);
      getParentFolder(parent.parent_folder_id);
    }

    getParentFolder(page.folder_id);

    return parentFolders;
  }

  useEffect(() => {
    getTags();
    getColorOptions();
  }, []);

  useEffect(() => {
    if (noTitleWarningToggled) {
      let timeout = setTimeout(() => {
        clearTimeout(noTitleWarningTimeout);
        setNoTitleWarningToggled(false);
      }, 5000);
      setNoTitleWarningTimeout(timeout);
    }
  }, [noTitleWarningToggled]);

  useEffect(() => {
    let newName = "";
    if (pages.active?.name) {
      newName = pages.active?.name;
    } else if (pages.active?.name) {
      newName = pages.active?.name;
    }

    return () => {
      if (pages.active?.is_modified) dispatch(toggleModal("unsavedWarning"));
    };
  }, [pages.active?.page_id]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    if (pages.active) {
      if (noTitleWarningToggled) {
        clearTimeout(noTitleWarningTimeout);
        setNoTitleWarningToggled(false);
      }

      const isModified =
        pages.active.draft_body !== pages.active?.body ||
        pages.active.draft_name !== pages.active?.name;

      dispatch(setPageModified(isModified));
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    pages.active?.draft_name,
    pages.active?.draft_body,
    pages.untitledPage.body,
    pages.untitledPage.name,
  ]);

  let activePageModified =
    pages.active?.body !== pages.active?.draft_body ||
    pages.active?.name !== pages.active?.draft_name;
  let unsavedPageModified =
    pages.untitledPage.name !== "" ||
    (pages.untitledPage.name !== "" && pages.untitledPage.body !== "");

  let savedStatus = "Up to date";

  if (activePageModified && pages.active?.modified_dttm) {
    savedStatus = `You have unsaved changes, last saved ${getElapsedTime(
      pages.active?.modified_dttm
    )}`;
  } else if (activePageModified && !pages.active?.modified_dttm) {
    savedStatus = "You have unsaved changes";
  }

  if (loading && !user) {
    return (
      <div className="loading-view">
        <LoadingSpinner />
        <h3>Loading...</h3>
        <p>
          The initial load may take longer than expected due to the server spinning down
          after not being used for a while.
        </p>
        {error && (
          <div className="error">
            <p>There was an error</p>
            <code>{error}</code>
          </div>
        )}
      </div>
    );
  }

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="home-view">
      {modals.unsavedWarning && (
        <>
          <Overlay />
          <div className="unsaved-warning-modal">
            <p>You've got unsaved changes, would you like to save them?</p>
            <div className="buttons">
              <button onClick={handleSubmit} className="save-btn">
                Save Changes
              </button>
              <button
                onClick={() => {
                  dispatch(setPageStagedForSwitch(null));
                  dispatch(toggleModal("unsavedWarning"));
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
      {modals.deleteModal && <DeleteModal />}
      {modals.tagsModal && <TagsModal />}
      <OpenPageNavigation />
      {!pages.active && (
        <form className="editor-form" onSubmit={handleNewPageSubmit}>
          <div className="heading">
            {noTitleWarningToggled && (
              <div className="no-title-warning">
                Sorry, the title field can't be empty
              </div>
            )}
            <div
              className={`status-indicator ${
                pages.untitledPage.name !== "" || pages.untitledPage.body !== ""
                  ? "unsaved"
                  : "saved"
              }`}
              title={savedStatus}
            ></div>
            <input
              type="text"
              placeholder="Title / Topic"
              value={pages.untitledPage.name}
              spellCheck="false"
              required
              maxLength={1000}
              onChange={(e) => handleTitleChange(e, true)}
              onKeyDown={(e) => handleTabPress(e)}
              ref={titleFieldRef}
              className={noTitleWarningToggled || titleTooLong ? "error" : ""}
              autoComplete="off"
              tabIndex={1}
            />
            <button className="save-button" disabled={!unsavedPageModified}>
              Save
            </button>
          </div>

          <textarea
            placeholder="Body"
            value={pages.untitledPage.body}
            spellCheck="false"
            maxLength={10000}
            onChange={(e) => handleBodyChange(e, true)}
            ref={bodyFieldRef}
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            className={bodyTooLong ? "error" : ""}
          />
        </form>
      )}
      {pages.active && (
        <form className="editor-form" onSubmit={handleSubmit}>
          <div className="heading">
            {noTitleWarningToggled && (
              <div className="no-title-warning">
                Sorry, the title field can't be empty
              </div>
            )}
            <div
              className={`status-indicator ${activePageModified ? "unsaved" : "saved"}`}
              title={savedStatus}
            ></div>
            <input
              type="text"
              placeholder="Title / Topic"
              value={pages.active?.draft_name}
              spellCheck="false"
              required
              onChange={(e) => handleTitleChange(e, false)}
              ref={titleFieldRef}
              className={noTitleWarningToggled || titleTooLong ? "error" : ""}
              autoComplete="off"
              tabIndex={1}
            />
            <button className="save-button" disabled={!activePageModified}>
              Save
            </button>
          </div>

          <textarea
            placeholder="Body"
            value={pages.active?.draft_body}
            spellCheck="false"
            onChange={(e) => handleBodyChange(e, false)}
            ref={bodyFieldRef}
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            className={bodyTooLong ? "error" : ""}
          />
          <div className="page-path">
            /&nbsp;
            {determinePath(pages.active).map((folder: FolderState, i: number) => (
              <div className="folder-name-and-divider" key={i}>
                <p>{folder.name}</p>
                <span className="path-divider">&nbsp;/&nbsp;</span>
              </div>
            ))}
            {!determinePath(pages.active) && (
              <div className="folder-name-and-divider">
                <span className="path-divider">&nbsp;/&nbsp;</span>
              </div>
            )}
            <div className="current-page">
              <PageIcon />
              <p>{pages.active?.name}</p>
            </div>
          </div>
        </form>
      )}

      {/* <button onClick={testProtectedRoute}>Protected Route</button>
      <button onClick={testAdminRoute}>Admin Route</button> */}
    </div>
  );
};

export default Home;
