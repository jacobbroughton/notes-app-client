import { useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND } from "lexical";

type formatType = "bold" | "strikethrough" | "italic" | "underline";

export function TextFormatToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [dropdownToggled, setDropdownToggled] = useState(false);

  const formatTypeTags: formatType[] = ["bold", "strikethrough", "italic", "underline"];
  const onClick = (e: MouseEvent, type: formatType) => {
    e.preventDefault();
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
    setDropdownToggled(!dropdownToggled);
  };

  // <UnderlineIcon />
  // <BoldIcon/>
  // <StrikeThroughIcon />
  // <UnderlineIcon />

  return (
    <div className="toolbar-dropdown">
      <button
        className="dropdown-toggle"
        onClick={(e) => {
          e.preventDefault();
          setDropdownToggled(!dropdownToggled);
        }}
      >
        Text Format
      </button>
      {dropdownToggled && (
        <div className="dropdown-options">
          {formatTypeTags.map((tag, i) => (
            <button onClick={(e) => onClick(e, tag)} key={i}>
              {tag.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
