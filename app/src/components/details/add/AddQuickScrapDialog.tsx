import React, { useState } from "react";
import { ScrapType } from "../../../serverApi/IScrapEntry";
import { ScrapsJournalType } from "../../../journalTypes/ScrapsJournalType";
import { styled, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ListScrapIcon, MarkdownScrapIcon } from "../scraps/ScrapsViewPage";
import { Scrap } from "../scraps/Scrap";

export const AddQuickScrapDialog: React.FC<{
  onSuccess?: () => void;
  journalId: string;
}> = ({ onSuccess, journalId }) => {
  const [type, setType] = useState<ScrapType>(ScrapType.Markdown);

  const scrap = ScrapsJournalType.createBlank(journalId, type);

  return (
    <>
      <ScrapTypeSelector>
        <ToggleButtonGroup
          value={type}
          exclusive
          sx={{ width: "100%", ".MuiButtonBase-root": { width: "50%" } }}
          onChange={(_, value) => {
            setType(
              value !== null
                ? value
                : type === ScrapType.Markdown
                ? ScrapType.List
                : ScrapType.Markdown,
            );
          }}
        >
          <ToggleButton value={ScrapType.Markdown} color="primary">
            <MarkdownScrapIcon />
            &nbsp;Markdown
          </ToggleButton>
          <ToggleButton value={ScrapType.List} color="primary">
            <ListScrapIcon />
            &nbsp;List
          </ToggleButton>
        </ToggleButtonGroup>
      </ScrapTypeSelector>
      <Scrap
        scrap={scrap}
        hideDate={true}
        onSuccess={onSuccess}
        style={{ marginTop: "3px" }}
        withoutSection={true}
        key={type}
      />
    </>
  );
};

const ScrapTypeSelector = styled("div")`
  display: flex;
  justify-content: start;
`;
