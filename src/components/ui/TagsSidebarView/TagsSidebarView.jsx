import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteTag, deselectTag, editTag, selectTag } from "../../../redux/tags";
import ContextMenu from "../ContextMenu/ContextMenu";
import ColorIcon from "../Icons/ColorIcon";
import TrashIcon from "../Icons/TrashIcon";
import DownArrow from "../Icons/DownArrow";
import "./TagsSidebarView.css";

const TagsSidebarView = () => {
  const tags = useSelector((state) => state.tags);
  const dispatch = useDispatch();
  const [tagSearchValue, setTagSearchValue] = useState("");
  const [newTagColor, setNewTagColor] = useState(tags.selected?.COLOR || "");
  const [newTagName, setNewTagName] = useState(tags.selected?.NAME || "");

  function handleTagClick(e, tag) {
    dispatch(selectTag(tag));
    setNewTagName(tag.NAME);
    setNewTagColor(tag.COLOR);
  }

  function handleColorChange(e) {
    setNewTagColor(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  function isColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== "";
  }

  function isValidTagName(strName) {
    return strName !== "";
  }

  async function handleTagEdit(e, newName, newColor, tagId) {
    try {
      const payload = {
        name: newTagName,
        color: newTagColor,
        id: tagId,
      };

      const response = await fetch("http://localhost:3001/tags/edit", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log(data);

      dispatch(editTag(payload));
      dispatch(deselectTag());
    } catch (err) {
      console.log(err);
    }
  }

  async function handleTagDelete(e, tagId) {
    try {
      const payload = {
        id: tagId,
      };

      const response = await fetch("http://localhost:3001/tags/delete", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log(data);

      dispatch(deleteTag(payload));
      dispatch(deselectTag());
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="tags-sidebar-view">
      {tags.selected === null && (
        <>
          <form className="tag-search-form">
            <input
              value={tagSearchValue}
              onChange={(e) => setTagSearchValue(e.target.value)}
              placeholder="Search for a tag"
            />
          </form>
          {tags.list
            ?.filter((tag) => tag.NAME.includes(tagSearchValue))
            .map((tag, i) => {
              return (
                <button
                  onClick={(e) => handleTagClick(e, tag)}
                  className={`tag-button ${tag.SELECTED ? "selected" : ""}`}
                  key={i}
                >
                  <span className="color-span" style={{ backgroundColor: tag.COLOR }}>
                    &nbsp;
                  </span>
                  <p>{tag.NAME}</p>
                </button>
              );
            })}
        </>
      )}
      {tags.selected && (
        <div className="edit-tag-section">
          <div className="cancel-and-done-btns">
            <button onClick={() => dispatch(deselectTag())}>Cancel</button>
            <button
              onClick={(e) => handleTagEdit(e, newTagName, newTagColor, tags.selected.ID)}
            >
              Done
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="tag-name">
              <label>Tag Name</label>
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className={isValidTagName(newTagName) ? "" : "invalid"}
              />
              {!isValidTagName(newTagName) && (
                <p className="invalid-text">Invalid name</p>
              )}
            </div>
            <div className="tag-color">
              <label>Tag Color</label>
              <div className="inputs">
                <input
                  type="text"
                  onChange={handleColorChange}
                  value={newTagColor}
                  className={isColor(newTagColor) ? "" : "invalid"}
                />
                <input
                  type="color"
                  onChange={handleColorChange}
                  value={newTagColor}
                  onClick={(e) => e.stopPropagation()}
                />
                <ColorIcon
                  fill={isColor(newTagColor) ? newTagColor : tags.selected.COLOR}
                />
              </div>
              {!isColor(newTagColor) && <p className="invalid-text">Invalid color</p>}
            </div>
          </form>
          <div className="tag">
            <span className="color-span" style={{ backgroundColor: tags.selected.COLOR }}>
              &nbsp;
            </span>
            <p>{tags.selected.NAME}</p>
          </div>

          <DownArrow />
          {newTagName !== tags.selected.NAME || newTagColor !== tags.selected.COLOR ? (
            <div className="tag">
              <span
                className="color-span"
                style={{
                  backgroundColor: isColor(newTagColor)
                    ? newTagColor
                    : tags.selected.COLOR,
                }}
              >
                &nbsp;
              </span>
              <p>{newTagName ? newTagName : "-"}</p>
            </div>
          ) : (
            <p className="no-changes">No changes made yet</p>
          )}
        </div>
      )}
      {tags.selected && <div className="tag-controls">
        <button className="trash-button" title="Delete Tag" onClick={(e) => handleTagDelete(e, tags.selected.ID)}>
          <TrashIcon />
        </button>
      </div>}
    </div>
  );
};

export default TagsSidebarView;
