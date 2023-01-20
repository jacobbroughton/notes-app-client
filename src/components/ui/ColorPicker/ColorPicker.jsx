import { useDispatch, useSelector } from "react-redux";
import "./ColorPicker.css";
import { setColorPickerMenu } from "../../../redux/colorPickerMenu";
import ColorIcon from "../Icons/ColorIcon";
import CheckIcon from "../Icons/CheckIcon";
import XIcon from "../Icons/XIcon";
import { useEffect, useRef, useState } from "react";
import { addCustomColorOption } from "../../../redux/tags";
import { throwResponseStatusError } from "../../../utils/throwResponseStatusError";

const ColorPicker = ({ onColorSelect, selectedColor, showColorCode }) => {
  const dispatch = useDispatch();
  const colorPickerMenu = useSelector((state) => state.colorPickerMenu);
  const { colorOptions } = useSelector((state) => state.tags);
  const [colorConfirmationShowing, setColorConfirmationShowing] = useState(false);
  const [newCustomColor, setNewCustomColor] = useState(null);
  const [deleteModeToggled, setDeleteModeToggled] = useState(false);
  const [colorToDelete, setColorToDelete] = useState(null);
  const menuRef = useRef(null);

  function isValidColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== "";
  }

  function handleToggleClick(e) {
    dispatch(setColorPickerMenu({ toggled: !colorPickerMenu.toggled }));
  }

  function handleNewColorChange(e) {
    setNewCustomColor(e.target.value);
    setColorConfirmationShowing(true);
  }

  async function addNewCustomColor(e) {
    try {
      const payload = {
        colorCode: newCustomColor,
      };

      const response = await fetch("http://localhost:3001/tags/color-options/new", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(payload),
      });

      if (response.status !== 200) throwResponseStatusError(response, "POST");

      const data = await response.json();

      dispatch(addCustomColorOption(data.justCreatedColor));
      setNewCustomColor(null);
      setColorConfirmationShowing(false);

    } catch (error) {
      console.log(error);
    }
  }

  async function deleteCustomColor(color) {
    try {
      const payload = {
        colorId: color.ID,
      };

      const response = await fetch("http://localhost:3001/tags/color-options/delete", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(payload),
      });

      if (response.status !== 200) throwResponseStatusError(response, "POST");

      const data = await response.json();

      if (!data) throw 'There was a problem parsing tags/color-options/delete response'

      setColorToDelete(null);
      setDeleteModeToggled(false);
    } catch (error) {
      console.log(error);
    }
  }

  function handleDeleteClick(e) {
    setDeleteModeToggled(!deleteModeToggled);
  }

  function handleColorClick(color) {
    if (deleteModeToggled) {
      setColorToDelete(color);
    } else {
      onColorSelect(color);
    }
  }

  function handleConfirmClick(e) {
    e.stopPropagation();
    if (colorConfirmationShowing) {
      addNewCustomColor();
    }

    if (colorToDelete) {
      deleteCustomColor(colorToDelete);
    }
  }

  function handleCancelClick(e) {
    e.stopPropagation();
    if (colorConfirmationShowing) {
      setNewCustomColor(null);
      setColorConfirmationShowing(false);
    }

    if (colorToDelete) {
      setColorToDelete(null);
      setDeleteModeToggled(false);
    }
  }

  useEffect(() => {
    function handler(e) {
      if (
        !menuRef.current?.contains(e.target) &&
        !e.target.classList.contains("color-picker-toggle")
      ) {
        setNewCustomColor(null);
        setColorConfirmationShowing(false);
        dispatch(setColorPickerMenu({ toggled: false }));
        if (deleteModeToggled) setDeleteModeToggled(false);
        if (colorToDelete) setColorToDelete(null);
      }

      if (
        deleteModeToggled &&
        !e.target.classList.contains("color-button") &&
        !e.target.classList.contains("delete")
      ) {
        setColorToDelete(null);
        setDeleteModeToggled(false);
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });

  return (
    <div className="color-picker-parent">
      <div className="ignore-overflow">
        <button
          onClick={handleToggleClick}
          className={`color-picker-toggle ${!selectedColor ? "no-color" : ""}`}
          title="Open Color Picker"
          style={{ ...(selectedColor && { backgroundColor: selectedColor.COLOR_CODE }) }}
        >
          {/* <ColorIcon
            // fill={isValidColor(updatedTagColor) ? updatedTagColor : tags.selected.COLOR_CODE}
            fill={selectedColor}
          /> */}
          &nbsp;
        </button>
        {showColorCode && (
          <p className="color-text">
            {selectedColor ? selectedColor.COLOR_CODE : "No Color Selected"}
          </p>
        )}
        {colorPickerMenu.toggled && (
          <menu ref={menuRef}>
            <div className="color-options-container">
              <p>Default Colors</p>
              <div className="buttons">
                {colorOptions.default?.map((color, index) => {
                  return (
                    <button
                      className="color-button"
                      title={color.COLOR_CODE}
                      style={{ backgroundColor: color.COLOR_CODE }}
                      key={index}
                      onClick={() => handleColorClick(color)}
                      disabled={deleteModeToggled}
                    >
                      &nbsp;
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="color-options-container">
              <p>Your Custom Colors</p>
              <div className="buttons">
                {colorOptions.userCreated.length === 0 && <p>(None found)</p>}
                {colorOptions.userCreated?.map((color, index) => {
                  return (
                    <button
                      className="color-button"
                      title={color.COLOR_CODE}
                      style={{ backgroundColor: color.COLOR_CODE }}
                      key={index}
                      onClick={() => handleColorClick(color)}
                    >
                      &nbsp;
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="custom-color-button-container">
              <p>Add or Remove Colors</p>
              <div className="custom-color-options">
                <input
                  type="color"
                  onChange={handleNewColorChange}
                  // style={{ ...(colorConfirmationShowing && { marginLeft: "10px" }) }}
                  // value={updatedTagColor}
                  onClick={(e) => e.stopPropagation()}
                />
                {/* {colorConfirmationShowing && <div className="spacer">&nbsp;</div>} */}
                <div
                  className="color-option add"
                  onClick={(e) => e.preventDefault()}
                  disabled={deleteModeToggled}
                >
                  +
                </div>
                <div
                  className="color-option delete"
                  onClick={handleDeleteClick}
                  disabled={colorConfirmationShowing}
                >
                  -
                </div>
                {deleteModeToggled && !colorToDelete && (
                  <span className="delete-instructions">(Choose a color)</span>
                )}
                {deleteModeToggled && colorToDelete && (
                  <div
                    className="new-color-example"
                    title={colorToDelete.COLOR_CODE}
                    style={{ backgroundColor: colorToDelete.COLOR_CODE }}
                  >
                    &nbsp;
                  </div>
                )}

                {colorConfirmationShowing && (
                  <div
                    className="new-color-example"
                    title={newCustomColor}
                    style={{ backgroundColor: newCustomColor }}
                  >
                    &nbsp;
                  </div>
                )}

                {(colorConfirmationShowing || colorToDelete) && (
                  <>
                    <button className="confirm-btn" onClick={handleConfirmClick}>
                      <CheckIcon />
                    </button>
                    <button className="cancel-btn" onClick={handleCancelClick}>
                      <XIcon />
                    </button>
                  </>
                )}
              </div>
            </div>
          </menu>
        )}
      </div>
    </div>
  );
};
export default ColorPicker;
