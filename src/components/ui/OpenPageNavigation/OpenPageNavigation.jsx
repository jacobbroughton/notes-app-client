import { useSelector, useDispatch } from "react-redux";
import XIcon from "../Icons/XIcon";
import "./OpenPageNavigation.css";
import { selectPage, setPageClosed } from "../../../redux/pages";
import OpenPageButton from "../OpenPageButton/OpenPageButton";

const OpenPageNavigation = () => {
  const pages = useSelector((state) => state.pages);
  const dispatch = useDispatch();

  const openOrActivePages = pages.list.filter((page) => page.OPEN);

  return (
    <div className="open-page-navigation">
      {openOrActivePages.length === 0 && <OpenPageButton page={null} />}
      {openOrActivePages.map((page, key) => (
        <OpenPageButton page={page} key={key}/>
      ))}
    </div>
  );
};

export default OpenPageNavigation;
