import { ColorState } from "../../../types";
import "./Tag.css";

const Tag = ({ name, color }: { name: string; color: ColorState | null }) => {


  return (
    <div className="tag">
      <span
        className="color-span"
        style={{ backgroundColor: color ? color.color_code : '#000000' }}
        title={`Color: ${color ? color.color_code : 'There was an error, no color found'}`}
      >
        &nbsp;
      </span>
      <p title={name}>{name}</p>
    </div>
  );
};
export default Tag;
