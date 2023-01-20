import React, { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { addTagToPage, removeTagFromPage } from "../../../redux/pages";
import { addTagToFolder, removeTagFromFolder } from "../../../redux/folders";
import Overlay from "../Overlay/Overlay";
import ColorIcon from "../Icons/ColorIcon";
import "./TagsModal.css";
import ColorPicker from "../ColorPicker/ColorPicker";

const TagsModal = () => {
  const tagsModalRef = useRef(null);
  const pages = useSelector((state) => state.pages);
  const folders = useSelector((state) => state.folders);
  const tags = useSelector((state) => state.tags);

  const dispatch = useDispatch();

  const [tagSearchValue, setTagSearchValue] = useState("");
  const [tagColor, setTagColor] = useState(null);

  const selectedItem = pages.selected || folders.selected;
  // const selectedItem = pages.list.find(page => page.SELECTED) || folders.list.find(page => page.SELECTED)

  useEffect(() => {
    function handler(e) {
      if (!tagsModalRef.current.contains(e.target)) {
        dispatch(toggleModal("tagsModal"));
      }
    }

    window.addEventListener("click", handler);

    return () => window.removeEventListener("click", handler);
  });

  async function handleTagInputSubmit(e) {
    e.preventDefault();

    if (tagSearchValue === "") return;

    try {
      const response = await fetch("http://localhost:3001/tags/new", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          name: tagSearchValue.trim(),
          color: tagColor,
          isForItem: true, // TODO - Change this once i can add tags without being on a page/folder
          item: selectedItem,
        }),
      });

      if (response.status !== 200) throwResponseStatusError(response, "POST");

      const data = await response.json();

      if (!data) throw "There was an issue parsing /tags/new response";

      setTagSearchValue("");
    } catch (error) {
      console.log(error);
    }
  }

  function handleColorChange(color) {
    setTagColor(color);
  }

  async function handleTagClick(e, item, tag) {
    try {
      const response = await fetch("http://localhost:3001/tags/tag-item", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          tag,
          item,
          toggleState: item.TAGS.includes(tag.ID) ? 0 : 1,
        }),
      });

      if (response.status !== 200) throwResponseStatusError(response, "POST");

      const data = await response.json();

      if (!data) throw "There was an issue parsing /tags/tag-item response";

      if (item.IS_PAGE) {
        if (item.TAGS.includes(tag.ID)) {
          dispatch(removeTagFromPage({ item, tag }));
        } else {
          dispatch(addTagToPage({ item, tag }));
        }
      } else {

        let allChildPages = [];

        function getChildren(folderIdToCheck) {
          const childPages = pages.list.filter(
            (page) => page.FOLDER_ID === folderIdToCheck
          );

          allChildPages.push(...childPages);

          const childrenFolders = folders.list
            .filter((folder) => folder.PARENT_FOLDER_ID === folderIdToCheck)
            .map((folder) => folder.ID);

          if (childrenFolders.length === 0) return;

          childrenFolders.forEach((folderId) => getChildren(folderId));
        }

        getChildren(item.ID);


        if (item.TAGS.includes(tag.ID)) {
          dispatch(removeTagFromFolder({ item, tag }));

          console.log(allChildPages)
          if (allChildPages.length > 0) {
            allChildPages.forEach((page) => {
              dispatch(removeTagFromPage({ item: page, tag }));
            });
          }
        } else {
          dispatch(addTagToFolder({ item, tag }));

          if (allChildPages.length > 0) {
            allChildPages.forEach((page) => {
              dispatch(addTagToPage({ item: page, tag }));
            });
          }
          // TODO - Look for child pages and add tags to them too (on front end)
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (!selectedItem) return "No selected item found";

  return (
    <>
      <div className="tags-modal" ref={tagsModalRef}>
        <p className="heading">
          Add tag(s) to {selectedItem.IS_PAGE && "page"} '{selectedItem.NAME}'
          {!selectedItem.IS_PAGE && " and it's contents"}.
        </p>
        <form onSubmit={handleTagInputSubmit}>
          <input
            value={tagSearchValue}
            onChange={(e) => setTagSearchValue(e.target.value)}
            placeholder="Type to search or add a tag"
          />
          {/* <button className="custom-color-button">
            <ColorIcon fill={tagColor} />
            <input type="color" onChange={handleColorChange} value={tagColor} />
          </button> */}
          <ColorPicker
            onColorSelect={handleColorChange}
            selectedColor={tagColor}
            showColorCode={false}
          />
        </form>
        {tagSearchValue && !tags.list.find((tag) => tag.NAME === tagSearchValue) && (
          <button className="tag-button" onClick={(e) => console.log("new tag input")}>
            <span className="color-span" style={{ backgroundColor: tagColor }}>
              &nbsp;
            </span>
            {tagSearchValue}
          </button>
        )}
        {/* {tags.list
          .filter((tag) => selectedItem.TAGS.includes(tag.ID))
          .map((tag, index) => (
            <button
              className={`tag-button ${
                selectedItem?.TAGS.includes(tag.ID) ? "added" : ""
              }`}
              onClick={(e) => handleTagClick(e, selectedItem, tag)}
              key={index}
            >
              {" "}
              <span className="color-span" style={{ backgroundColor: tag.COLOR_CODE }}>
                &nbsp;
              </span>{" "}
              <p>{tag.NAME}</p>
            </button> */}

        {tags.list
          ?.filter((tag) => tag.NAME.includes(tagSearchValue))
          .map((tag, index) => {
            return (
              <button
                className={`tag-button ${
                  selectedItem?.TAGS?.includes(tag.ID) ? "added" : ""
                }`}
                onClick={(e) => handleTagClick(e, selectedItem, tag)}
                key={index}
              >
                {" "}
                <span className="color-span" style={{ backgroundColor: tag.COLOR_CODE }}>
                  &nbsp;
                </span>{" "}
                <p>{tag.NAME}</p>
              </button>
            );
          })}
      </div>
      <Overlay />
    </>
  );
};

export default TagsModal;
