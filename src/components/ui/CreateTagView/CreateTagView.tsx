import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNewTagFormToggled } from "../../../redux/sidebar";
import { addTag, deselectTag } from "../../../redux/tags";
import { ColorState } from "../../../types";
import { getApiUrl } from "../../../utils/getUrl";
import { isValidColor, isValidTagName } from "../../../utils/usefulFunctions";
import { RootState } from "../../../redux/store";

const CreateTagView = ({
  setError,
}: {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const dispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.tags);

  const [newTagColor, setNewTagColor] = useState<ColorState | null>(null);
  const [newTagName, setNewTagName] = useState<string>("");

  async function handleNewTag(
    newTagName: string,
    newColor: ColorState | null,
    tagId?: number
  ) {
    try {
      const payload = {
        name: newTagName,
        color: newColor,
        id: tagId,
      };

      const response = await fetch(`${getApiUrl()}/tags/new/`, {
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

      if (!data) throw "There was an issue parsing /tags/new response";

      const justCreatedTag = data.justCreatedTag;

      console.log(justCreatedTag);

      dispatch(addTag(justCreatedTag));
      dispatch(deselectTag());
      setNewTagColor(null);
      setNewTagName("");
      dispatch(setNewTagFormToggled(false));
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
        setError(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
        setError(e.message);
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
  }

  return (
    <div className="tag-form-container">
      <div className="cancel-and-done-btns">
        <button
          onClick={() => {
            dispatch(setNewTagFormToggled(false));
            setNewTagColor(null);
            setNewTagName("");
          }}
          title="Cancel / Discard New Tag"
        >
          Cancel
        </button>
        <button
          onClick={(e) => handleNewTag(newTagName, newTagColor)}
          disabled={
            !isValidTagName(newTagName, false) || !isValidColor(newTagColor?.color_code)
          }
          title="Done / Confirm New Tag"
        >
          Done
        </button>
      </div>
      <form className="tag-form" onSubmit={handleSubmit}>
        <p className="new-tag-header">Create a tag</p>
        <div className="tag-name">
          <label>Tag Name</label>
          <input
            placeholder='"Expenses", "High Priority", etc.'
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className={isValidTagName(newTagName, true) ? "" : "invalid"}
            autoComplete="off"
          />
          {!isValidTagName(newTagName, true) && (
            <p className="invalid-text">Invalid name</p>
          )}
        </div>
        <div className="tag-color">
          <label>Tag Color</label>
          <div className="tag-color-options">
            {tags.colorOptions?.map((colorOption: ColorState) => (
              <button
                type="button"
                className={`color-button ${
                  colorOption.id === newTagColor?.id ? "selected" : ""
                }`}
                onClick={() => setNewTagColor(colorOption)}
              >
                <span
                  className="color-span"
                  style={{
                    backgroundColor: colorOption.color_code,
                  }}
                >
                  &nbsp;
                </span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
export default CreateTagView;
