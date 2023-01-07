import { useDispatch, useSelector } from "react-redux";
import "./ColorPicker.css";
import { setColorPickerMenu } from "../../../redux/colorPickerMenu";
import ColorIcon from "../Icons/ColorIcon";
import CheckIcon from "../Icons/CheckIcon";
import XIcon from "../Icons/XIcon";
import { useEffect, useRef, useState } from "react";
import { addCustomColorOption } from "../../../redux/tags";

const ColorPicker = ({ onColorSelect, selectedColor }) => {
  const dispatch = useDispatch();
  const colorPickerMenu = useSelector((state) => state.colorPickerMenu);
  const { colorOptions } = useSelector((state) => state.tags);
  const [colorConfirmationShowing, setColorConfirmationShowing] = useState(false);
  const [newCustomColor, setNewCustomColor] = useState("#008080");
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
    console.log(e.target.value);
    setNewCustomColor(e.target.value);
    setColorConfirmationShowing(true);
  }

  async function handleNewCustomColorConfirm(e) {
    e.stopPropagation();
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
      const data = await response.json();

      dispatch(addCustomColorOption(data.justCreatedColor));
      setNewCustomColor("#008080");
      setColorConfirmationShowing(false);

      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

  function handleNewCustomColorCancel(e) {
    e.stopPropagation();
    setNewCustomColor("#008080");
    setColorConfirmationShowing(false);
  }

  useEffect(() => {
    function handler(e) {
      if (
        !menuRef.current?.contains(e.target) &&
        !e.target.classList.contains("color-picker-toggle")
      ) {
        dispatch(setColorPickerMenu({ toggled: false }));
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
        <button onClick={handleToggleClick} className="color-picker-toggle">
          <ColorIcon
            // fill={isValidColor(updatedTagColor) ? updatedTagColor : tags.selected.COLOR}
            fill={selectedColor}
          />
        </button>
        <p className='color-text'>{selectedColor}</p>
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
                      onClick={() => onColorSelect(color.COLOR_CODE)}
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
                {colorOptions.userCreated?.map((color, index) => {
                  return (
                    <button
                      className="color-button"
                      title={color.COLOR_CODE}
                      style={{ backgroundColor: color.COLOR_CODE }}
                      key={index}
                      onClick={() => onColorSelect(color.COLOR_CODE)}
                    >
                      &nbsp;
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="custom-color-button-container">
              <p>Add a New Color</p>
              <div className="custom-color-options">
                <input
                  type="color"
                  onChange={handleNewColorChange}
                  style={{ ...(colorConfirmationShowing && { marginLeft: "10px" }) }}
                  // value={updatedTagColor}
                  onClick={(e) => e.stopPropagation()}
                />
                {/* {colorConfirmationShowing && <div className="spacer">&nbsp;</div>} */}
                <div className="color-option-new" onClick={(e) => e.preventDefault()}>
                  +
                </div>
                {colorConfirmationShowing && (
                  <>
                    <button
                      className="color-button"
                      title={newCustomColor}
                      style={{ backgroundColor: newCustomColor }}
                    >
                      &nbsp;
                    </button>
                    <button className="confirm-btn" onClick={handleNewCustomColorConfirm}>
                      <CheckIcon />
                    </button>
                    <button className="cancel-btn" onClick={handleNewCustomColorCancel}>
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
