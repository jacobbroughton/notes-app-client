import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../redux/user";
import {
  updatePage,
  setPageModified,
  selectPage,
  setPages,
  setPageStagedForSwitch,
  setPageDraftBody,
  setPageDraftTitle,
  setUntitledPageBody,
  setUntitledPageTitle,
} from "../../../redux/pages";
import { selectFolder, setFolders } from "../../../redux/folders";
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
import { throwResponseStatusError } from "../../../utils/throwResponseStatusError";
import { FolderState, PageState } from "../../../types";
import { RootState } from "../../../redux/store";
import { getApiUrl } from "../../../utils/getUrl";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const titleFieldRef = useRef<HTMLInputElement>(null);
  const bodyFieldRef = useRef<HTMLTextAreaElement>(null);
  const [noTitleWarningToggled, setNoTitleWarningToggled] = useState<boolean>(false);
  const [noTitleWarningTimeout, setNoTitleWarningTimeout] = useState<
    number | undefined
  >();
  const [loading, setLoading] = useState<boolean>(true);
  const user = useSelector((state: RootState) => state.user);
  const pages = useSelector((state: RootState) => state.pages);
  const folders = useSelector((state: RootState) => state.folders);
  const modals = useSelector((state: RootState) => state.modals);
  let pageModified = false;

  if (pages.active) {
    if (
      pages.active.BODY !== pages.active.DRAFT_BODY ||
      pages.active?.NAME !== pages.active.DRAFT_NAME
    )
      pageModified = true;
  }

  async function testApi() {
    const response = await fetch(getApiUrl(), {
      credentials: "include",
    });
    const data = await response.json();
    if (data.user && !user) {
      dispatch(setUser(data.user));
      setLoading(false);
    }
    if (!data.user) navigate("/login");
  }

  async function getFolders() {
    return await fetch(`${getApiUrl()}/folders`, {
      method: "GET",
      credentials: "include",
    });
  }

  async function getPages() {
    return await fetch(`${getApiUrl()}/pages`, {
      method: "GET",
      credentials: "include",
    });
  }

  async function getData() {
    try {
      const foldersResponse = await getFolders();
      const pagesResponse = await getPages();

      if (foldersResponse.status !== 200)
        throwResponseStatusError(foldersResponse, "GET");

      if (pagesResponse.status !== 200) throwResponseStatusError(pagesResponse, "GET");

      const foldersData = await foldersResponse.json();
      const pagesData = await pagesResponse.json();

      let formattedFolders = formatFolders(foldersData.folders, folders.list);
      let formattedPages = formatPages(pagesData.pages, formattedFolders);

      dispatch(setFolders(formattedFolders));
      dispatch(setPages(formattedPages));
    } catch (error) {
      console.log(error);
    }
  }

  async function getTags() {
    try {
      let response = await fetch(`${getApiUrl()}/tags`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status !== 200) throwResponseStatusError(response, "GET");

      let tagsData = await response.json();
      dispatch(setTags(tagsData.tags));
    } catch (error) {
      console.log(error);
    }
  }

  async function getColorOptions() {
    try {
      let response = await fetch(`${getApiUrl()}/tags/color-options`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status !== 200) throwResponseStatusError(response, "GET");

      let colorOptionsData = await response.json();
      dispatch(
        setColorOptions({
          defaultOptions: colorOptionsData.defaultOptions,
          userCreatedOptions: colorOptionsData.userCreatedOptions,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
      const response = await fetch(`${getApiUrl()}/pages/edit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Access-Control-Allow-Origin": "true",
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          pageId: pages.active?.PAGE_ID,
          name: pages.active?.DRAFT_NAME,
          body: pages.active?.DRAFT_BODY,
        }),
      });

      if (response.status !== 200) throwResponseStatusError(response, "POST");

      const data = await response.json();

      clearTimeout(noTitleWarningTimeout);
      setNoTitleWarningToggled(false);
      dispatch(updatePage(data.modifiedPage));
      dispatch(setPageModified(false));

      if (modals.unsavedWarning) {
        dispatch(selectPage(pages.stagedToSwitch));
        dispatch(setPageStagedForSwitch(null));
        dispatch(selectFolder(null));
        dispatch(toggleModal("unsavedWarning"));
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleNewPageSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pages.untitledPage.NAME) {
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
      const response = await fetch(`${getApiUrl()}/pages/new`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          parentFolderId: null,
          newPageName: pages.untitledPage.NAME.trim(),
          newPageBody: pages.untitledPage.BODY.trim() || "",
        }),
      });

      if (response.status !== 200) throwResponseStatusError(response, "POST");

      const result = await response.json();

      if (!result) throw "There was an error adding the page";

      clearTimeout(noTitleWarningTimeout);
      setNoTitleWarningToggled(false);
      getData();
      dispatch(setUntitledPageTitle(""));
      dispatch(setUntitledPageBody(""));
    } catch (error) {
      console.log(error);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (document.activeElement === bodyFieldRef.current) {
      if (e.keyCode === 9) {
        e.preventDefault();
        // const newBody =
        //   body.slice(0, e.selectionStart) +
        //   " " +
        //   body.slice(e.selectionStart, body.length - 1);
        // setBody(newBody);
        // dispatch(setPageDraftBody(newBody));
        alert("Uncomment line above i guess");
      }
    }
    if (
      document.activeElement === bodyFieldRef.current ||
      document.activeElement === titleFieldRef.current
    ) {
      if (e.metaKey && e.key === "s") {
        if (pages.active) editPage();
        if (!pages.active) addPage();
      }
    }
  }

  function handleBodyChange(e: ChangeEvent, isForUnsaved: Boolean) {
    e.preventDefault();
    // setBody(e.target.value);
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

    // setTitle(e.target.value);
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

  function determineSavedStatus() {
    if (pageModified && pages.active?.MODIFIED_DTTM) {
      return `You have unsaved changes, last saved ${getElapsedTime(
        pages.active?.MODIFIED_DTTM
      )}`;
    } else if (pageModified && !pages.active?.MODIFIED_DTTM) {
      return "You have unsaved changes";
    }

    return "Up to date";
  }

  function determinePath(page: PageState) {
    let parentFolders: Array<FolderState> = [];

    function getParentFolder(folderId: number | null) {
      if (!folderId) return;
      let parent = folders.list?.find((folder: FolderState) => folder.ID === folderId);
      if (!parent) return;
      parentFolders.unshift(parent);
      getParentFolder(parent.PARENT_FOLDER_ID);
    }

    getParentFolder(page.FOLDER_ID);

    return parentFolders;
  }

  useEffect(() => {
    testApi();
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
    if (pages.active?.NAME) {
      newName = pages.active?.NAME;
    } else if (pages.active?.NAME) {
      newName = pages.active?.NAME;
    }

    return () => {
      if (pages.active?.IS_MODIFIED) dispatch(toggleModal("unsavedWarning"));
    };
  }, [pages.active?.PAGE_ID]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    if (pages.active) {
      if (noTitleWarningToggled) {
        clearTimeout(noTitleWarningTimeout);
        setNoTitleWarningToggled(false);
      }

      const isModified =
        pages.active.DRAFT_BODY !== pages.active?.BODY ||
        pages.active.DRAFT_NAME !== pages.active?.NAME;

      dispatch(setPageModified(isModified));
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    pages.active?.DRAFT_NAME,
    pages.active?.DRAFT_BODY,
    pages.untitledPage.BODY,
    pages.untitledPage.NAME,
  ]);

  if (loading && !user) {
    return <p>Loading...</p>;
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
                pages.untitledPage.NAME !== "" || pages.untitledPage.BODY !== ""
                  ? "unsaved"
                  : "saved"
              }`}
              title={determineSavedStatus()}
            ></div>
            <input
              type="text"
              placeholder="Title / Topic"
              value={pages.untitledPage.NAME}
              spellCheck="false"
              required
              onChange={(e) => handleTitleChange(e, true)}
              ref={titleFieldRef}
              className={noTitleWarningToggled ? "error" : ""}
              autoComplete="off"
              // tabIndex="0"
            />
          </div>

          <textarea
            placeholder="Body"
            value={pages.untitledPage.BODY}
            spellCheck="false"
            onChange={(e) => handleBodyChange(e, true)}
            ref={bodyFieldRef}
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
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
              className={`status-indicator ${pageModified ? "unsaved" : "saved"}`}
              title={determineSavedStatus()}
            ></div>
            <input
              type="text"
              placeholder="Title / Topic"
              value={pages.active.DRAFT_NAME}
              spellCheck="false"
              required
              onChange={(e) => handleTitleChange(e, false)}
              ref={titleFieldRef}
              className={noTitleWarningToggled ? "error" : ""}
              autoComplete="off"
            />
          </div>

          <textarea
            placeholder="Body"
            value={pages.active.DRAFT_BODY}
            spellCheck="false"
            onChange={(e) => handleBodyChange(e, false)}
            ref={bodyFieldRef}
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
          />
          <div className="page-path">
            /&nbsp;
            {determinePath(pages.active).map((folder: FolderState, i: number) => (
              <div className="folder-name-and-divider" key={i}>
                <p>{folder.NAME}</p>
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
              <p>{pages.active.NAME}</p>
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
