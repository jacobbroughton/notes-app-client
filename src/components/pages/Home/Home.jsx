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

import "./Home.css";

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
  const pageModified = body !== pages.active?.BODY || title !== pages.active?.TITLE;

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
          // setInputPosition({
          //   referenceId: page.PAGE_ID,
          //   toggled: false,
          //   forFolder: false,
          // });
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

    fetch("http://localhost:3001/pages/new", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        parentFolderId: null,
        newPageName: title,
        newPageBody: body,
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
    // dispatch(setPageModified(e.target.value !== pages.active.BODY));
    setBody(e.target.value);
  }

  function handleTitleChange(e) {
    e.preventDefault();

    setTitle(e.target.value);
  }

  function determineSavedStatus() {
    return pageModified && pages.active?.MODIFIED_DTTM
      ? `You have unsaved changes, last saved ${getElapsedTime(
          pages.active?.MODIFIED_DTTM
        )}`
      : "Up to date";
  }

  useEffect(() => {
    testApi();
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
    setTitle(pages.active?.TITLE || pages.active?.NAME);
    setBody(pages.active?.BODY);

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
    if (pages.active)
      dispatch(
        setPageModified(body !== pages.active?.BODY || title !== pages.active?.TITLE)
      );

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [body, title]);

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
              {/* <button>Discard Changes</button> */}
              <button onClick={() => dispatch(toggleModal("unsavedWarning"))}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
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
              tabIndex="0"
            />
          </div>

          <textarea
            type="text"
            placeholder="Body"
            value={body}
            spellCheck="false"
            onChange={handleBodyChange}
            ref={bodyFieldRef}
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
              value={title}
              spellCheck="false"
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
          />
        </form>
      )}

      {/* <button onClick={testProtectedRoute}>Protected Route</button>
      <button onClick={testAdminRoute}>Admin Route</button> */}
    </div>
  );
};

export default Home;
