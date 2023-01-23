import { useSelector } from "react-redux";
import OpenPageButton from "../OpenPageButton/OpenPageButton";
import "./OpenPageNavigation.css";

const OpenPageNavigation = () => {
  const pages = useSelector((state) => state.pages);

  const openPages = pages.list.filter((page) => page.OPEN);

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
