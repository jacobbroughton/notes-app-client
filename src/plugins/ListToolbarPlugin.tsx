import { useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode } from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

type ListTag = "ol" | "ul" | "checklist";

export function ListToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [dropdownToggled, setDropdownToggled] = useState(false);

  const listTags: ListTag[] = ["ol", "ul", "checklist"];
  const onClick = (e: MouseEvent, tag: ListTag) => {
    e.preventDefault();
    if (tag === "ol") {
      // <OrderedListIcon />
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      // <UnOrderedListIcon />
    } else if (tag === "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else if (tag === "checklist") {
      // <CheckBoxListIcon />
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    }
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    setDropdownToggled(!dropdownToggled);
  };
  return (
    <div className="toolbar-dropdown">
      <button
        className="dropdown-toggle"
        onClick={(e) => {
          e.preventDefault();
          setDropdownToggled(!dropdownToggled);
        }}
      >
        List
      </button>
      {dropdownToggled && (
        <div className="dropdown-options">
          {listTags.map((tag, i) => (
            <button onClick={(e) => onClick(e, tag)} key={i}>
              {tag.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
