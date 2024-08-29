import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { PageState } from "../../../types";
import OpenPageButton from "../OpenPageButton/OpenPageButton";
import "./OpenPageNavigation.css";

const OpenPageNavigation = () => {
  const pages = useSelector((state: RootState) => state.pages);

  const openPages = pages.list.filter((page: PageState) => page.open);

  return (
    <div className="open-page-navigation">
      {openPages.length === 0 && <OpenPageButton page={null} />}
      {openPages.map((page, key) => (
        <OpenPageButton page={page} key={key} />
      ))}
    </div>
  );
};

export default OpenPageNavigation;
