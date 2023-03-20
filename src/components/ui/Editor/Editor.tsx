import { $getRoot, $getSelection, EditorState, LexicalEditor } from "lexical";
import { useEffect, useRef } from "react";
import "./Editor.css";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ToolbarPlugin from "../../../plugins/ToolbarPlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import EditorTheme from "../../../themes/EditorTheme";
import { useDispatch } from "react-redux";
import { setPageDraftBody } from "../../../redux/pages";
import { setUntitledPageBody } from "../../../redux/pages";
import PageChangePlugin from "../../../plugins/PageChangePlugin";
import { emptyEditorState } from "../../../utils/editorUtils";
import { OnChangePlugin } from "../../../plugins/OnChangePlugin";
import { PageState } from "../../../types";

function Editor({ page, bodyFieldRef }: { page: PageState }) {
  const dispatch = useDispatch();
  const editorStateRef = useRef();

  let editorState = emptyEditorState;

  useEffect(() => {
    editorStateRef.current = editorState;
  }, [page]);

  if (page.BODY) {
    editorState = page.BODY;
  }

  const editorConfig = {
    editorState, // pass json string here
    theme: EditorTheme,
    onError: (error) => {
      throw error;
    },
    nodes: [ListItemNode, ListNode, HeadingNode, QuoteNode],
  };

  function onChange(editorState: EditorState, editor: LexicalEditor): void {
    console.log("onChange running", page)
    // editorStateRef.current = editorState;
    if (page.IS_UNTITLED) {
      // if (!page.IS_INITIAL) {
        dispatch(setUntitledPageBody(JSON.stringify(editorState)));
      // }
    } else {
      dispatch(setPageDraftBody({ page, draftBody: JSON.stringify(editorState) }));
    }
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-wrapper" ref={bodyFieldRef}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="content-editable" />}
          placeholder={<div className="placeholder">Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <TabIndentationPlugin />
        <OnChangePlugin onChange={onChange} />
        <PageChangePlugin />
      </div>
    </LexicalComposer>
  );
}

export default Editor;
