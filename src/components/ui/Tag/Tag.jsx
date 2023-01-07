import "./Tag.css"

const Tag = ({ name, color }) => {
  return (
    <div className="tag">
      <span
        className="color-span"
        style={{ backgroundColor: color }}
        title={`Color: ${color}`}
      >
        &nbsp;
      </span>
      <p>{name}</p>
    </div>
  );
};
export default Tag;
