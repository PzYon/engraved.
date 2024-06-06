import { MarkdownEditor } from "./MarkdownEditor";
import { FadeInContainer } from "../../../common/FadeInContainer";
import { Markdown } from "./Markdown";
import React from "react";
import { styled } from "@mui/material";
import { ActionFactory } from "../../../common/actions/ActionFactory";
import { ScrapBody } from "../ScrapBody";
import { useAppContext } from "../../../../AppContext";
import { useScrapContext } from "../ScrapContext";
import { useDialogContext } from "../../../layout/dialogs/DialogContext";

export const ScrapMarkdown: React.FC = () => {
  const { setAppAlert } = useAppContext();
  const { renderDialog } = useDialogContext();

  const {
    notes,
    setNotes,
    isEditMode,
    getCancelEditingFunction,
    upsertScrap,
    hasFocus,
    isDirty,
  } = useScrapContext();

  return (
    <ScrapBody
      actions={[ActionFactory.copyValueToClipboard(notes, setAppAlert)]}
    >
      {getContent()}
    </ScrapBody>
  );

  function getContent() {
    if (isEditMode) {
      const cancelEditing = getCancelEditingFunction();

      return (
        <EditorContainer>
          <MarkdownEditor
            showOutlineWhenFocused={true}
            value={notes ?? ""}
            onChange={setNotes}
            keyMappings={{
              "Alt-s": upsertScrap,
              "Alt-x": cancelEditing
                ? ActionFactory.cancelEditing(
                    cancelEditing,
                    hasFocus,
                    isDirty,
                    renderDialog,
                  ).onClick
                : undefined,
            }}
          />
        </EditorContainer>
      );
    }

    return (
      <FadeInContainer>
        <Markdown value={notes} />
      </FadeInContainer>
    );
  }
};

const EditorContainer = styled("div")`
  .cm-editor {
    padding: 0;
  }
`;
