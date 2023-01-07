import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteTag, deselectTag, editTag, selectTag, addTag } from "../../../redux/tags";
import ColorIcon from "../Icons/ColorIcon";
import TrashIcon from "../Icons/TrashIcon";
import DownArrow from "../Icons/DownArrow";
import "./TagsSidebarView.css";
import { setNewTagFormToggled } from "../../../redux/sidebar";
import ColorPicker from "../ColorPicker/ColorPicker";
import Tag from "../Tag/Tag";

const TagsSidebarView = () => {
  const tags = useSelector((state) => state.tags);
  const sidebar = useSelector((state) => state.sidebar);
  const colorPickerMenu = useSelector((state) => state.colorPickerMenu);
  const colorPickerMenuRef = useRef(null);
  const dispatch = useDispatch();
  const [tagSearchValue, setTagSearchValue] = useState("");
  const [newTagColor, setNewTagColor] = useState("#008080");
  const [newTagName, setNewTagName] = useState("");
  const [updatedTagColor, setUpdatedTagColor] = useState(tags.selected?.COLOR || "");
  const [updatedTagName, setUpdatedTagName] = useState(tags.selected?.NAME || "");
  const [deleteWarningToggled, setDeleteWarningToggled] = useState(false);

  function handleTagClick(e, tag) {
    dispatch(selectTag(tag));
    setUpdatedTagName(tag.NAME);
    setUpdatedTagColor(tag.COLOR);
  }

  function handleUpdatedColorChange(colorCode) {
    setUpdatedTagColor(colorCode);
  }

  function handleNewColorChange(colorCode) {
    setNewTagColor(colorCode);
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  function isValidColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== "";
  }

  function isValidTagName(strName, canBeEmpty) {
    if (canBeEmpty) return true;
    return strName !== "";
  }

  async function handleTagEdit(e, updatedTagName, updatedTagColor, tagId) {
    try {
      const payload = {
        name: updatedTagName,
        color: updatedTagColor,
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

  async function handleNewTag(e, newTagName, newTagColor, tagId) {
    try {
      const payload = {
        name: newTagName,
        color: newTagColor,
        id: tagId,
      };

      const response = await fetch("http://localhost:3001/tags/new", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      const justCreatedTag = data.justCreatedTag;

      dispatch(addTag(justCreatedTag));
      dispatch(deselectTag());
      setNewTagColor("#008080");
      setNewTagName("");
      dispatch(setNewTagFormToggled(false));
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
      setDeleteWarningToggled(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="tags-sidebar-view">
      {tags.selected === null && !sidebar.newTagFormToggled && (
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
                  <span
                    className="color-span"
                    style={{ backgroundColor: tag.COLOR }}
                    title={`Color: ${tag.COLOR}`}
                  >
                    &nbsp;
                  </span>
                  <p>{tag.NAME}</p>
                </button>
              );
            })}
        </>
      )}
      {sidebar.newTagFormToggled && (
        <div className="tag-form-container">
          <div className="cancel-and-done-btns">
            <button
              onClick={() => {
                dispatch(setNewTagFormToggled(false));
              }}
            >
              Cancel
            </button>
            <button
              onClick={(e) => handleNewTag(e, newTagName, newTagColor)}
              disabled={!isValidTagName(newTagName, false) || !isValidColor(newTagColor)}
            >
              Done
            </button>
          </div>
          <form className="tag-form" onSubmit={handleSubmit}>
            <p className="new-tag-header">Create a tag</p>
            <div className="tag-name">
              <label>Tag Name</label>
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className={isValidTagName(newTagName, true) ? "" : "invalid"}
              />
              {!isValidTagName(newTagName, true) && (
                <p className="invalid-text">Invalid name</p>
              )}
            </div>
            <div className="tag-color">
              <label>Tag Color</label>
              <div className="inputs">
                <ColorPicker
                  onColorSelect={handleNewColorChange}
                  selectedColor={newTagColor}
                />
              </div>
              {!isValidColor(newTagColor) && (
                <p className="invalid-text">Invalid color</p>
              )}
            </div>
          </form>
          <Tag name={newTagName ? newTagName : '-'} color={newTagColor} />

        </div>
      )}
      {tags.selected && (
        <div className="tag-form-container">
          <div className="cancel-and-done-btns">
            <button
              onClick={() => {
                setDeleteWarningToggled(false);
                dispatch(setNewTagFormToggled(false));
                dispatch(deselectTag());
              }}
            >
              Cancel
            </button>
            <button
              onClick={(e) =>
                handleTagEdit(e, updatedTagName, updatedTagColor, tags.selected.ID)
              }
              disabled={
                !isValidTagName(updatedTagName, false) || !isValidColor(updatedTagColor)
              }
            >
              Done
            </button>
          </div>
          <form onSubmit={handleSubmit} className="tag-form">
            <p className="new-tag-header">Edit tag</p>
            <div className="tag-name">
              <label>Tag Name</label>
              <input
                value={updatedTagName}
                onChange={(e) => setUpdatedTagName(e.target.value)}
                className={isValidTagName(updatedTagName, false) ? "" : "invalid"}
              />
              {!isValidTagName(updatedTagName, false) && (
                <p className="invalid-text">Invalid name</p>
              )}
            </div>
            <div className="tag-color">
              <label>Tag Color</label>
              <div className="inputs">
                <ColorPicker
                  onColorSelect={handleUpdatedColorChange}
                  selectedColor={updatedTagColor}
                />
              </div>
              {!isValidColor(updatedTagColor) && (
                <p className="invalid-text">Invalid color</p>
              )}
            </div>
          </form>
          <Tag name={tags.selected.NAME} color={tags.selected.COLOR} />

          <DownArrow />
          {updatedTagName !== tags.selected.NAME ||
          updatedTagColor !== tags.selected.COLOR ? (
            <Tag
              name={updatedTagName ? updatedTagName : "-"}
              color={
                isValidColor(updatedTagColor) ? updatedTagColor : tags.selected.COLOR
              }
            />
          ) : (
            <p className="no-changes">No changes made yet</p>
          )}
        </div>
      )}

      {tags.selected && (
        <div className="tag-controls">
          {!deleteWarningToggled && (
            <button
              className="trash-button"
              title="Delete Tag"
              onClick={() => setDeleteWarningToggled(true)}
            >
              <TrashIcon />
            </button>
          )}
          {deleteWarningToggled && (
            <div className="are-you-sure-container">
              <p>Are you sure?</p>
              <button
                onClick={(e) => handleTagDelete(e, tags.selected.ID)}
                className="confirm"
              >
                Yes
              </button>
              <button onClick={(e) => setDeleteWarningToggled(false)} className="cancel">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagsSidebarView;