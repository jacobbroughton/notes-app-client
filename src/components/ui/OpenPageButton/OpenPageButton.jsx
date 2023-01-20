import { useSelector, useDispatch } from "react-redux";
import XIcon from "../Icons/XIcon";
import { deselectPage, selectPage, setPageClosed } from "../../../redux/pages";
import "./OpenPageButton.css";

const OpenPageButton = ({ page }) => {
  const pages = useSelector((state) => state.pages);
  const dispatch = useDispatch();

  if (!page)
    return (
      <button className={`page-button untitled active`}>
        <p>Untitled</p>
        {/* <button
      className="x-button"
      onClick={(e) => {
        e.stopPropagation();
        dispatch(setPageClosed(page));
      }}
    >
      <XIcon />
    </button> */}
      </button>
    );

  return (
    <div
      className={`page-button ${pages.active?.PAGE_ID === page?.PAGE_ID ? "active" : ""}`}
      onClick={() => dispatch(selectPage(page))}
    >
      <p>{page.NAME}</p>
      <button
        className="x-button"
        onClick={(e) => {
          e.stopPropagation();
          dispatch(setPageClosed(page));
          // if (page.ACTIVE) dispatch(deselectPage(page))
        }}
      >
        <XIcon />
      </button>
    </div>
  );
};
export default OpenPageButton;
