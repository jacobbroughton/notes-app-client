import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../redux/user";
import { updatePage, setPageModified, selectPage, setPages } from "../../../redux/pages";
import { selectFolder, setFolders } from "../../../redux/folders";
import { toggleModal } from "../../../redux/modals";
import { getElapsedTime } from "../../../utils/getElapsedTime";
import { formatFolders, formatPages } from "../../../utils/formatData";
import Overlay from "../../ui/Overlay/Overlay";
import PageIcon from "../../ui/Icons/PageIcon";
import { DeleteModal } from "../../ui/DeleteModal/DeleteModal";
import "./Home.css";
import TagsModal from "../../ui/TagsModal/TagsModal";
import { setTags } from "../../../redux/tags";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const bodyFieldRef = useRef(null);
  const titleFieldRef = useRef(null);
  const [title, setTitle] = useState("");
  const [noTitleWarningToggled, setNoTitleWarningToggled] = useState(false);
  const [noTitleWarningTimeout, setNoTitleWarningTimeout] = useState(null);
  const [body, setBody] = useState("");
  const user = useSelector((state) => state.user);
  const pages = useSelector((state) => state.pages);
  const folders = useSelector((state) => state.folders);
  const [loading, setLoading] = useState(true);
  const modals = useSelector((state) => state.modals);
  let pageModified = false;

  if (pages.active) {
    if (pages.active.BODY !== body || title !== pages.active?.TITLE) pageModified = true;
  }

  async function testApi() {
    const result = await fetch("http://localhost:3001", {
      credentials: "include",
    });
    const data = await result.json();
    if (data.user && !user) {
      dispatch(setUser(data.user));
      setLoading(false);
    }
    if (!data.user) navigate("/login");
  }

  // async function testProtectedRoute() {
  //   const result = await fetch("http://localhost:3001/protected-route", {
  //       credentials: 'include'

  //   });
  //   const data = await result.json();
  //   console.log(data);
  // }

  // async function testAdminRoute() {
  //   const result = await fetch("http://localhost:3001/admin-route", {
  //       credentials: 'include'
  //   });
  //   const data = await result.json();
  //   console.log(data);
  // }

  async function getData() {
    try {
      let foldersResponse = await fetch("http://localhost:3001/folders", {
        method: "GET",
        credentials: "include",
      });
      let pagesResponse = await fetch("http://localhost:3001/pages", {
        method: "GET",
        credentials: "include",
      });

      let foldersData = await foldersResponse.json();
      let pagesData = await pagesResponse.json();

      let formattedFolders = formatFolders(foldersData.folders, folders.list, pages.list);
      let formattedPages = formatPages(pagesData.pages, formattedFolders);

      dispatch(setFolders(formattedFolders));
      dispatch(setPages(formattedPages));
    } catch (err) {
      console.log(err);
    }
  }

  async function getTags() {
    try {
      let tagsResponse = await fetch("http://localhost:3001/tags", {
        method: "GET",
        credentials: "include",
      });
      let tagsData = await tagsResponse.json();
      dispatch(setTags(tagsData.tags));
    } catch (err) {
      console.log(err);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ title, body });

    if (!title) {
      bodyFieldRef.current?.blur();
      titleFieldRef.current?.focus();
      clearTimeout(noTitleWarningTimeout);
      setNoTitleWarningToggled(true);
      return;
    }

    fetch("http://localhost:3001/pages/edit", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        pageId: pages.active?.PAGE_ID,
        title,
        body,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(noTitleWarningTimeout);
        setNoTitleWarningToggled(false);
        dispatch(updatePage(data.modifiedPage));
        dispatch(setPageModified(false));
        if (modals.unsavedWarningVisible) {
          dispatch(selectPage(pages.staged));
          dispatch(selectFolder(null));
          dispatch(toggleModal("unsavedWarning"));
        }
      })
      .catch((err) => console.log(err));
  }

  function handleNewPageSubmit(e) {
    e.preventDefault();

    if (!title) {
      bodyFieldRef.current?.blur();
      titleFieldRef.current?.focus();
      clearTimeout(noTitleWarningTimeout);
      setNoTitleWarningToggled(true);
      return;
    }

    console.log(body === null);

    fetch("http://localhost:3001/pages/new", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        parentFolderId: null,
        newPageName: title,
        newPageBody: body || "",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        clearTimeout(noTitleWarningTimeout);
        setNoTitleWarningToggled(false);
        getData();
        setTitle("");
        setBody("");
      })
      .catch((err) => console.log(err));
  }
  function handleKeyDown(e) {
    if (document.activeElement === bodyFieldRef.current) {
      if (e.keyCode === 9) {
        e.preventDefault();
        const newBody =
          body.slice(0, e.selectionStart) +
          " " +
          body.slice(e.selectionStart, body.length - 1);
        setBody(newBody);
      }
    }
    if (
      document.activeElement === bodyFieldRef.current ||
      document.activeElement === titleFieldRef.current
    ) {
      if (e.metaKey && e.key === "s") {
        if (pages.active) handleSubmit(e);
        if (!pages.active) handleNewPageSubmit(e);
      }
    }
  }

  function handleBodyChange(e) {
    e.preventDefault();
    setBody(e.target.value);
  }

  function handleTitleChange(e) {
    e.preventDefault();

    setTitle(e.target.value);
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

  function determinePath(page) {
    let parentFolders = [];

    function getParentFolder(folderId) {
      if (!folderId) return;
      let parent = folders.list?.find((folder) => folder.ID === folderId);
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
    let newTitle = "";
    if (pages.active?.TITLE) {
      newTitle = pages.active?.TITLE;
    } else if (pages.active?.NAME) {
      newTitle = pages.active?.NAME;
    }
    setTitle(newTitle);

    const newBody = pages.active?.BODY || "";

    setBody(newBody);

    return () => {
      if (pages.active?.IS_MODIFIED) dispatch(toggleModal("unsavedWarning"));
    };
  }, [pages.active?.PAGE_ID]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    if (title && noTitleWarningToggled) {
      clearTimeout(noTitleWarningTimeout);
      setNoTitleWarningToggled(false);
    }
    if (pages.active) {
      dispatch(
        setPageModified(body !== pages.active?.BODY || title !== pages.active?.TITLE)
      );
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [body, title]);

  // useEffect(() => {});

  if (loading && !user) {
    return <p>Loading...</p>;
  }

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="home-view">
      {modals.unsavedWarningVisible && (
        <>
          <Overlay />
          <div className="unsaved-warning-modal">
            <p>You've got unsaved changes, would you like to save them?</p>
            <div className="buttons">
              <button onClick={handleSubmit} className="save-btn">
                Save Changes
              </button>
              <button onClick={() => dispatch(toggleModal("unsavedWarning"))}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
      {modals.deleteModalVisible && <DeleteModal />}
      {modals.tagsModalVisible && <TagsModal />}
      {!pages.active && (
        <form className="editor-form" onSubmit={handleNewPageSubmit}>
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
              value={title}
              spellCheck="false"
              required
              onChange={handleTitleChange}
              ref={titleFieldRef}
              className={noTitleWarningToggled ? "error" : ""}
              // tabIndex="0"
            />
          </div>

          <textarea
            type="text"
            placeholder="Body"
            value={body}
            spellCheck="false"
            onChange={handleBodyChange}
            ref={bodyFieldRef}
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
          />
        </form>
      )}
      {pages.active && (
        <form className="editor-form" onSubmit={handleSubmit}>
          {determinePath(pages.active).length !== 0 && (
            <div className="page-path">
              {determinePath(pages.active).map((folder, i) => (
                <div className="folder-name-and-divider" key={i}>
                  <p>{folder.NAME}</p>
                  <span className="path-divider">&nbsp;&gt;&nbsp;</span>
                </div>
              ))}
              <div className="current-page">
                <PageIcon />
                <p>{pages.active.NAME}</p>
              </div>
            </div>
          )}
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
              value={title}
              spellCheck="false"
              required
              onChange={handleTitleChange}
              ref={titleFieldRef}
              className={noTitleWarningToggled ? "error" : ""}
            />
          </div>

          <textarea
            type="text"
            placeholder="Body"
            value={body}
            spellCheck="false"
            onChange={handleBodyChange}
            ref={bodyFieldRef}
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
          />
        </form>
      )}
      {/* <div>Excel-like page selector here</div> */}

      {/* <button onClick={testProtectedRoute}>Protected Route</button>
      <button onClick={testAdminRoute}>Admin Route</button> */}
    </div>
  );
};

export default Home;
