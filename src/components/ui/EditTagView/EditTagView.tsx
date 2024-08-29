import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNewTagFormToggled } from "../../../redux/sidebar";
import { deselectTag, editTag } from "../../../redux/tags";
import { ColorState } from "../../../types";
import { getApiUrl } from "../../../utils/getUrl";
import { isValidTagName } from "../../../utils/usefulFunctions";
import { RootState } from "../../../redux/store";

const EditTagView = ({
  setError,
}: {
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const dispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.tags);

  const currentTagColor =
    tags.colorOptions.find((colorOption) => colorOption.id === tags.selected?.color_id) ||
    null;

  const [updatedTagColor, setUpdatedTagColor] = useState<ColorState | null>(
    currentTagColor
  );
  const [updatedTagName, setUpdatedTagName] = useState<string>(tags.selected?.name || "");

  const currentTagName = tags.selected?.name;

  async function handleTagEdit(
    updatedTagName: string,
    updatedTagColor: ColorState | null,
    tagId: number | null
  ) {
    try {
      if (!updatedTagColor) throw "No color is selected";

      const payload = {
        name: updatedTagName,
        color_id: updatedTagColor.id,
        tag_id: tagId,
      };

      const response = await fetch(`${getApiUrl()}/tags/edit/`, {
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

      if (!data) throw "There was an issue parsing /tags/edit response";

      console.log(data.justModifiedTag);

      dispatch(editTag(data.justModifiedTag));
      dispatch(deselectTag());
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

  async function handleSubmit(e: FormEvent) {}

  function handleClose() {
    dispatch(setNewTagFormToggled(false));
    dispatch(deselectTag());
    setUpdatedTagColor(null);
    setUpdatedTagName("");
  }

  return (
    <div className="tag-form-container">
      <div className="cancel-and-done-btns">
        <button onClick={handleClose} title="Cancel / Discard Edit">
          Cancel
        </button>
        <button
          onClick={() =>
            handleTagEdit(updatedTagName, updatedTagColor, tags.selected?.id || null)
          }
          disabled={
            (updatedTagName === currentTagName &&
              updatedTagColor?.id === currentTagColor?.id) ||
            !isValidTagName(updatedTagName, false)
          }
          title="Done / Confirm Edit"
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
            autoComplete="off"
          />
          {!isValidTagName(updatedTagName, false) && (
            <p className="invalid-text">Invalid name</p>
          )}
        </div>

        <div className="tag-color">
          <label>Tag Color</label>
          <div className="tag-color-options">
            {tags.colorOptions?.map((colorOption: ColorState) => (
              <button
                key={colorOption.id}
                type="button"
                className={`color-button ${
                  colorOption.id === updatedTagColor?.id ? "selected" : ""
                } ${colorOption.id === currentTagColor?.id ? "current" : ""}`}
                onClick={() => setUpdatedTagColor(colorOption)}
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
export default EditTagView;
