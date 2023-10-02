import React, { useEffect } from "react";
import { IScrapEntry } from "../../../../serverApi/IScrapEntry";
import { useAppContext } from "../../../../AppContext";
import { ScrapBody } from "../ScrapBody";
import { ScrapMarkdown } from "./ScrapMarkdown";
import { preloadLazyCodeMirror } from "./MarkdownEditor";
import { ActionFactory } from "../../../common/actions/ActionFactory";

export const ScrapMarkdownBody: React.FC<{
  scrap: IScrapEntry;
  hideDate: boolean;
  hideActions?: boolean;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => Promise<void>;
  cancelEditing: () => void;
  hasFocus?: boolean;
}> = ({
  scrap,
  hideDate,
  hideActions,
  editMode,
  setEditMode,
  value,
  onChange,
  onSave,
  cancelEditing,
  hasFocus,
}) => {
  useEffect(() => preloadLazyCodeMirror(), []);

  const { setAppAlert } = useAppContext();

  return (
    <ScrapBody
      scrap={scrap}
      editMode={editMode}
      setEditMode={setEditMode}
      hideDate={hideDate}
      hideActions={hideActions}
      onSave={onSave}
      cancelEditing={cancelEditing}
      actions={[ActionFactory.copyValueToClipboard(value, setAppAlert)]}
      enableHotkeys={hasFocus}
    >
      <ScrapMarkdown
        keyMappings={{
          "Alt-s": onSave,
          "Alt-x": cancelEditing,
        }}
        isEditMode={editMode}
        value={value}
        onChange={onChange}
      />
    </ScrapBody>
  );
};
