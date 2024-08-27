import { MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import {
  selectPage,
  setPageClosed,
  setPageStagedForSwitch
} from "../../../redux/pages";
import { RootState } from "../../../redux/store";
import { PageState } from "../../../types";
import XIcon from "../Icons/XIcon";
import "./OpenPageButton.css";

const OpenPageButton = ({ page }: { page: PageState | null }) => {
  const pages = useSelector((state: RootState) => state.pages);
  const dispatch = useDispatch();

  if (!page)
    return (
      <button className={`page-button untitled active`}>
        <p>Untitled</p>
        {(pages.untitledPage.name !== "" ||
          pages.untitledPage.body !== "") /*// TODO -  this was emptyEditor state */ && (
          <span className="unsaved-circle">&nbsp;</span>
        )}
      </button>
    );

  const unsaved = page.draft_name !== page.name || page.draft_body !== page.body;

  function handleXButtonClick(e: MouseEvent, unsaved: boolean) {
    e.stopPropagation();
    if (unsaved) {
      if (!pages.stagedToSwitch) dispatch(setPageStagedForSwitch(page));
      dispatch(toggleModal("unsavedWarning"));
    } else {
      dispatch(setPageClosed(page));
    }
  }

  return (
    <div
      className={`page-button ${
        pages.active?.page_id === page?.page_id ? "active" : ""
      } ${unsaved ? "unsaved" : ""}`}
      onClick={() => dispatch(selectPage(page))}
    >
      <p>{page.name}</p>
      <button className="x-button" onClick={(e) => handleXButtonClick(e, unsaved)}>
        <XIcon />
        {unsaved && <span className="unsaved-circle">&nbsp;</span>}
      </button>
    </div>
  );
};

export default OpenPageButton;
