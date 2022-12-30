import React, { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import Overlay from "../Overlay/Overlay";
import ColorIcon from "../Icons/ColorIcon";
import "./TagsModal.css";

const TagsModal = () => {
  const tagsModalRef = useRef(null);
  const pages = useSelector((state) => state.pages);
  const folders = useSelector((state) => state.folders);
  const tags = useSelector((state) => state.tags);

  const dispatch = useDispatch();

  const [tagSearchValue, setTagSearchValue] = useState("");
  const [tagColor, setTagColor] = useState("green");

  const selectedItem = pages.selected || folders.selected;

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
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

  function handleColorChange(e) {
    setTagColor(e.target.value);
  }

  async function handleTagClick(e, tag) {
    console.log(tag);
  }

  return (
    <>
      <div className="tags-modal" ref={tagsModalRef}>
        <p className="heading">
          Add tag(s) to {selectedItem.IS_PAGE ? "page" : "folder"} '{selectedItem.NAME}'.
        </p>
        <form onSubmit={handleTagInputSubmit}>
          <input
            value={tagSearchValue}
            onChange={(e) => setTagSearchValue(e.target.value)}
            placeholder="Type to search or add a category"
          />
          <button className="custom-color-button">
            <ColorIcon fill={tagColor} />
            <input type="color" onChange={handleColorChange} value={tagColor} />
          </button>
        </form>
        {tagSearchValue && !tags.list.find((tag) => tag.NAME === tagSearchValue) && (
          <button className="tag-button" nClick={handleTagClick}>
            <span className="color-span" style={{ backgroundColor: "blue" }}>
              &nbsp;
            </span>
            {tagSearchValue}
          </button>
        )}
        {tags
          .list
          ?.filter((tag) => tag.NAME.includes(tagSearchValue))
          .map((tag, index) => (
            <button
              className="tag-button"
              onClick={(e) => handleTagClick(e, tag, selectedItem)}
              key={index}
            >
              {" "}
              <span className="color-span" style={{ backgroundColor: tag.COLOR }}>
                &nbsp;
              </span>{" "}
              {tag.NAME}
            </button>
          ))}
      </div>
      <Overlay />
    </>
  );
};

export default TagsModal;
