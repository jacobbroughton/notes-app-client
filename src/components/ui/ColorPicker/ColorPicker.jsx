import { useDispatch, useSelector } from "react-redux";
import "./ColorPicker.css";
import { setColorPickerMenu } from "../../../redux/colorPickerMenu";
import ColorIcon from "../Icons/ColorIcon";
import { useEffect, useRef } from "react";

const ColorPicker = () => {
  const dispatch = useDispatch();
  const colorPickerMenu = useSelector((state) => state.colorPickerMenu);
  const { colorOptions } = useSelector((state) => state.tags);
  const menuRef = useRef(null);

  function isValidColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== "";
  }

  function handleToggleClick(e) {
    dispatch(setColorPickerMenu({ toggled: !colorPickerMenu.toggled }));
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
            fill="teal"
          />
        </button>
        {colorPickerMenu.toggled && (
          <menu ref={menuRef}>
            <div className="color-options-container">
              <p>Default Options</p>
              <div className="buttons">
                {colorOptions.default?.map((color) => {
                  console.log(color)
                  return (
                    <button
                      className="color-option-button"
                      title={color.COLOR_CODE}
                      style={{ backgroundColor: color.COLOR_CODE }}
                    >
                      &nbsp;
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="color-options-container">
              <p>User Created Options</p>
              <div className="buttons">
                {colorOptions.userCreated?.map((color) => {
                  console.log(color)
                  return (
                    <button
                      className="color-option-button"
                      title={color.COLOR_CODE}
                      style={{ backgroundColor: color.COLOR_CODE }}
                    >
                      &nbsp;
                    </button>
                  );
                })}
              </div>
            </div>
          </menu>
        )}
      </div>
    </div>
  );
};
export default ColorPicker;
