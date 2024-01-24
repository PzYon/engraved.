import React, { CSSProperties, useState } from "react";
import { IScrapEntry, ScrapType } from "../../../serverApi/IScrapEntry";
import { AutogrowTextField } from "../../common/AutogrowTextField";
import { ScrapListBody } from "./list/ScrapListBody";
import { ScrapMarkdownBody } from "./markdown/ScrapMarkdownBody";
import { styled, Typography } from "@mui/material";
import { EntryPropsRenderStyle } from "../../common/entries/Entry";

export const ScrapInner: React.FC<{
  scrap: IScrapEntry;
  journalName: string;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  title: string;
  setTitle: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  hideActions?: boolean;
  propsRenderStyle: EntryPropsRenderStyle;
  upsertScrap: (notesToSave?: string) => Promise<void>;
  style?: CSSProperties;
  cancelEditing: () => void;
  hasFocus?: boolean;
}> = ({
  scrap,
  journalName,
  isEditMode,
  setIsEditMode,
  title,
  setTitle,
  notes,
  setNotes,
  hideActions,
  propsRenderStyle,
  upsertScrap,
  style,
  cancelEditing,
  hasFocus,
}) => {
  const [hasTitleFocus, setHasTitleFocus] = useState(false);

  return (
    <div
      style={style}
      onClick={(e) => {
        if (e.detail === 2) {
          setIsEditMode(true);
        }
      }}
      data-testid={"scrap-" + scrap.id}
    >
      {isEditMode ? (
        <AutogrowTextField
          fieldType={"title"}
          placeholder={"Title"}
          variant="outlined"
          value={title}
          disabled={!isEditMode}
          onChange={(event) => setTitle(event.target.value)}
          onFocus={() => setHasTitleFocus(true)}
          onBlur={() => setHasTitleFocus(false)}
          sx={{ width: "100%" }}
        />
      ) : (
        <ReadonlyTitleContainer>{title}</ReadonlyTitleContainer>
      )}

      {scrap.scrapType === ScrapType.List ? (
        <ScrapListBody
          scrap={scrap}
          journalName={journalName}
          propsRenderStyle={propsRenderStyle}
          hideActions={hideActions}
          editMode={isEditMode}
          setEditMode={setIsEditMode}
          hasTitleFocus={hasTitleFocus}
          value={notes}
          onChange={onChange}
          onSave={upsertScrap}
          cancelEditing={cancelEditing}
          hasFocus={hasFocus}
        />
      ) : (
        <ScrapMarkdownBody
          scrap={scrap}
          journalName={journalName}
          propsRenderStyle={propsRenderStyle}
          hideActions={hideActions}
          editMode={isEditMode}
          setEditMode={setIsEditMode}
          value={notes}
          onChange={onChange}
          onSave={upsertScrap}
          cancelEditing={cancelEditing}
          hasFocus={hasFocus}
        />
      )}
    </div>
  );

  function onChange(value: string) {
    setNotes(value);
  }
};

const ReadonlyTitleContainer = styled(Typography)`
  color: ${(p) => p.theme.palette.primary.main};
  font-size: 2rem;
  font-weight: 200;
`;
