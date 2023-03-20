import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState } from "lexical";
import { useEffect } from "react";

export function OnChangePlugin(props: {
  onChange: (editorState: EditorState) => void;
}): null {
  const [editor] = useLexicalComposerContext();
  const { onChange } = props;

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      console.log("Hello")
      onChange(editorState);
    });
  }, [onChange, editor]);
  return null;
}
