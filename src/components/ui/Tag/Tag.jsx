import "./Tag.css";

const Tag = ({ name, color }) => {
  return (
    <div className="tag">
      <span
        className="color-span"
        style={{ backgroundColor: color.COLOR_CODE }}
        title={`Color: ${color.COLOR_CODE}`}
      >
        &nbsp;
      </span>
      <p title={name}>{name}</p>
    </div>
  );
};
export default Tag;
