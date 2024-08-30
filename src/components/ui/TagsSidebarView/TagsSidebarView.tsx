import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNewTagFormToggled } from "../../../redux/sidebar";
import { RootState } from "../../../redux/store";
import {
  deleteTag,
  deselectTag,
  selectTag,
} from "../../../redux/tags";
import { getApiUrl } from "../../../utils/getUrl";
import CreateTagView from "../CreateTagView/CreateTagView";
import EditTagView from "../EditTagView/EditTagView";
import TrashIcon from "../Icons/TrashIcon";
import "./TagsSidebarView.css";

const TagsSidebarView = () => {
  const dispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.tags);
  const sidebar = useSelector((state: RootState) => state.sidebar);
  const [tagSearchValue, setTagSearchValue] = useState<string>("");
  const [deleteWarningToggled, setDeleteWarningToggled] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  async function handleTagDelete(tagId: number) {
    try {
      const payload = {
        id: tagId,
      };

      const response = await fetch(`${getApiUrl()}/tags/delete/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        body: JSON.stringify(payload),
      });

      if (response.status !== 200) throw response.statusText;

      const data = await response.json();

      if (!data) throw "There was an issue parsing /tags/delete response";


      dispatch(deleteTag(payload));
      // Remove tag from items
      dispatch(deselectTag());
      setDeleteWarningToggled(false);
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  useEffect(() => {
    return () => {
      dispatch(setNewTagFormToggled(false));
      dispatch(deselectTag());
    };
  }, []);

  return (
    <div className="tags-sidebar-view">
      {error && <p className="error-text">{error.toString()}</p>}
      {tags.selected === null && !sidebar.newTagFormToggled && (
        <>
          <form className="tag-search-form">
            <input
              value={tagSearchValue}
              onChange={(e) => setTagSearchValue(e.target.value)}
              placeholder="Search for a tag"
              autoComplete="off"
            />
          </form>
          {tags.list.length === 0 && <p className="no-tags-found">No tags found...</p>}
          {tags.list
            ?.filter((tag) =>
              tag.name.toLowerCase().includes(tagSearchValue.toLowerCase())
            )
            .map((tag, i) => {
              return (
                <button
                  onClick={() => dispatch(selectTag(tag))}
                  className={`tag-button ${tag.selected ? "selected" : ""}`}
                  key={i}
                  title={`Tag: ${tag.name}`}
                >
                  <span
                    className="color-span"
                    style={{ backgroundColor: tag.color_code }}
                    title={`Color: ${tag.color_code}`}
                  >
                    &nbsp;
                  </span>
                  <p>{tag.name}</p>
                </button>
              );
            })}
        </>
      )}
      {sidebar.newTagFormToggled && <CreateTagView setError={setError} />}
      {tags.selected && <EditTagView setError={setError} />}

      {tags.selected && (
        <div className="tag-controls">
          {!deleteWarningToggled && (
            <button
              className="trash-button"
              title="Delete Tag"
              onClick={() => setDeleteWarningToggled(true)}
            >
              <TrashIcon />
              Delete Tag
            </button>
          )}
          {deleteWarningToggled && (
            <div className="are-you-sure-container">
              <p>Are you sure?</p>
              <div className="buttons">
                <button
                  onClick={() => handleTagDelete(tags.selected!.id)}
                  className="confirm"
                >
                  Yes, delete
                </button>
                <button
                  onClick={(e) => setDeleteWarningToggled(false)}
                  className="cancel"
                >
                  No, cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagsSidebarView;
