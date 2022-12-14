import { forwardRef } from "react";
import PropTypes from "prop-types";
import "./ContextMenu.css";

const ContextMenu = forwardRef(
  ({ item, positionX, positionY, toggled, buttons }, ref) => {
    return (
      <menu
        style={{
          top: positionY + 2 + "px",
          left: positionX + 2 + "px",
        }}
        className={`context-menu ${toggled ? "active" : ""}`}
        ref={ref}
      >
        {buttons.filter(button => button.active).map((button, index) => {
          function handleClick(e) {
            e.stopPropagation()
            button.onClick(e, item);
          }

          if (button.isSpacer) return <hr></hr>

          return (
            <button onClick={handleClick} key={index} className='context-menu-button'>
              <span>{button.text}</span> <span>{button.icon}</span>
            </button>
          );
        })}
      </menu>
    );
  }
);

ContextMenu.propTypes = {
  positionX: PropTypes.number.isRequired,
  positionY: PropTypes.number.isRequired,
  toggled: PropTypes.bool.isRequired,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.string,
      onClick: PropTypes.func,
      active: PropTypes.bool,
      isSpacer: PropTypes.bool
    })
  ),
};

export default ContextMenu;
